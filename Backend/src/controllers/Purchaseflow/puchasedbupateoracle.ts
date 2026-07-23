import { IPurchaseRequestPf ,
  IItemPrRequest,
  IPrtermnscondition,
} from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

import { notifyUser } from "../../helpers/functions";
import constants from "../../helpers/constants";
import { format } from 'date-fns';

interface PurchaseRequestHeaderRow {
  CREATED_BY: string;
}
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOnError<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const errorCode = error.errorNum || error.code;
    const retryableErrors = [60, 12514, 12505, 12154]; // deadlock, listener not reached, etc.
    if (retries > 0 && (retryableErrors.includes(errorCode) || error.message?.includes('NJS-040'))) {
      console.warn(`[retryOnError] Retrying operation due to error ${errorCode}: ${error.message}`);
      await sleep(RETRY_DELAY);
      return retryOnError(operation, retries - 1);
    }
    throw error;
  }
}

// ----------------------
// Main function
// ----------------------
export async function upsertPurchaseRequest(data: IPurchaseRequestPf): Promise<string> {
  let connection: oracledb.Connection | undefined;

  try {
    connection = await oracleDb.getConnection();

    await connection.execute("BEGIN NULL; END;");

    let generatedRequestNumber = data.requestNumber;

    // Handle POGEN case separately
    if (data.last_action === "POGEN" && data.requestNumber) {
      const key_request_number = data.requestNumber.replace(/\//g, "$");
      console.log('inside POGEN');
      await connection.execute(
        `BEGIN PRO_GEN_JESRA_PO_NO(:companyCode, :requestNumber, :userId, :prinCode); END;`,
        {
          companyCode: data.companyCode,
          requestNumber: key_request_number,
          userId: "RIJASC",
          prinCode: "10001",
        }
      );
      await connection.commit();
      return key_request_number;
    }

    // ----------------------
    // 1. Insert/update header
    // ----------------------
    generatedRequestNumber = await upsertPurchaseRequestHeader(data, connection);

    // ----------------------
    // 2. Insert/update details
    // ----------------------
    await upsertPurchaseRequestDetails(
      data.div_code ?? "",
      data.items,
      data.companyCode,
      generatedRequestNumber,
      data.projectCode,
      connection
    );

    // ----------------------
    // 3. Insert/update terms & conditions
    // ----------------------
    await updatetermscondition(
      data.termconditions,
      data.companyCode,
      generatedRequestNumber,
      connection
    );

    // Commit transaction
    await connection.commit();

    // ----------------------
    // 4. Send notification email if not draft
    // ----------------------
    if (data.last_action !== "SAVEASDRAFT") {
      try {
        const request_users = await getRequestUsers(data, connection);
        const cc = await getCCList(data, request_users, generatedRequestNumber, connection);
        console.log("Request user: ", request_users)

        const createdByResult = await connection.execute<PurchaseRequestHeaderRow>(
          `SELECT CREATED_BY FROM PURCHASE_REQUEST_HEADER WHERE REQUEST_NUMBER = :requestNumber`,
          { requestNumber: generatedRequestNumber.replace(/\//g, "$") },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const createdBy = createdByResult.rows?.[0]?.CREATED_BY ?? "Unknown";

        const htmlMessage = await generateEmailTemplate(data, generatedRequestNumber, createdBy);

        await notifyUser({
          event: constants.EVENTS.TRANSACTION_COMPLETED,
          request_users,
          cc,
          message: "",
          htmlMessage,
        });
        console.log("Send notification:",notifyUser)
      } catch (emailError) {
        console.error("Error sending notification:", emailError);
      }
    }

    return generatedRequestNumber;
  } catch (error) {
    // Rollback if error occurs
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }
    throw error;
  } finally {
    // Close connection safely
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
}


export async function getRequestUsers(
  data: IPurchaseRequestPf,
  connection?: oracledb.Connection
): Promise<string> {
  let conn: oracledb.Connection | undefined = connection;

  try {
    if (!conn) {
      conn = await oracleDb.getConnection();
    }
    
    // First, execute the procedure
    await conn.execute(
      `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, :emptyStr); END;`,
      {
        screen: "PRSUBMIT",
        type: "success",
        document_number: data.requestNumber,
        userId: data.updated_by,
        emptyStr: "",
      }
    );

    // Get the flow role first
    let userRole = "";
    try {
      const roleResult = await conn.execute<{ ROLE_NAME: string }>(
        `SELECT FUN_GET_FLOW_ROLE_JAS(:updatedBy, :companyCode) AS ROLE_NAME FROM DUAL`,
        {
          updatedBy: data.updated_by,
          companyCode: data.companyCode,
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      userRole = roleResult.rows?.[0]?.ROLE_NAME || "";
    } catch (error: any) {
      console.error("[getRequestUsers] Error getting role:", error.message);
      if (error.message.includes("ORA-01422")) {
        console.warn("[getRequestUsers] Function returned multiple rows, using fallback");
        // Fallback: try to get role from user mapping
        try {
          const fallbackResult = await conn.execute<{ ROLE_NAME: string }>(
            `SELECT MAX(role_name) AS ROLE_NAME FROM ms_ps_user_role_mapping WHERE user_name = :user`,
            { user: data.updated_by },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );
          userRole = fallbackResult.rows?.[0]?.ROLE_NAME || "";
        } catch (fallbackError) {
          console.error("[getRequestUsers] Fallback also failed:", fallbackError);
        }
      }
    }
    
    if (!userRole) {
      console.warn("[getRequestUsers] No role found for user", {
        updatedBy: data.updated_by,
        companyCode: data.companyCode
      });
      return "";
    }

    // Direct query to replace FUN_EMAIL_SENT_STRING
    const queryResult = await conn.execute<{ CONTACT_EMAIL: string }>(
      `SELECT DISTINCT b.contact_email
       FROM ms_ps_user_role_mapping a
       JOIN sec_login b ON a.user_name = b.loginid
       WHERE b.company_code = :companyCode
         AND a.company_code = :companyCode
         AND a.user_role = :userRole
         AND b.contact_email IS NOT NULL`,
      {
        companyCode: data.companyCode,
        userRole: userRole
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Build email list
    const emails: string[] = [];
    
    if (queryResult.rows) {
      for (const row of queryResult.rows) {
        const email = (row as any).CONTACT_EMAIL;
        if (email && email.trim() !== "") {
          emails.push(email.trim());
        }
      }
    }

    return emails.join(';');
    
  } catch (error: any) {
    console.error("Error fetching request users:", error);
    
    // Fallback logic - try to get at least some emails
    try {
      if (conn) {
        const fallbackResult = await conn.execute<{ CONTACT_EMAIL: string }>(
          `SELECT contact_email FROM sec_login 
           WHERE loginid = :userId AND company_code = :companyCode
           AND contact_email IS NOT NULL`,
          {
            userId: data.updated_by,
            companyCode: data.companyCode
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        const email = fallbackResult.rows?.[0]?.CONTACT_EMAIL;
        return email || "";
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
    
    return "";
  } finally {
    if (!connection && conn) {
      try {
        await conn.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
}

export async function getCCList(
  data: IPurchaseRequestPf,
  request_users: string,
  requestNumber: string,
  connection?: oracledb.Connection
): Promise<string> {
  let conn: oracledb.Connection | undefined = connection;

  try {
    if (!conn) {
      conn = await oracleDb.getConnection();
    }
    const formattedRequestNumber = requestNumber.replace(/\//g, "$");

    const creatorResult = await conn.execute<{ CONTACT_EMAIL: string }>(
      `SELECT contact_email
       FROM SEC_LOGIN
       WHERE loginid = :createdBy
         AND company_code = :companyCode`,
      {
        createdBy: data.created_by,
        companyCode: data.companyCode
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const creatorEmail = creatorResult.rows?.[0]?.CONTACT_EMAIL || "";

    const statsResult = await conn.execute<{ CONTACT_EMAIL: string }>(
      `SELECT DISTINCT b.contact_email
       FROM PURCHASE_REQUST_RUNING_STATS a
       JOIN SEC_LOGIN b ON a.LAST_UPDATED = b.loginid
       WHERE a.request_number = :requestNumber
         AND b.company_code = :companyCode
         AND a.company_code = :companyCode
         AND b.contact_email IS NOT NULL`,
      {
        requestNumber: formattedRequestNumber,
        companyCode: data.companyCode
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const ccEmails = new Set<string>();
    
    if (creatorEmail) {
      ccEmails.add(creatorEmail.trim());
    }

    if (statsResult.rows) {
      const toEmails = request_users.split(';').map(email => email.trim().toLowerCase());
      
      for (const row of statsResult.rows) {
        const email = (row as any).CONTACT_EMAIL?.trim();
        if (email && email !== "") {
          const emailLower = email.toLowerCase();
          
          if (toEmails.includes(emailLower)) {
            continue;
          }
          
          if (creatorEmail && emailLower === creatorEmail.trim().toLowerCase()) {
            continue;
          }
          
          ccEmails.add(email);
        }
      }
    }
    return Array.from(ccEmails).join(';');

  } catch (error: any) {
    console.error("Error fetching CC list:", error);
    try {
      if (conn && data.created_by) {
        const fallbackResult = await conn.execute<{ CONTACT_EMAIL: string }>(
          `SELECT contact_email FROM SEC_LOGIN 
           WHERE loginid = :createdBy AND company_code = :companyCode`,
          {
            createdBy: data.created_by,
            companyCode: data.companyCode
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        const email = fallbackResult.rows?.[0]?.CONTACT_EMAIL;
        return email || "";
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
    
    return "";
  } finally {
    if (!connection && conn) {
      try {
        await conn.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
}

export async function upsertPurchaseRequestHeader(
  data: IPurchaseRequestPf,
  connection: oracledb.Connection
): Promise<string> {
  if (!connection) {
    throw new Error("Oracle connection is required");
  }

  let ls_new_flag = "No";
  console.log('after mapping');
  console.log(`contract_soft_hard: ${data.contract_soft_hard}`);
console.log(`amc_service_status: ${data.amc_service_status}`);
console.log(`material_mechanical: ${data.material_mechanical}`);
console.log(`material_electrical: ${data.material_electrical}`);
console.log(`material_plumbing: ${data.material_plumbing}`);
console.log(`material_tools: ${data.material_tools}`);
console.log(`material_civil: ${data.material_civil}`);
console.log(`material_ac: ${data.material_ac}`);
console.log(`material_cleaning: ${data.material_cleaning}`);
console.log(`material_other: ${data.material_other}`);
console.log(`services_temp_staff: ${data.services_temp_staff}`);
console.log(`services_rentals: ${data.services_rentals}`);
console.log(`services_subcon_conslt: ${data.services_subcon_conslt}`);
console.log(`services_other: ${data.services_other}`);
console.log(`other_stationery: ${data.other_stationery}`);
console.log(`other_it: ${data.other_it}`);
console.log(`other_new_uniform_ppe: ${data.other_new_uniform_ppe}`);
console.log(`other_rplcmt_uniform: ${data.other_rplcmt_uniform}`);
console.log(`other_other: ${data.other_other}`);
console.log(`good_material_request: ${data.good_material_request}`);
console.log(`service_request: ${data.service_request}`);
console.log(`type_of_contract: ${data.type_of_contract}`);
console.log(`type_of_pr: ${data.type_of_pr}`);
  // New record insertion
  if (!data.requestNumber || data.requestNumber.trim() === "") {
    ls_new_flag = "Yes";

    const insertSql = `
      INSERT INTO PURCHASE_REQUEST_HEADER (
        AMC_FROM, AMC_TO, DIV_CODE, ACCOMMODATION, CATERING, LAUNDRY_HOUSEKEEPING,
        MEDICAL, TRANSPORTATION, TRAINING, RECRUITMENT_HR, UNIFORM, STATIONARY,
        IT_TECH, FURNITURE, ENTERTAINMENT, BARBER, OTHERS, REQUESTOR_NAME,
        CONTRACT_SOFT_HARD, AMC_SERVICE_STATUS, MATERIAL_MECHANICAL, MATERIAL_ELECTRICAL,
        MATERIAL_PLUMBING, MATERIAL_TOOLS, MATERIAL_CIVIL, MATERIAL_AC, MATERIAL_CLEANING,
        MATERIAL_OTHER, SERVICES_TEMP_STAFF, SERVICES_RENTALS, SERVICES_SUBCON_CONSLT,
        SERVICES_OTHER, OTHER_STATIONERY, OTHER_IT, OTHER_NEW_UNIFORM_PPE,
        OTHER_RPLCMT_UNIFORM, OTHER_OTHER, GOOD_MATERIAL_REQUEST, SERVICE_REQUEST,
        TYPE_OF_CONTRACT, TYPE_OF_MATERIAL_SUPPLY, REMARKS, WO_NUMBER, REQUEST_DATE,
        DESCRIPTION, PROJECT_CODE, COMPANY_CODE, CREATED_BY, LAST_ACTION, LAST_UPDATED,
        FLOW_TYPE, FLOW_CODE, HISTORY_SERIAL, UPDATED_AT, SERVICE_TYPE, NEED_BY_DATE,
        TYPE_OF_PR, COVERED_BY_CONTRACT_YES, FLAG_SHARING_COST, BUDGETED_YES, CHECKED_STORE_YES
      ) VALUES (
        :amc_from, :amc_to, :div_code, :accommodation, :catering, :laundry_housekeeping,
        :medical, :transportation, :training, :recruitment_hr, :uniform, :stationary,
        :it_tech, :furniture, :entertainment, :barber, :others, :requestor_name,
        :contract_soft_hard, :amc_service_status, :material_mechanical, :material_electrical,
        :material_plumbing, :material_tools, :material_civil, :material_ac, :material_cleaning,
        :material_other, :services_temp_staff, :services_rentals, :services_subcon_conslt,
        :services_other, :other_stationery, :other_it, :other_new_uniform_ppe,
        :other_rplcmt_uniform, :other_other, :good_material_request, :service_request,
        :type_of_contract, :type_of_material_supply, :remarks, :wo_number, :request_date,
        :description, :project_code, :company_code, :created_by, :last_action, :updated_by,
        'PUR', '001', 1, SYSTIMESTAMP, :service_type, :need_by_date,
        :type_of_pr, :covered_by_contract_yes, :flag_sharing_cost, :budgeted_yes, :checked_store_yes
      )
    `;


    await connection.execute(insertSql, {
      amc_from: data.amc_from,
      amc_to: data.amc_to,
      div_code: data.div_code,
      accommodation: data.accommodation,
      catering: data.catering,
      laundry_housekeeping: data.laundry_housekeeping,
      medical: data.medical,
      transportation: data.transportation,
      training: data.training,
      recruitment_hr: data.recruitment_hr,
      uniform: data.uniform,
      stationary: data.stationary,
      it_tech: data.it_tech,
      furniture: data.furniture,
      entertainment: data.entertainment,
      barber: data.barber,
      others: data.others,
      requestor_name: data.requestor_name,
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
      request_date: data.requestDate,
      description: data.description,
      project_code: data.projectCode,
      company_code: data.companyCode,
      created_by: data.created_by,
      last_action: data.last_action,
      updated_by: data.updated_by,
      service_type: data.service_type,
      need_by_date: data.need_by_date,
      type_of_pr: data.type_of_pr,
      covered_by_contract_yes: data.covered_by_contract_yes,
      flag_sharing_cost: data.flag_sharing_cost,
      budgeted_yes: data.budgeted_yes,
      checked_store_yes: data.checked_store_yes,
    }, { autoCommit: false });

    return data.requestNumber; // For Oracle, return input or generate sequence separately
  }

  // Existing record update
  const key_request_number = data.requestNumber.replace(/\//g, "$");
  const exists = await headerRecordExists(key_request_number, data.companyCode, connection);
  if (!exists) {
    throw new Error(`Request number ${data.requestNumber} does not exist in PURCHASE_REQUEST_HEADER.`);
  }

  const updateSql = `
    UPDATE PURCHASE_REQUEST_HEADER
    SET
       HISTORY_SERIAL = 1,
      ACCOMMODATION = :accommodation,
      CATERING = :catering,
      LAUNDRY_HOUSEKEEPING = :laundry_housekeeping,
      MEDICAL = :medical,
      TRANSPORTATION = :transportation,
      TRAINING = :training,
      RECRUITMENT_HR = :recruitment_hr,
      UNIFORM = :uniform,
      STATIONARY = :stationary,
      IT_TECH = :it_tech,
      FURNITURE = :furniture,
      ENTERTAINMENT = :entertainment,
      BARBER = :barber,
      OTHERS = :others,
      REQUESTOR_NAME = :requestor_name,
      REQUEST_DATE = :request_date,
      DESCRIPTION = :description,
      PROJECT_CODE = :project_code,
      UPDATED_BY = :updated_by,
      LAST_UPDATED = :last_updated,
      WO_NUMBER = :wo_number,
      REMARKS = :remarks,
      TYPE_OF_CONTRACT = :type_of_contract,
      AMC_FROM = :amc_from,
      AMC_TO = :amc_to,
      TYPE_OF_MATERIAL_SUPPLY = :type_of_material_supply,
      CONTRACT_SOFT_HARD = :contract_soft_hard,
      AMC_SERVICE_STATUS = :amc_service_status,
      MATERIAL_MECHANICAL= :material_mechanical,
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
      SERVICE_TYPE = :service_type,
      NEED_BY_DATE = :need_by_date,
      TYPE_OF_PR = :type_of_pr,
      COVERED_BY_CONTRACT_YES = :covered_by_contract_yes,
      FLAG_SHARING_COST = :flag_sharing_cost,
      BUDGETED_YES = :budgeted_yes,
      CHECKED_STORE_YES = :checked_store_yes,
      FLOW_LEVEL_RUNNING = :flow_level_running
    WHERE REQUEST_NUMBER = :request_number
      AND COMPANY_CODE = :company_code
  `;
console.log('data.type_of_material_supply',data.type_of_material_supply)
console.log('data.contract_soft_hard', data.contract_soft_hard)
console.log('data.amc_service_status', data.amc_service_status)

  await connection.execute(updateSql, {
    last_updated: data.last_updated ,
    accommodation: data.accommodation,
    catering: data.catering,
    laundry_housekeeping: data.laundry_housekeeping,
    medical: data.medical,
    transportation: data.transportation,
    training: data.training,
    recruitment_hr: data.recruitment_hr,
    uniform: data.uniform,
    stationary: data.stationary,
    it_tech: data.it_tech,
    furniture: data.furniture,
    entertainment: data.entertainment,
    barber: data.barber,
    others: data.others,
    requestor_name: data.requestor_name,
    request_date: data.requestDate,
    description: data.description,
    project_code: data.projectCode,
    updated_by: data.updated_by,
    wo_number: data.wo_number,
    remarks: data.remarks,
    type_of_contract: data.type_of_contract,
    amc_from: data.amc_from,
    amc_to: data.amc_to,
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
    service_type: data.service_type,
    need_by_date: data.need_by_date,
    type_of_pr: data.type_of_pr,
    covered_by_contract_yes: data.covered_by_contract_yes,
    flag_sharing_cost: data.flag_sharing_cost,
    budgeted_yes: data.budgeted_yes,
    checked_store_yes: data.checked_store_yes,
    flow_level_running: data.flow_level_running,
    request_number: key_request_number,
    company_code: data.companyCode,
  }, { autoCommit: false });

  return data.requestNumber;
}

/**
 * Insert or update PURCHASE_REQUEST_DETAILS items in Oracle
 */
export async function upsertPurchaseRequestDetails(
  div_code: string,
  items: IItemPrRequest[],
  companyCode: string,
  requestNumber: string,
  projectCode: string,
  connection: oracledb.Connection
) {
  if (!connection) throw new Error("Oracle connection is required");

  // Replace slashes in request number
  let key_request_number = requestNumber.replace(/\//g, "$");

  // ----------------------------------------
  // 1️⃣ If request_number is empty → fetch from GT_SESSION_INFO
  // ----------------------------------------
  if (!key_request_number || key_request_number.trim() === "") {
    const result = await connection.execute<{
      CODE: string;
    }>(
      `SELECT CODE FROM GT_SESSION_INFO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows && result.rows.length > 0) {
      key_request_number = (result.rows[0] as any).CODE;
    } else {
      throw new Error("GT_SESSION_INFO returned no CODE value");
    }
  }

  // ----------------------------------------
  // 2️⃣ DELETE existing detail lines
  // ----------------------------------------
  const deleteSql = `
    DELETE FROM PURCHASE_REQUEST_DETAILS
    WHERE request_number = :request_number
      AND company_code = :company_code
  `;

  await connection.execute(deleteSql, {
    request_number: key_request_number,
    company_code: companyCode,
  });

  // ----------------------------------------
  // 3️⃣ SORT items by sequence number
  // ----------------------------------------
  const sortedItems = [...items].sort((a, b) => {
    const seqA = a.item_sequence_no ?? Number.MAX_SAFE_INTEGER;
    const seqB = b.item_sequence_no ?? Number.MAX_SAFE_INTEGER;
    return seqA - seqB;
  });

  // ----------------------------------------
  // 4️⃣ INSERT new detail records
  // ----------------------------------------
  const insertSql = `
    INSERT INTO PURCHASE_REQUEST_DETAILS (
      currency_rate, request_number, company_code, item_code, item_rate, amount, cost_code,
      service_rm_flag, item_p_qty, p_uom, item_l_qty, l_uom,
      allocated_approved_quantity, discount_amount, final_rate, addl_item_desc,
      upp, supplier, prin_code, project_code, div_code, item_sequence_no, curr_code
    ) VALUES (
      :currency_rate, :request_number, :company_code, :item_code, :item_rate, :amount, :cost_code,
      :service_rm_flag, :item_p_qty, :p_uom, :item_l_qty, :l_uom,
      :allocated_approved_quantity, :discount_amount, :final_rate, :addl_item_desc,
      :upp, :supplier, :prin_code, :project_code, :div_code, :item_sequence_no, :curr_code
    )
  `;

  for (const item of sortedItems) {
    await connection.execute(insertSql, {
      currency_rate: item.currency_rate,
      request_number: key_request_number,
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
      discount_amount: item.discount_amount,
      final_rate: item.final_rate,
      addl_item_desc: item.addl_item_desc,
      upp: item.upp,
      supplier: item.supplier,
      prin_code: "10001",
      project_code: projectCode,
      div_code: div_code,
      item_sequence_no: item.item_sequence_no,
      curr_code: item.curr_code,
    });
  }

  // ----------------------------------------
  // 5️⃣ Call stored procedure for PO validation
  // ----------------------------------------
  await connection.execute(
    `BEGIN PRO_CHECK_OLD_PO_AMOUNT(:company_code, :request_number); END;`,
    {
      company_code: companyCode,
      request_number: key_request_number,
    }
  );
}

/**
 * Check if a header record exists in Oracle
 */
export async function headerRecordExists(
  requestNumber: string,
  companyCode: string,
  connection: oracledb.Connection
): Promise<boolean> {
  if (!connection) throw new Error("Oracle connection is required");
  if (!requestNumber) return false;

  const result = await connection.execute<{ COUNT: number }>(
    `
    SELECT COUNT(*) AS COUNT
    FROM PURCHASE_REQUEST_HEADER
    WHERE REQUEST_NUMBER = :request_number
      AND COMPANY_CODE = :company_code
  `,
    {
      request_number: requestNumber,
      company_code: companyCode,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // Safely get COUNT value with fallback 0
  const count = result.rows?.[0]?.COUNT ?? 0;

  return count > 0;
}

/**
 * Check if a detail record exists in Oracle
 */
export async function detailRecordExists(
  requestNumber: string,
  companyCode: string,
  itemCode: string,
  connection: oracledb.Connection
): Promise<boolean> {
  if (!connection) throw new Error("Oracle connection is required");

  const result = await connection.execute<{ COUNT: number }>(
    `
    SELECT COUNT(*) AS COUNT
    FROM PURCHASE_REQUEST_DETAILS
    WHERE request_number = :request_number
      AND company_code = :company_code
      AND item_code = :item_code
  `,
    {
      request_number: requestNumber,
      company_code: companyCode,
      item_code: itemCode,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const count = result.rows?.[0]?.COUNT ?? 0;

  return count > 0;
}



export async function updatetermscondition(
  termconditions: IPrtermnscondition[],
  companyCode: string,
  requestNumber: string,
  connection: oracledb.Connection
) {
  if (!connection) throw new Error("Oracle connection is required");

  const key_request_number = requestNumber.replace(/\//g, "$");

  try {
    // Step 1: Delete existing records
    const deleteSql = `
      DELETE FROM PR_SUPPL_TERM_COND
      WHERE request_number = :request_number
        AND company_code = :company_code
    `;

    await connection.execute(deleteSql, {
      request_number: key_request_number,
      company_code: companyCode,
    }, { autoCommit: false });

    console.log(
      `Deleted existing records for request_number ${requestNumber} and company_code ${companyCode}`
    );

    if (!termconditions || termconditions.length === 0) {
      console.log("No term conditions received from backend.");
      return;
    }

    // Step 2: Insert new records
    const insertSql = `
      INSERT INTO PR_SUPPL_TERM_COND (
        request_number, company_code, supplier, remarks, dlvr_term, payment_terms, quatation_reference, delivery_address
      ) VALUES (
        :request_number, :company_code, :supplier, :remarks, :dlvr_term, :payment_terms, :quotation_reference, :delivery_address
      )
    `;

    for (const term of termconditions) {
      await connection.execute(insertSql, {
        request_number: key_request_number,
        company_code: companyCode,
        supplier: term.tsupplier,
        remarks: term.remarks,
        dlvr_term: term.dlvr_term,
        payment_terms: term.payment_terms,
        quotation_reference: term.quotation_reference,
        delivery_address: term.delivery_address,
      }, { autoCommit: false });

      console.log(`Inserted new record for supplier ${term.tsupplier}`);
    }

  } catch (error) {
    console.error("Error in upserting purchase request term conditions:", error);
    throw error;
  }
}
export async function generateEmailTemplate(
  data: IPurchaseRequestPf,
  requestNumber: string,
  createdBy: string
): Promise<string> {

  const formatRequestNumber = (num: string) => num ? num.replace(/\$/g, "/") : "";
  const formatDate = (date: Date) => format(date, 'dd-MMM-yyyy HH:mm');

  const formattedRequestNumber = formatRequestNumber(requestNumber);

  console.log("Generating email template for request number:", requestNumber);

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height:1.6; color:#333; padding:10px; background-color:#f5f5f5; }
  .container { max-width:600px; margin:0 auto; background:#fff; border-radius:8px; border:1px solid #2c3e50; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
  .header { background:#2c3e50; color:#fff; padding:15px; text-align:center; }
  .header h1 { margin:0; font-size:20px; }
  .notification-header { background:#ecf0f1; padding:12px; text-align:center; font-weight:bold; color:#666; }
  .content { padding:15px; }
  .detail-row { margin-bottom:8px; display:flex; flex-direction:column; padding:8px; border-bottom:1px solid #eee; }
  .detail-label { font-weight:bold; color:#7f8c8d; margin-bottom:4px; }
  .detail-value { padding-left:8px; word-break:break-word; }
  .footer { padding:15px; text-align:center; font-size:12px; color:#000; border-top:1px solid #2c3e50; }
  .link { color:#3498db; text-decoration:none; display:inline-block; padding:4px 0; }
  .link:hover { text-decoration:underline; }
</style>
</head>
<body>
<div class="container">
  <div class="header"><h1>N O T I F I C A T I O N</h1></div>
  <div class="notification-header">An Item has been Assigned to you</div>
  <div class="content">
    <div class="detail-row">
      <span class="detail-label">Link to Item:</span>
      <span class="detail-value"><a href="https://qa-app.bayanattechnology.com/login" class="link">${formattedRequestNumber}</a></span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Description:</span>
      <span class="detail-value">A Purchase Request Number ${formattedRequestNumber} initiated by ${createdBy} is now with you for the next step</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Initiated By:</span>
      <span class="detail-value">${createdBy}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Initiated On:</span>
      <span class="detail-value">${formatDate(data.created_at)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Current Status:</span>
      <span class="detail-value">${data.last_action}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Last Modified By:</span>
      <span class="detail-value">${data.updated_by}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Last Modified On:</span>
      <span class="detail-value">${formatDate(new Date())}</span>
    </div>
  </div>
  <div class="footer">
    Powered by Bayanat Technology – Procurement Management System (PMS)
  </div>
</div>
</body>
</html>`;
}
