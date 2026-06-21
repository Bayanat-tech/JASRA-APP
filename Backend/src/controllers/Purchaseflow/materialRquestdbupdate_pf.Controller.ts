
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"; // your oracledb pool
import { Request, Response } from "express";
import { QueryTypes, Transaction } from "sequelize";
import { NextFunction } from "express";
import { IFiles, RequestWithUser } from "../../interfaces/common.interface";
import {
  IMaterialRequestPf,
  IItemMrRequest,
} from "../../interfaces/Purchaseflow/Materialflow.interface";
import constants from "../../helpers/constants";
import { createLog, notifyUser } from "../../helpers/functions";
import { formatDate } from "../../utils/formatDate";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOnDeadlock<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && error.original?.code === "ER_LOCK_DEADLOCK") {
      await sleep(RETRY_DELAY);
      return retryOnDeadlock(operation, retries - 1);
    }
    throw error;
  }
}

// Main upsert function
export async function upsertMaterialRequest(connection: oracledb.Connection, data: IMaterialRequestPf) {
  const transactionState = {
    committed: false,
    rolledBack: false,
  };

  let generatedRequestNumber: string | undefined = data.request_number;

  try {
    // Core DB operations
    const requestNumber = await upsertMaterialRequestHeader(connection, data);

    // If adding a new record, generate request number from session info (Oracle equivalent)
    if (!data.request_number) {
      const result = await connection.execute<{ CODE: string }>(
        `SELECT code FROM GT_SESSION_INFO WHERE session_id = SYS_CONTEXT('USERENV','SID')`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows && result.rows.length > 0 && result.rows[0].CODE) {
        generatedRequestNumber = result.rows[0].CODE;
      }
    }

    // Upsert the detail records
    await upsertMaterialRequestDetails(
      connection,
      data.items ?? [],
      data.company_code ?? '',
      generatedRequestNumber ?? ''
    );

    // Commit transaction
    await connection.commit();
    transactionState.committed = true;

    // Notification without email template
    if (data.last_action !== 'SAVEASDRAFT') {
      try {
        const request_users = await getRequestUsers(connection, data);
        const cc = ''; // No CC
        await notifyUser({
          event: constants.EVENTS.TRANSACTION_COMPLETED,
          request_users,
          cc,
          message: '',
          htmlMessage: '',
        });
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
      }
    }

    return generatedRequestNumber ?? '';
  } catch (error) {
    if (!transactionState.committed && !transactionState.rolledBack) {
      try {
        await connection.rollback();
        transactionState.rolledBack = true;
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    throw error;
  }
}


async function processMaterialRequest(
  connection: oracledb.Connection,
  data: IMaterialRequestPf
): Promise<string> {
  let generatedRequestNumber: string | undefined;
  const transactionState = { committed: false, rolledBack: false };

  try {
    // Start a transaction (Oracle auto-begins when using the connection)
    // Upsert material request details
    await upsertMaterialRequestDetails(
      connection,
      data.items ?? [],
      data.company_code ?? '',
      generatedRequestNumber ?? ''
    );

    // Commit the transaction
    await connection.commit();
    transactionState.committed = true;

    // Notification without email template
    if (data.last_action !== 'SAVEASDRAFT') {
      try {
        const request_users = await getRequestUsers(connection, data);
        if (!generatedRequestNumber) {
          throw new Error('generatedRequestNumber is undefined');
        }

        // Currently cc list is empty
        const cc = '';

        await notifyUser({
          event: constants.EVENTS.TRANSACTION_COMPLETED,
          request_users,
          cc,
          message: '', // Optional plain text
          htmlMessage: '', // No HTML template
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    return generatedRequestNumber ?? '';
  } catch (error) {
    // Rollback if needed
    if (!transactionState.committed && !transactionState.rolledBack) {
      try {
        await connection.rollback();
        transactionState.rolledBack = true;
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    throw error;
  }
}


// Helper functions

async function getRequestUsers(
  connection: oracledb.Connection,
  data: IMaterialRequestPf
): Promise<string> {
  // Call the stored procedure
  await connection.execute(
    `BEGIN
       PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, '');
     END;`,
    {
      screen: 'PRSUBMIT',
      type: 'success',
      document_number: data.request_number,
      userId: data.updated_by,
    }
  );

  // Call the function to get email_cc
  const result = await connection.execute<{ EMAIL_CC: string }>(
    `SELECT FUN_EMAIL_SENT_STRING(:companyCode, FUN_GET_FLOW_ROLE_AL(:updatedBy, :companyCode)) AS EMAIL_CC
       FROM dual`,
    {
      companyCode: data.company_code,
      updatedBy: data.updated_by,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows && result.rows.length > 0 ? result.rows[0].EMAIL_CC : '';
}


async function getCCList(
  connection: oracledb.Connection,
  data: IMaterialRequestPf,
  request_users: string,
  requestNumber: string
): Promise<string> {
  const result = await connection.execute<{ EMAIL_CC: string }>(
    `SELECT FUN_EMAIL_CC_STRING(:companyCode, :createdBy, :request_users, :requestNumber) AS EMAIL_CC
       FROM dual`,
    {
      companyCode: data.company_code,
      createdBy: data.created_by,
      request_users,      // match the parameter name exactly
      requestNumber,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // Type-safe access
  return result.rows && result.rows.length > 0 ? result.rows[0].EMAIL_CC : '';
}


async function upsertMaterialRequestHeader(
  connection: oracledb.Connection,
  data: IMaterialRequestPf
): Promise<string> {
  const safeDate = (val: any) => (val ? new Date(val) : null);
  const safeString = (val: any) => (typeof val === 'string' ? val : '');
  const safeNumber = (val: any) => (typeof val === 'number' ? val : 0);

  let isNew = false;

  if (!data.request_number || data.request_number === '') {
    isNew = true;
    // Generate a new request number here if needed, e.g. from a sequence
    // data.request_number = await generateRequestNumber(connection, data.company_code);

    const insertQuery = `
      INSERT INTO MATERIAL_REQUEST_HEADER (
        REQUESTOR_NAME, NEED_BY_DATE,
        REQUEST_NUMBER, REQUEST_DATE, DESCRIPTION, REMARKS, AMOUNT,
        FLOW_CODE, FLOW_LEVEL_INITIAL, FLOW_LEVEL_RUNNING, FLOW_LEVEL_FINAL,
        COMPANY_CODE, CREATE_USER, CREATE_DATE, LAST_UPDATED, LAST_ACTION,
        HISTORY_SERIAL, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, FLOW_TYPE
      ) VALUES (
        :requestor_name, :need_by_date,
        :request_number, :request_date, :description, :remarks, :amount,
        :flow_code, :flow_level_initial, :flow_level_running, :flow_level_final,
        :company_code, :create_user, :create_date, :last_updated, :last_action,
        :history_serial, :created_at, :created_by, :updated_at, :updated_by, :flow_type
      )
    `;

    await connection.execute(insertQuery, {
      requestor_name: safeString(data.requestor_name),
      need_by_date: safeDate(data.need_by_date),
      request_number: safeString(data.request_number),
      request_date: safeDate(data.request_date),
      description: safeString(data.description),
      remarks: safeString(data.remarks),
      amount: safeNumber(data.amount),
      flow_code: safeString(data.flow_code) || '003',
      flow_level_initial: safeNumber(data.flow_level_initial) || 1,
      flow_level_running: safeNumber(data.flow_level_running) || 1,
      flow_level_final: safeNumber(data.flow_level_final) || 3,
      company_code: safeString(data.company_code),
      create_user: safeString(data.create_user),
      create_date: safeDate(data.create_date),
      last_updated: safeDate(data.last_updated),
      last_action: safeString(data.last_action),
      history_serial: 1,
      created_at: new Date(),
      created_by: safeString(data.created_by),
      updated_at: safeDate(data.updated_at),
      updated_by: safeString(data.updated_by),
      flow_type: safeString(data.flow_type) || 'MAT',
    });

    await connection.commit();
    return data.request_number ?? '';
  }

  // Update path
  const key_request_number = (data.request_number ?? '').replace(/\//g, '$');

  // Check if header exists
  const headerExistsResult = await connection.execute(
    `SELECT 1 FROM MATERIAL_REQUEST_HEADER 
     WHERE REQUEST_NUMBER = :request_number AND COMPANY_CODE = :company_code AND ROWNUM = 1`,
    { request_number: key_request_number, company_code: data.company_code },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (!Array.isArray(headerExistsResult.rows) || headerExistsResult.rows.length === 0) {
    throw new Error(`Request number ${data.request_number} does not exist in MATERIAL_REQUEST_HEADER.`);
  }

  const updateQuery = `
    UPDATE MATERIAL_REQUEST_HEADER SET
      REQUESTOR_NAME = :requestor_name,
      NEED_BY_DATE = :need_by_date,
      REQUEST_DATE = :request_date,
      DESCRIPTION = :description,
      REMARKS = :remarks,
      AMOUNT = :amount,
      DEPARTMENT_CODE = :department_code,
      FLOW_CODE = :flow_code,
      FLOW_LEVEL_INITIAL = :flow_level_initial,
      FLOW_LEVEL_RUNNING = :flow_level_running,
      FLOW_LEVEL_FINAL = :flow_level_final,
      COMPANY_CODE = :company_code,
      CURRENCY_RATE = :currency_rate,
      USER_DT = :user_dt,
      USER_ID = :user_id,
      FA_UPLOADED = :fa_uploaded,
      FINAL_APPROVED = :final_approved,
      REMARKS_HISTRY = :remarks_histry,
      CURR_CODE = :curr_code,
      CREATE_USER = :create_user,
      CREATE_DATE = :create_date,
      LAST_UPDATED = :last_updated,
      LAST_ACTION = :last_action,
      HISTORY_SERIAL = :history_serial,
      ATTACH_FILE_NAME = :attach_file_name,
      ATTACH_FILE_NAME1 = :attach_file_name1,
      ATTACH_FILE_NAME2 = :attach_file_name2,
      REJECT_HISTRY = :reject_histry,
      SENDBACK_HISTRY = :sendback_histry,
      REQ_DOC_NO = :req_doc_no,
      REQ_DIV_CODE = :req_div_code,
      COST_CODE = :cost_code,
      PO_AMOUNT = :po_amount,
      DOC_DATE = :doc_date,
      PROJECT_CODE = :project_code,
      STATUS = :status,
      PROJECT_PR_NO = :project_pr_no,
      DIV_CODE = :div_code,
      FINAL_APPROVED_DATE = :final_approved_date,
      CREATED_AT = :created_at,
      CREATED_BY = :created_by,
      UPDATED_AT = :updated_at,
      UPDATED_BY = :updated_by,
      FLOW_TYPE = :flow_type,
      PROJECT_CODE_FROM = :project_code_from,
      PROJECT_CODE_TO = :project_code_to
    WHERE REQUEST_NUMBER = :request_number AND COMPANY_CODE = :company_code
  `;

  await connection.execute(updateQuery, {
    requestor_name: safeString(data.requestor_name),
    need_by_date: safeDate(data.need_by_date),
    request_date: safeDate(data.request_date),
    description: safeString(data.description),
    remarks: safeString(data.remarks),
    amount: safeNumber(data.amount),
    department_code: safeString(data.department_code),
    flow_code: safeString(data.flow_code),
    flow_level_initial: safeNumber(data.flow_level_initial),
    flow_level_running: safeNumber(data.flow_level_running),
    flow_level_final: safeNumber(data.flow_level_final),
    company_code: safeString(data.company_code),
    currency_rate: safeNumber(data.currency_rate),
    user_dt: safeDate(data.user_dt),
    user_id: safeString(data.user_id),
    fa_uploaded: safeString(data.fa_uploaded),
    final_approved: safeString(data.final_approved),
    remarks_histry: safeString(data.remarks_histry),
    curr_code: safeString(data.curr_code),
    create_user: safeString(data.create_user),
    create_date: safeDate(data.create_date),
    last_updated: safeDate(data.last_updated),
    last_action: safeString(data.last_action),
    history_serial: 1,
    attach_file_name: safeString(data.attach_file_name),
    attach_file_name1: safeString(data.attach_file_name1),
    attach_file_name2: safeString(data.attach_file_name2),
    reject_histry: safeString(data.reject_histry),
    sendback_histry: safeString(data.sendback_histry),
    req_doc_no: safeString(data.req_doc_no),
    req_div_code: safeString(data.req_div_code),
    cost_code: safeString(data.cost_code),
    po_amount: safeNumber(data.po_amount),
    doc_date: safeDate(data.doc_date),
    project_code: safeString(data.projectCode),
    status: safeString(data.status),
    project_pr_no: safeString(data.project_pr_no),
    div_code: safeString(data.div_code),
    final_approved_date: safeDate(data.final_approved_date),
    created_at: new Date(),
    created_by: safeString(data.created_by),
    updated_at: safeDate(data.updated_at),
    updated_by: safeString(data.updated_by),
    flow_type: safeString(data.flow_type),
    project_code_from: safeString(data.project_code_from),
    project_code_to: safeString(data.project_code_to),
    request_number: key_request_number,
  });

  await connection.commit();
  return data.request_number ?? '';
}




async function headerRecordExists(
  connection: oracledb.Connection,
  requestNumber: string,
  companyCode: string
): Promise<boolean> {
  const key_request_number = requestNumber.replace(/\//g, "$");

  const result = await connection.execute(
    `
      SELECT 1
      FROM MATERIAL_REQUEST_HEADER
      WHERE request_number = :request_number
        AND company_code = :company_code
        AND ROWNUM = 1
    `,
    {
      request_number: key_request_number,
      company_code: companyCode,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // Always return a boolean
  return Array.isArray(result.rows) && result.rows.length > 0;
}



async function detailRecordExists(
  connection: oracledb.Connection,
  requestNumber: string,
  companyCode: string
): Promise<boolean> {
  const key_request_number = requestNumber.replace(/\//g, "$");

  const result = await connection.execute(
    `
      SELECT 1
      FROM MATERIAL_REQUEST_DETAILS
      WHERE request_number = :request_number
        AND company_code = :company_code
        AND ROWNUM = 1
    `,
    {
      request_number: key_request_number,
      company_code: companyCode,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // Ensure we always return a boolean
  return Array.isArray(result.rows) && result.rows.length > 0;
}





async function upsertMaterialRequestDetails(
  connection: oracledb.Connection,
  items: IItemMrRequest[],
  companyCode: string,
  requestNumber: string
) {
  // Sort items by sequence number
  const sortedItems = [...items].sort((a, b) => {
    const seqA = a.item_sequence_no ?? Number.MAX_SAFE_INTEGER;
    const seqB = b.item_sequence_no ?? Number.MAX_SAFE_INTEGER;
    return seqA - seqB;
  });

  // Replace "/" with "$" in request number
  const key_request_number = requestNumber.replace(/\//g, "$");

  // Delete existing records
  await connection.execute(
    `DELETE FROM MATERIAL_REQUEST_DETAILS 
     WHERE request_number = :request_number 
       AND company_code = :company_code`,
    {
      request_number: key_request_number,
      company_code: companyCode,
    }
  );

  // Insert new records
  const insertQuery = `
    INSERT INTO MATERIAL_REQUEST_DETAILS (
      request_number, company_code, item_code, item_rate, item_p_qty,
      history_serial, item_srno, p_uom, from_cost_code, to_cost_code,
      from_project_code, to_project_code, l_uom, item_l_qty
    ) VALUES (
      :request_number, :company_code, :item_code, :item_rate, :item_p_qty,
      :history_serial, :item_srno, :p_uom, :from_cost_code, :to_cost_code,
      :from_project_code, :to_project_code, :l_uom, :item_l_qty
    )
  `;

  for (const item of sortedItems) {
    await connection.execute(
      insertQuery,
      {
        request_number: key_request_number,
        company_code: companyCode,
        item_code: item.item_code ?? '',
        item_rate: item.item_rate ?? 0,
        item_p_qty: item.item_p_qty ?? 0,
        history_serial: 1,
        item_srno: item.item_sequence_no ?? 0,
        p_uom: item.p_uom ?? '',
        from_cost_code: item.from_cost_code ?? '',
        to_cost_code: item.to_cost_code ?? '',
        from_project_code: item.from_project_code ?? '',
        to_project_code: item.to_project_code ?? '',
        l_uom: item.l_uom ?? '',
        item_l_qty: item.item_l_qty ?? 0,
      }
    );
  }

  // Commit the transaction
  await connection.commit();
}
