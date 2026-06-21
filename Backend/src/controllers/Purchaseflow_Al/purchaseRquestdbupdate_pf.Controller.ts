import { sequelize } from "../../database/connection";

import {
  IPurchaseRequestPf,
  IItemPrRequest,
  IPrtermnscondition,
} from "./Purucahseflow.interface";

// Main function to upsert a purchase request
export async function upsertPurchaseRequest(data: IPurchaseRequestPf) {
  const transaction = await sequelize.transaction();

  try {
    // Check if requestNumber is null, indicating add mode
    const isAddMode = !data.request_number;
    console.log("1");

    // Insert or update header and retrieve requestNumber if in add mode
    console.log(data.request_date);
    console.log(data.description);

    console.log(data.companyCode);

    console.log("before upsertPurchaseRequestHeader");
    if (data.last_action === "POGEN") {
      console.log("inside pogen");

      // Log incoming data for debugging
      console.log("Company Code:", data.companyCode);
      console.log("Original Request Number:", data.request_number);

      // Replace slashes in request number
      let key_request_number = data.request_number.replace(/\//g, "$");
      console.log("Formatted Request Number:", key_request_number);

      try {
        const [rows] = await sequelize.query(
          "CALL PRO_GEN_JESRA_PO_NO(:companyCode, :requestNumber, :userId, :prinCode)",
          {
            replacements: {
              companyCode: data.companyCode, // Ensure this is not undefined
              requestNumber: key_request_number,
              userId: "RIJASC",
              prinCode: "10001",
            },
          }
        );
        console.log("Procedure executed successfully:", rows);
      } catch (error) {
        console.error("Error executing procedure:", error);
        throw error; // Re-throw the error for upstream handling
      }

      return; // Exit after executing the procedure
    }

    const requestNumber = await upsertPurchaseRequestHeader(data, transaction);
    console.log("after upsertPurchaseRequestHeader");
    //const userid = data.updated_by;

    let generatedRequestNumber = data.request_number; // Default to provided requestNumber

    if (isAddMode) {
      console.log("before");

      try {
        // Attempt to get the session code
        const [[{ code }]]: any = await sequelize.query(
          `SELECT code FROM GT_SESSION_INFO WHERE session_id = CONNECTION_ID() LIMIT 1;`,
          { transaction }
        );

        if (code) {
          generatedRequestNumber = code; // If code exists, assign it to generatedRequestNumber
          console.log(`Generated request number: ${generatedRequestNumber}`);
        } else {
          console.log("No session code found, using provided request number.");
        }
      } catch (error) {
        console.error("Error querying GT_SESSION_INFO table:", error);
        console.log("Using provided request number.");
      }
    }

    // Proceed with the upsertPurchaseRequestDetails call using the determined request number
    console.log("header3");
    console.log(`Using request number: ${generatedRequestNumber}`);

    // Insert or update each item in the details using the determined requestNumber
    await upsertPurchaseRequestDetails(
      data.items,
      data.companyCode,
      generatedRequestNumber,
      transaction
    );
    console.log("3");

    await updatetermscondition(
      data.termconditions,
      data.companyCode,
      generatedRequestNumber,
      transaction
    );
    console.log("4");
    await transaction.commit();
    console.log("Purchase request upserted successfully.");
  } catch (error) {
    await transaction.rollback();
    console.error("Error upserting purchase request:", error);
  }
}

// Function to insert or update PURCHASE_REQUEST_HEADER
async function upsertPurchaseRequestHeader(
  data: IPurchaseRequestPf,
  transaction: any
): Promise<string> {
  // If requestNumber is null or an empty string, directly insert a new record
  console.log("header1");
  let ls_new_flag = "No";
  if (!data.request_number || data.request_number === "") {
    ls_new_flag = "Yes";
    console.log("header1a");

    console.log("description", data.description);

    console.log("company_code", data.companyCode);

    console.log("remarks", data.remarks);

    console.log("display all");

    console.log("header1 update statment");

    console.log("description", data.description);

    let ls_flow_type = "PUR";
    //SECOND LINE FOR HARDCODE VALUE

    const insertQuery = `
    INSERT INTO PURCHASE_REQUEST_HEADER_AL (
      REQUEST_NUMBER, REQUEST_DATE, SUPPLIER, DESCRIPTION, REMARKS, AMOUNT, 
      DEPARTMENT_CODE, FLOW_CODE, FLOW_LEVEL_INITIAL, FLOW_LEVEL_RUNNING, FLOW_LEVEL_FINAL, 
      COMPANY_CODE, USER_DT, USER_ID, CURRENCY_RATE, FA_UPLOADED, FINAL_APPROVED, 
      REMARKS_HISTRY, CANCEL_FLAG, TX_CAT_CODE, TX_COMPNTCAT_CODE_1, TX_COMPNTCAT_CODE_2, 
      TX_COMPNTCAT_CODE_3, TX_COMPNTCAT_CODE_4, TX_COMPNT_1_EXPMT, CREATE_USER, CREATE_DATE, 
      CURR_CODE, PO_AMOUNT
    ) VALUES (
      ?, ?, ?, ?, ?, ?, 
      ?, ?, ?, ?, ?, 
      ?, ?, ?, ?, ?, ?, 
      ?, ?, ?, ?, ?, 
      ?, ?, ?, ?, ?, 
      ?
    )
`;

    const [result]: any = await sequelize.query(insertQuery, {
      replacements: [
        data.supplier,
        data.description,
        data.remarks,
        data.amount,
        data.department_code,
        data.flow_code,
        data.flow_level_initial,
        data.flow_level_running,
        data.flow_level_final,
        data.company_code,
        data.user_dt,
        data.user_id,
        data.currency_rate,
        data.fa_uploaded,
        data.final_approved,
        data.remarks_histry,
        data.cancel_flag,
        data.tx_cat_code,
        data.tx_compntcat_code_1,
        data.tx_compntcat_code_2,
        data.tx_compntcat_code_3,
        data.tx_compntcat_code_4,

        data.create_user,
        data.create_date,
        data.curr_code,
        data.po_amount,
      ],
      transaction,
    });

    console.log("header2");
    // Retrieve the generated request number from the insert result

    // Query to get the session code
    /*  const getSessionCode: { code: string }[][] = (await sequelize.query(
      `SELECT code from GT_SESSION_INFO WHERE USERID='${userid}'`
    )) as { code: string }[][];

    // return $code; // Return the newly generated request number
    console.log("header3");
    const generatedRequestNumber = getSessionCode[0][0].code;
    console.log(
      `Inserted new record with request number: ${generatedRequestNumber}`
    );*/
    return data.request_number;
    // return generatedRequestNumber; // Return the newly generated request number
  }
  let key_request_number = data.request_number.replace(/\//g, "$");
  console.log("header4");
  // If requestNumber is provided and is not empty, check if the record exists
  const exists = await headerRecordExists(
    data.request_number,
    data.companyCode,
    transaction
  );

  if (!exists) {
    // Raise an error if the requestNumber does not exist
    throw new Error(
      `Request number ${data.request_number} does not exist in PURCHASE_REQUEST_HEADER.`
    );
  }

  // Update existing record if it exists
  if (ls_new_flag === "No") {
    console.log("update purchase request   No");
    ls_new_flag = "No";
    const updateQuery = `
    UPDATE PURCHASE_REQUEST_HEADER
    SET 
      REQUEST_DATE = ?,
      DESCRIPTION = ?,
      REMARKS = ?,
      AMOUNT = ?,
      DEPARTMENT_CODE = ?,
      FLOW_CODE = ?,
      FLOW_LEVEL_INITIAL = ?,
      FLOW_LEVEL_RUNNING = ?,
      FLOW_LEVEL_FINAL = ?,
      COMPANY_CODE = ?,
      USER_DT = ?,
      USER_ID = ?,
      CURRENCY_RATE = ?,
      FA_UPLOADED = ?,
      FINAL_APPROVED = ?,
      REMARKS_HISTRY = ?,
      CANCEL_FLAG = ?,
      TX_CAT_CODE = ?,
      TX_COMPNTCAT_CODE_1 = ?,
      TX_COMPNTCAT_CODE_2 = ?,
      TX_COMPNTCAT_CODE_3 = ?,
      TX_COMPNTCAT_CODE_4 = ?,
      TX_COMPNT_1_EXPMT = ?,
      CREATE_USER = ?,
      CREATE_DATE = ?,
      CURR_CODE = ?,
      PO_AMOUNT = ?,
      LAST_UPDATED = ?,
      LAST_ACTION = ?,
      HISTORY_SERIAL = 1, -- Static value
      COST_CODE = ?,
      REQUEST_HOD_USER = ?
    WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?;
`;

    console.log("flow_level_running", data.flow_level_running);

    const replacements = [
      data.request_date,
      data.description,
      data.remarks,
      data.amount,
      data.department_code,
      data.flow_code,
      data.flow_level_initial,
      data.flow_level_running,
      data.flow_level_final,
      data.companyCode,
      data.user_dt,
      data.user_id,
      data.currency_rate,
      data.fa_uploaded,
      data.final_approved,
      data.remarks_histry,
      data.cancel_flag,
      data.tx_cat_code,
      data.tx_compntcat_code_1,
      data.tx_compntcat_code_2,
      data.tx_compntcat_code_3,
      data.tx_compntcat_code_4,

      data.create_user,
      data.create_date,
      data.curr_code,
      data.po_amount,
      data.last_updated,
      data.last_action,
      data.cost_code,
      data.request_hod_user,
      key_request_number,
      data.companyCode,
    ];

    // Log each replacement value with its index
    replacements.forEach((value, index) => {
      console.log(`Replacement [${index}]:`, value);
    });

    await sequelize.query(updateQuery, {
      replacements,
      transaction,
    });
    console.log(
      `Updated existing record for request number: ${data.request_number}`
    );
  }
  return data.request_number; // Return the existing request number
}

// Function to insert or update PURCHASE_REQUEST_DETAILS items
async function upsertPurchaseRequestDetails(
  items: IItemPrRequest[],
  companyCode: string,
  requestNumber: string,
  transaction: any
) {
  try {
    let key_request_number = requestNumber.replace(/\//g, "$");
    // Step 1: Delete existing records for the given request_number and company_code
    const deleteQuery = `
      DELETE FROM PURCHASE_REQUEST_DETAILS
      WHERE request_number = ? AND company_code = ?;
    `;
    await sequelize.query(deleteQuery, {
      replacements: [key_request_number, companyCode],
      transaction,
    });
    console.log(
      `Deleted existing records for request_number ${requestNumber} and company_code ${companyCode}`
    );

    // Step 2: Insert new records for each item
    for (const item of items) {
      //  console.log("10", item.last_action); 15
      const insertQuery = `
      INSERT INTO PURCHASE_REQUEST_DETAIL_AL (
        REQUEST_NUMBER, COMPANY_CODE, ITEM_CODE, ITEM_DESP, ITEM_GROUP_DESC, ITEM_GROUP_CODE, ITEM_RATE, ITEM_QTY, 
        CURRENCY_RATE, AMOUNT, CURR_CODE, TX_CAT_CODE, TX_COMPNTCAT_CODE_1, TX_COMPNT_PERC_1, TX_COMPNT_AMT_1, 
        TX_COMPNT_LCURAMT_1, TX_COMPNT_1_EXPMT, LCURR_AMT, ALLOCATED_APPROVED_QUANTITY, SELECTED_ITEM, 
        LAST_ACTION, HISTORY_SERIAL, CURR_NAME, ITEM_SRNO, SUPPLIER_PART_CODE, RATE_METHODE, ITEM_CANCEL, 
        TAX_NAME, COST_CODE, CAPEX, USER_DT, USER_ID
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
  `;

      await sequelize.query(insertQuery, {
        replacements: [
          item.request_number, // REQUEST_NUMBER
          item.company_code, // COMPANY_CODE
          item.item_code, // ITEM_CODE
          item.item_desp, // ITEM_DESP
          item.item_group_desc, // ITEM_GROUP_DESC
          item.item_group_code, // ITEM_GROUP_CODE
          item.item_rate, // ITEM_RATE
          item.item_qty, // ITEM_QTY
          item.currency_rate, // CURRENCY_RATE
          item.amount, // AMOUNT
          item.curr_code, // CURR_CODE
          item.tx_cat_code, // TX_CAT_CODE
          item.tx_compntcat_code_1, // TX_COMPNTCAT_CODE_1
          item.tx_compnt_perc_1, // TX_COMPNT_PERC_1
          item.tx_compnt_amt_1, // TX_COMPNT_AMT_1
          item.tx_compnt_lcuramt_1, // TX_COMPNT_LCURAMT_1
          item.tx_compnt_1_expmt, // TX_COMPNT_1_EXPMT
          item.lcurr_amt, // LCURR_AMT
          item.allocated_approved_quantity, // ALLOCATED_APPROVED_QUANTITY
          item.selected_item, // SELECTED_ITEM
          item.last_action, // LAST_ACTION
          item.history_serial, // HISTORY_SERIAL
          item.curr_name, // CURR_NAME
          item.item_srno, // ITEM_SRNO
          item.supplier_part_code, // SUPPLIER_PART_CODE
          item.rate_methode, // RATE_METHODE
          item.item_canel, // ITEM_CANCEL
          item.tax_name, // TAX_NAME
          item.cost_code, // COST_CODE
          item.capex, // CAPEX
          item.user_dt, // USER_DT
          item.user_id, // USER_ID
        ],
        transaction,
      });

      console.log(`Inserted new record for item ${item.item_code}`);
    }
  } catch (error) {
    console.error("Error in upserting purchase request details:", error);
    throw error; // Re-throw error to be handled by the caller if needed
  }
}

// Function to check if a header record exists
async function headerRecordExists(
  requestNumber: string,
  companyCode: string,
  transaction: any
): Promise<boolean> {
  if (requestNumber == null) {
    return false; // Return false if requestNumber is null
  }

  const query = `
    SELECT count(*) FROM PURCHASE_REQUEST_HEADER
    WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?;
  `;
  const [results] = await sequelize.query(query, {
    replacements: [requestNumber, companyCode],
    transaction,
  });

  return results.length > 0;
}

// Function to check if a detail record exists
async function detailRecordExists(
  requestNumber: string,
  companyCode: string,
  itemCode: string,
  transaction: any
): Promise<boolean> {
  const query = `
    SELECT 1 FROM PURCHASE_REQUEST_DETAILS
    WHERE request_number = ? AND company_code = ? AND item_code = ?;
  `;
  const [results] = await sequelize.query(query, {
    replacements: [requestNumber, companyCode, itemCode],
    transaction,
  });
  return results.length > 0;
}

async function updatetermscondition(
  termconditions: IPrtermnscondition[],
  companyCode: string,
  requestNumber: string,
  transaction: any
) {
  try {
    let key_request_number = requestNumber.replace(/\//g, "$");

    // Step 1: Delete existing records for the given request_number and company_code
    const deleteQuery = `
      DELETE FROM PR_SUPPL_TERM_COND
      WHERE request_number = ? AND company_code = ?;
    `;
    await sequelize.query(deleteQuery, {
      replacements: [key_request_number, companyCode],
      transaction,
    });
    console.log(
      `Deleted existing records for request_number ${requestNumber} and company_code ${companyCode}`
    );

    // Step 2: Insert new records for each item in the termconditions array
    for (const Termscondition of termconditions) {
      const insertQuery = `
        INSERT INTO PR_SUPPL_TERM_COND(request_number, company_code, supplier, remarks, dlvr_term, payment_terms, quatation_reference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;

      await sequelize.query(insertQuery, {
        replacements: [
          key_request_number,
          companyCode,
          Termscondition.tsupplier,
          Termscondition.remarks,
          Termscondition.dlvr_term,
          Termscondition.payment_terms,
          Termscondition.quotation_reference, // Corrected spelling
          Termscondition.delivery_address,
        ],
        transaction,
      });
      //  await transaction.commit();
      // Log the inserted record, typically log more meaningful info
      console.log(
        `Inserted new record for supplier ${Termscondition.tsupplier}`
      );
    }
  } catch (error) {
    console.error("Error in upserting purchase request details:", error);
    throw error; // Re-throw error to be handled by the caller if needed
  }
}
