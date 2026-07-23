import oracledb from "oracledb";
import {
  IPurchaseRequestPf,
  IItemPrRequest,
  IPrtermnscondition,
} from "../../../../interfaces/Purchaseflow/Purucahseflow.interface";
import { notifyUser } from "../../../../helpers/functions";
import constants from "../../../../helpers/constants";
import { oracleDb } from "../../../../database/connection";

export async function upsertPurchaseRequest(data: IPurchaseRequestPf) {
  let connection: oracledb.Connection | undefined;

  try {
    // 🔥 Start Oracle Transaction
    connection = await oracleDb.getConnection();
    await connection.execute("BEGIN NULL; END;"); // Ensures session ready
    await connection.execute("SAVEPOINT start_trx");

    const isAddMode = !data.requestNumber;
    let generatedRequestNumber = data.requestNumber;

    console.log("DATA AFTER SUBMIT", data);

    // ---------------------------------------------------------------------
    // 1️⃣ SPECIAL CASE: If last_action = 'POGEN' → Run Procedure PRO_GEN_JESRA_PO_NO
    // ---------------------------------------------------------------------
    if (data.last_action === "POGEN") {
      const key_request_number = data.requestNumber.replace(/\//g, "$");

      try {
        console.log("🟦 Running Oracle Procedure PRO_GEN_JESRA_PO_NO");

        await connection.execute(
          `
          BEGIN
            PRO_GEN_JESRA_PO_NO(
              :companyCode,
              :requestNumber,
              :userId,
              :prinCode
            );
          END;
        `,
          {
            companyCode: data.companyCode,
            requestNumber: key_request_number,
            userId: "RIJASC",
            prinCode: "10001",
          }
        );

        console.log("Procedure executed successfully.");
      } catch (err) {
        console.error("Error executing Oracle procedure:", err);
        throw err;
      }

      return; // STOP HERE
    }

    // ---------------------------------------------------------------------
    // 2️⃣ UPSERT HEADER → return request number
    // ---------------------------------------------------------------------
    const requestNumber = await upsertPurchaseRequestHeader(data, connection);
    const userid = data.updated_by;

    // ---------------------------------------------------------------------
    // 3️⃣ If ADD MODE → Fetch auto-generated session code from GT_SESSION_INFO
    // ---------------------------------------------------------------------
    if (isAddMode) {
      try {
        console
        const result = await connection.execute(
          `
          SELECT CODE 
          FROM GT_SESSION_INFO
          WHERE SESSION_ID = SYS_CONTEXT('USERENV','SID') 
          AND ROWNUM = 1
        `,
          [],
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const row: any = result.rows?.[0];

        if (row?.CODE) {
          generatedRequestNumber = row.CODE;
          console.log("Generated Oracle request number:", generatedRequestNumber);
        } else {
          console.log("No session code found.");
        }
      } catch (err) {
        console.error("Error reading GT_SESSION_INFO:", err);
      }
    }

    // ---------------------------------------------------------------------
    // 4️⃣ Upsert Details
    // ---------------------------------------------------------------------
    await upsertPurchaseRequestDetails(
      data.items,
      data.companyCode,
      generatedRequestNumber,
      data.projectCode,
      connection
    );

    // ---------------------------------------------------------------------
    // 5️⃣ Upsert Terms & Conditions
    // ---------------------------------------------------------------------
    await updatetermscondition(
      data.termconditions,
      data.companyCode,
      generatedRequestNumber,
      connection
    );

    // ---------------------------------------------------------------------
    // 6️⃣ COMMIT ORACLE TRANSACTION
    // ---------------------------------------------------------------------
    await connection.commit();
    console.log("Oracle transaction committed successfully.");

    // ---------------------------------------------------------------------
    // 7️⃣ Fetch Email Users: FUN_EMAIL_SENT_STRING
    // ---------------------------------------------------------------------
    let request_users = "";

    try {
      const result = await connection.execute(
        `
        SELECT FUN_EMAIL_SENT_STRING(
          :companyCode,
          FUN_GET_FLOW_ROLE_AL(:updatedBy, :companyCode)
        ) AS EMAIL_CC
        FROM DUAL
      `,
        {
          companyCode: data.companyCode,
          updatedBy: data.updated_by,
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      request_users = (result.rows?.[0] as any)?.EMAIL_CC || "";
      console.log("Email TO List:", request_users);
    } catch (err) {
      console.error("Error fetching email list:", err);
    }

    // ---------------------------------------------------------------------
    // 8️⃣ Fetch CC Email List
    // ---------------------------------------------------------------------
    let cc = "";

    try {
      const result = await connection.execute(
        `
        SELECT FUN_EMAIL_CC_STRING(
          :companyCode,
          :createdBy,
          :requestUsers,
          :requestNumber
        ) AS EMAIL_CC
        FROM DUAL
      `,
        {
          companyCode: data.companyCode,
          createdBy: data.created_by,
          requestUsers: request_users,
          requestNumber: generatedRequestNumber,
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      cc = (result.rows?.[0] as any)?.EMAIL_CC || "";
      console.log("Email CC List:", cc);
    } catch (err) {
      console.error("Error fetching CC list:", err);
    }

    // ---------------------------------------------------------------------
    // 9️⃣ SEND NOTIFICATION
    // ---------------------------------------------------------------------
    let message = `
An Item has been Assigned to you

In Request, the item ${generatedRequestNumber} initiated by ${data.created_by} 
is now with you for the next step

Purchase Request No - ${generatedRequestNumber}

Initiated By: ${data.created_by}
Initiated At: ${data.created_at.toISOString()}

Status: ${data.last_action}

Last Modified By: ${data.updated_by}
Last Modified At: ${new Date().toISOString()}
`;

    await notifyUser({
      event: constants.EVENTS.TRANSACTION_COMPLETED,
      request_users,
      cc,
      message,
    });

    console.log("Notification email sent.");
  } catch (error) {
    console.error("Error upserting purchase request:", error);

    if (connection) {
      await connection.execute("ROLLBACK TO SAVEPOINT start_trx");
      console.log("Oracle transaction rolled back.");
    }
  } finally {
    if (connection) await connection.close();
  }
}


// Function to insert or update PURCHASE_REQUEST_HEADER using Oracle
async function upsertPurchaseRequestHeader(
  data: IPurchaseRequestPf,
  connection: oracledb.Connection
): Promise<string> {
  console.log("header1");
  let ls_new_flag = "No";

  // -------------------------------------------------------------
  // 1️⃣ INSERT MODE (new request)
  // -------------------------------------------------------------
  if (!data.requestNumber || data.requestNumber === "") {
    ls_new_flag = "Yes";
    
    // Ensure optional fields are set
    data.service_type = data.service_type || "";
    data.type_of_pr = data.type_of_pr || "";
    data.covered_by_contract_yes = data.covered_by_contract_yes || "No";
    data.flag_sharing_cost = data.flag_sharing_cost || "No";
    data.budgeted_yes = data.budgeted_yes || "No";
    data.checked_store_yes = data.checked_store_yes || "No";

    console.log("Header Insert Mode for user:", data.updated_by);

    const insertSql = `
      INSERT INTO PURCHASE_REQUEST_HEADER (
        CONTRACT_SOFT_HARD, AMC_SERVICE_STATUS, MATERIAL_MECHANICAL, MATERIAL_ELECTRICAL, MATERIAL_PLUMBING,
        MATERIAL_TOOLS, MATERIAL_CIVIL, MATERIAL_AC, MATERIAL_CLEANING, MATERIAL_OTHER,
        SERVICES_TEMP_STAFF, SERVICES_RENTALS, SERVICES_SUBCON_CONSLT, SERVICES_OTHER,
        OTHER_STATIONERY, OTHER_IT, OTHER_NEW_UNIFORM_PPE, OTHER_RPLCMT_UNIFORM, OTHER_OTHER,
        GOOD_MATERIAL_REQUEST, SERVICE_REQUEST, TYPE_OF_CONTRACT, TYPE_OF_MATERIAL_SUPPLY,
        REMARKS, WO_NUMBER, REQUEST_DATE, DESCRIPTION, PROJECT_CODE, COMPANY_CODE,
        CREATED_BY, LAST_ACTION, LAST_UPDATED,
        FLOW_TYPE, FLOW_CODE, HISTORY_SERIAL, UPDATED_AT,
        SERVICE_TYPE, TYPE_OF_PR, COVERED_BY_CONTRACT_YES, FLAG_SHARING_COST,
        BUDGETED_YES, CHECKED_STORE_YES
      ) VALUES (
        :contract_soft_hard, :amc_service_status, :material_mechanical, :material_electrical, :material_plumbing,
        :material_tools, :material_civil, :material_ac, :material_cleaning, :material_other,
        :services_temp_staff, :services_rentals, :services_subcon_conslt, :services_other,
        :other_stationery, :other_it, :other_new_uniform_ppe, :other_rplcmt_uniform, :other_other,
        :good_material_request, :service_request, :type_of_contract, :type_of_material_supply,
        :remarks, :wo_number, :requestDate, :description, :projectCode, :companyCode,
        :created_by, :last_action, :updated_by,
        'PUR', '001', 1, CURRENT_TIMESTAMP,
        :service_type, :type_of_pr, :covered_by_contract_yes, :flag_sharing_cost,
        :budgeted_yes, :checked_store_yes
      )
    `;

    await connection.execute(
      insertSql,
      {
        contract_soft_hard: data.contract_soft_hard,
        amc_service_status: data.amc_service_status,
        material_mechanical: data.material_mechanical,
        material_electrical: data.material_electrical,
        material_plumbing: data.material_plumbing,
        material_tools: data.material_tools,
        material_civil: data.material_civil,
        material_ac: data.material_ac,
        material_cleaning: data.material_cleaning,
        material_other: data.material_other,
        services_temp_staff: data.services_temp_staff,
        services_rentals: data.services_rentals,
        services_subcon_conslt: data.services_subcon_conslt,
        services_other: data.services_other,
        other_stationery: data.other_stationery,
        other_it: data.other_it,
        other_new_uniform_ppe: data.other_new_uniform_ppe,
        other_rplcmt_uniform: data.other_rplcmt_uniform,
        other_other: data.other_other,
        good_material_request: data.good_material_request,
        service_request: data.service_request,
        type_of_contract: data.type_of_contract,
        type_of_material_supply: data.type_of_material_supply,
        remarks: data.remarks,
        wo_number: data.wo_number,
        requestDate: data.requestDate,
        description: data.description,
        projectCode: data.projectCode,
        companyCode: data.companyCode,
        created_by: data.created_by,
        last_action: data.last_action,
        updated_by: data.updated_by,
        service_type: data.service_type,
        type_of_pr: data.type_of_pr,
        covered_by_contract_yes: data.covered_by_contract_yes,
        flag_sharing_cost: data.flag_sharing_cost,
        budgeted_yes: data.budgeted_yes,
        checked_store_yes: data.checked_store_yes,
      },
      { autoCommit: false }
    );

    console.log("header2 → Insert complete");

    return data.requestNumber || ""; // Oracle will set session code later
  }

  // -------------------------------------------------------------
  // 2️⃣ UPDATE MODE
  // -------------------------------------------------------------
  console.log("header4");

  const key_request_number = data.requestNumber.replace(/\//g, "$");

  // Ensure header exists
  const exists = await headerRecordExists(
    data.requestNumber,
    data.companyCode,
    connection
  );

  if (!exists) {
    throw new Error(
      `Request number ${data.requestNumber} does not exist in PURCHASE_REQUEST_HEADER.`
    );
  }

  console.log("Update existing purchase request");

  const updateSql = `
    UPDATE PURCHASE_REQUEST_HEADER
    SET 
      REQUEST_DATE = :requestDate,
      DESCRIPTION = :description,
      PROJECT_CODE = :projectCode,
      UPDATED_BY = :updated_by,
      LAST_UPDATED = :updated_by,
      WO_NUMBER = :wo_number,
      REMARKS = :remarks,
      TYPE_OF_CONTRACT = :type_of_contract,
      TYPE_OF_MATERIAL_SUPPLY = :type_of_material_supply,
      CONTRACT_SOFT_HARD = :contract_soft_hard,
      AMC_SERVICE_STATUS = :amc_service_status,
      MATERIAL_MECHANICAL = :material_mechanical,
      MATERIAL_ELECTRICAL = :material_electrical,
      MATERIAL_PLUMBING = :material_plumbing,
      MATERIAL_TOOLS = :material_tools,
      MATERIAL_CIVIL = :material_civil,
      MATERIAL_AC = :material_ac,
      MATERIAL_CLEANING = :material_cleaning,
      MATERIAL_OTHER = :material_other,
      SERVICES_TEMP_STAFF = :services_temp_staff,
      SERVICES_RENTALS = :services_rentals,
      SERVICES_SUBCON_CONSLT = :services_subcon_conslt,
      SERVICES_OTHER = :services_other,
      OTHER_STATIONERY = :other_stationery,
      OTHER_IT = :other_it,
      OTHER_NEW_UNIFORM_PPE = :other_new_uniform_ppe,
      OTHER_RPLCMT_UNIFORM = :other_rplcmt_uniform,
      OTHER_OTHER = :other_other,
      GOOD_MATERIAL_REQUEST = :good_material_request,
      SERVICE_REQUEST = :service_request,
      LAST_ACTION = :last_action,
      TYPE_OF_PR = :type_of_pr,
      COVERED_BY_CONTRACT_YES = :covered_by_contract_yes,
      FLAG_SHARING_COST = :flag_sharing_cost,
      BUDGETED_YES = :budgeted_yes,
      CHECKED_STORE_YES = :checked_store_yes,
      FLOW_LEVEL_RUNNING = :flow_level_running,
      HISTORY_SERIAL = 1
    WHERE REQUEST_NUMBER = :request_number
      AND COMPANY_CODE = :company_code
  `;

  await connection.execute(
    updateSql,
    {
      requestDate: data.requestDate,
      description: data.description,
      projectCode: data.projectCode,
      updated_by: data.updated_by,
      wo_number: data.wo_number,
      remarks: data.remarks,
      type_of_contract: data.type_of_contract,
      type_of_material_supply: data.type_of_material_supply,
      contract_soft_hard: data.contract_soft_hard,
      amc_service_status: data.amc_service_status,
      material_mechanical: data.material_mechanical,
      material_electrical: data.material_electrical,
      material_plumbing: data.material_plumbing,
      material_tools: data.material_tools,
      material_civil: data.material_civil,
      material_ac: data.material_ac,
      material_cleaning: data.material_cleaning,
      material_other: data.material_other,
      services_temp_staff: data.services_temp_staff,
      services_rentals: data.services_rentals,
      services_subcon_conslt: data.services_subcon_conslt,
      services_other: data.services_other,
      other_stationery: data.other_stationery,
      other_it: data.other_it,
      other_new_uniform_ppe: data.other_new_uniform_ppe,
      other_rplcmt_uniform: data.other_rplcmt_uniform,
      other_other: data.other_other,
      good_material_request: data.good_material_request,
      service_request: data.service_request,
      last_action: data.last_action,
      type_of_pr: data.type_of_pr,
      covered_by_contract_yes: data.covered_by_contract_yes,
      flag_sharing_cost: data.flag_sharing_cost,
      budgeted_yes: data.budgeted_yes,
      checked_store_yes: data.checked_store_yes,
      flow_level_running: data.flow_level_running,
      request_number: key_request_number,
      company_code: data.companyCode,
    },
    { autoCommit: false }
  );

  console.log(`Updated existing record for request number: ${data.requestNumber}`);

  return data.requestNumber;
}





export async function upsertPurchaseRequestDetails(
  items: IItemPrRequest[],
  companyCode: string,
  requestNumber: string,
  projectCode: string,
  connection: oracledb.Connection
): Promise<void> {
  try {
    const key_request_number = requestNumber.replace(/\//g, "$");

    // ----------------------------------------------------
    // 1️⃣ DELETE old items for this request
    // ----------------------------------------------------
    const deleteSql = `
      DELETE FROM PURCHASE_REQUEST_DETAILS
      WHERE request_number = :request_number
        AND company_code = :company_code
    `;

    await connection.execute(
      deleteSql,
      {
        request_number: key_request_number,
        company_code: companyCode,
      },
      { autoCommit: false }
    );

    console.log(
      `🗑 Deleted details for request_number ${requestNumber} / company_code ${companyCode}`
    );

    // ----------------------------------------------------
    // 2️⃣ INSERT new item details
    // ----------------------------------------------------
    const insertSql = `
      INSERT INTO PURCHASE_REQUEST_DETAILS (
        request_number, discount_amount, final_rate, company_code,
        item_code, item_rate, amount, cost_code,
        service_rm_flag, item_p_qty, p_uom, item_l_qty, l_uom,
        allocated_approved_quantity, addl_item_desc, upp, supplier,
        prin_code, project_code, div_code, item_sequence_no
      ) VALUES (
        :request_number, :discount_amount, :final_rate, :company_code,
        :item_code, :item_rate, :amount, :cost_code,
        :service_rm_flag, :item_p_qty, :p_uom, :item_l_qty, :l_uom,
        :allocated_approved_quantity, :addl_item_desc, :upp, :supplier,
        :prin_code, :project_code, :div_code, :item_sequence_no
      )
    `;

    for (const item of items) {

      console.log(`➕ Inserting item: ${item.item_code}`);

      await connection.execute(
        insertSql,
        {
          request_number: key_request_number,
          discount_amount: item.discount_amount,
          final_rate: item.final_rate,
          company_code: companyCode,
          item_code: item.item_code,
          item_rate: item.item_rate,
          amount: item.amount,
          cost_code: item.cost_code,
          service_rm_flag: item.service_rm_flag,
          item_p_qty: item.item_p_qty,
          p_uom: item.p_uom,
          item_l_qty: item.item_l_qty,
          l_uom: item.l_uom,
          allocated_approved_quantity: item.allocated_approved_quantity,
          addl_item_desc: item.addl_item_desc,
          upp: item.upp,
          supplier: item.supplier,
          prin_code: "10001",     // hardcoded as per original code
          project_code: projectCode,
          div_code: "10",         // hardcoded as per original code
          item_sequence_no: item.item_sequence_no,
        },
        { autoCommit: false }
      );

      console.log(`✔ Inserted detail for item ${item.item_code}`);
    }

  } catch (error) {
    console.error("❌ Error upserting PURCHASE_REQUEST_DETAILS:", error);
    throw error;
  }
}



export async function headerRecordExists(
  requestNumber: string,
  companyCode: string,
  connection: oracledb.Connection
): Promise<boolean> {
  if (!requestNumber) return false;

  const sql = `
    SELECT COUNT(*) AS CNT
    FROM PURCHASE_REQUEST_HEADER
    WHERE REQUEST_NUMBER = :request_number
      AND COMPANY_CODE = :company_code
  `;

  const result = await connection.execute<{ CNT: number }>(
    sql,
    { request_number: requestNumber, company_code: companyCode },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // Use type assertion to tell TS that row has CNT
  const count = (result.rows?.[0] as { CNT: number })?.CNT || 0;

  return count > 0;
}

export async function detailRecordExists(
  requestNumber: string,
  companyCode: string,
  itemCode: string,
  connection: oracledb.Connection
): Promise<boolean> {
  const sql = `
    SELECT COUNT(*) AS CNT
    FROM PURCHASE_REQUEST_DETAILS
    WHERE request_number = :request_number
      AND company_code = :company_code
      AND item_code = :item_code
  `;

  const result = await connection.execute<{ CNT: number }>(
    sql,
    { request_number: requestNumber, company_code: companyCode, item_code: itemCode },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const count = (result.rows?.[0] as { CNT: number })?.CNT || 0;

  return count > 0;
}


export async function updatetermscondition(
  termconditions: IPrtermnscondition[],
  companyCode: string,
  requestNumber: string,
  connection: oracledb.Connection
): Promise<void> {
  try {
    const key_request_number = requestNumber.replace(/\//g, "$");

    // ----------------------------------------------------
    // 1️⃣ DELETE old records for this request
    // ----------------------------------------------------
    const deleteSql = `
      DELETE FROM PR_SUPPL_TERM_COND
      WHERE request_number = :request_number
        AND company_code = :company_code
    `;

    await connection.execute(
      deleteSql,
      { request_number: key_request_number, company_code: companyCode },
      { autoCommit: false }
    );

    console.log(
      `Deleted existing PR_SUPPL_TERM_COND for request_number ${requestNumber} and company_code ${companyCode}`
    );

    // ----------------------------------------------------
    // 2️⃣ INSERT new term/condition records
    // ----------------------------------------------------
    const insertSql = `
      INSERT INTO PR_SUPPL_TERM_COND (
        request_number,
        company_code,
        supplier,
        remarks,
        dlvr_term,
        payment_terms,
        quatation_reference,
        delivery_address
      ) VALUES (
        :request_number,
        :company_code,
        :supplier,
        :remarks,
        :dlvr_term,
        :payment_terms,
        :quatation_reference,
        :delivery_address
      )
    `;

    for (const term of termconditions) {
      await connection.execute(
        insertSql,
        {
          request_number: key_request_number,
          company_code: companyCode,
          supplier: term.tsupplier,
          remarks: term.remarks,
          dlvr_term: term.dlvr_term,
          payment_terms: term.payment_terms,
          quatation_reference: term.quotation_reference, // spelling corrected
          delivery_address: term.delivery_address,
        },
        { autoCommit: false }
      );

      console.log(`Inserted new record for supplier ${term.tsupplier}`);
    }
  } catch (error) {
    console.error("Error upserting PR_SUPPL_TERM_COND:", error);
    throw error;
  }
}
