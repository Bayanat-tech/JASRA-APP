import { Request, Response } from 'express';
import { QueryTypes, Transaction } from 'sequelize';
import constants1 from "../../helpers/constants";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"; // your oracledb pool

// Interface for PurchaseRequestHeader type
interface PurchaseRequestHeader {
  recovery_party_code: string;
  recovery_date: Date;
  recovery_remark: string;
  recovery_confirm: string;
  updated_by: string;
  recovery_amount: number;
  type_of_pr: string;
  company_code?: string;
  request_number?: string;
}

// Main Express route handler

export const UpdPurchaseRecoveryData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const values: PurchaseRequestHeader[] = req.body;

  console.log("Inside handleUpdatePurchaseRecoveryData", values);

  if (!Array.isArray(values) || values.length === 0) {
    res.status(400).json({ success: false, message: "Invalid input data. Array expected." });
    return;
  }

  const firstRecord = values[0];
  if (!firstRecord) {
    res.status(400).json({ success: false, message: "No data found" });
    return;
  }

  const { company_code, type_of_pr } = firstRecord;

  if (!company_code || !type_of_pr) {
    res.status(400).json({ success: false, message: "Missing required fields (company_code, type_of_pr)." });
    return;
  }

  let connection: oracledb.Connection | undefined;

  try {
    // Get Oracle connection
    connection = await oracledb.getConnection();

    const updatedRecords = [];

    for (const record of values) {
      const result = await updatePurchaseRecoveryData(connection, record);
      updatedRecords.push(result);
    }

    // Commit the transaction
    await connection.commit();

    res.status(constants1.STATUS_CODES.OK).json({
      success: true,
      message: constants1.MESSAGES.UPDATED_SUCCESSFULLY,
      updatedRecords,
    });
  } catch (error) {
    console.error("Update error:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    res.status(constants1.STATUS_CODES.NOT_FOUND).json({
      success: false,
      message: "Update unsuccessful.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
};


// Function to update a single PurchaseRecoveryData record
export async function updatePurchaseRecoveryData(
  connection: oracledb.Connection,
  record: PurchaseRequestHeader
): Promise<{ company_code?: string; request_number?: string; updatedFields: string[] }> {
  const {
    company_code,
    request_number,
    recovery_date,
    recovery_party_code,
    recovery_remark,
    recovery_confirm,
    updated_by,
  } = record;

  if (
    !company_code ||
    !request_number ||
    !recovery_date ||
    !recovery_party_code ||
    !recovery_remark ||
    !recovery_confirm ||
    !updated_by
  ) {
    throw new Error(`Missing fields in record: ${JSON.stringify(record)}`);
  }

  // Get existing record
  const existingRecord = await getExistingRecord(connection, company_code, request_number);

  let isChanged = false;
  const updatedFields: string[] = [];

  const fieldsToCheck: (keyof PurchaseRequestHeader)[] = [
    'recovery_date',
    'recovery_party_code',
    'recovery_remark',
    'recovery_confirm',
    'updated_by'
  ];

  fieldsToCheck.forEach((field) => {
    if (existingRecord[field] !== record[field]) {
      isChanged = true;
      updatedFields.push(field);
    }
  });

  if (isChanged) {
    const sql = `
      UPDATE PURCHASE_REQUEST_HEADER
      SET recovery_date = :recovery_date,
          recovery_party_code = :recovery_party_code,
          recovery_remark = :recovery_remark,
          recovery_confirm = :recovery_confirm,
          updated_by = :updated_by,
          updated_at = SYSDATE
      WHERE company_code = :company_code
        AND request_number = :request_number
    `;

    const binds = {
      recovery_date,
      recovery_party_code,
      recovery_remark,
      recovery_confirm,
      updated_by,
      company_code,
      request_number,
    };

    console.log("Binds:", binds);

    await connection.execute(sql, binds, { autoCommit: false });
  }

  return { company_code, request_number, updatedFields };
}

// Function to fetch existing record
export async function getExistingRecord(
  connection: oracledb.Connection,
  company_code: string,
  request_number: string
): Promise<PurchaseRequestHeader> {
  const sql = `
    SELECT recovery_party_code, recovery_date, recovery_remark, recovery_confirm, 
           updated_by
    FROM PURCHASE_REQUEST_HEADER
    WHERE company_code = :company_code AND request_number = :request_number
  `;

  const result = await connection.execute<PurchaseRequestHeader>(
    sql,
    {
      company_code,
      request_number,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error(
      `Record with company_code: ${company_code} and request_number: ${request_number} not found.`
    );
  }

  return result.rows[0];
}
