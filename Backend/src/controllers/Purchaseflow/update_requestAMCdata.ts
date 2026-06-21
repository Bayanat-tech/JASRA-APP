import { Request, Response } from "express";
import { sequelize } from "../../database/connection";
import { Transaction } from "sequelize";

// ✅ Interface Definition
export interface TAMCdata {
  DESCRIPTION: string;
  REQUEST_NUMBER: string;
  AMC_FROM: Date;
  AMC_TO: Date;
  TYPE_OF_CONTRACT: string;
  COMPANY_CODE: string;
}

// ✅ Express-Compatible Route Handler
export async function upsertAMCDetails(req: Request, res: Response): Promise<void> {
  let transaction: Transaction | undefined;
  const transactionState = { committed: false, rolledBack: false };

  try {
    const data: TAMCdata = req.body;

    transaction = await sequelize.transaction();

    const exists = await recordExists(data.REQUEST_NUMBER, data.COMPANY_CODE, transaction);

    if (exists) {
      await updateAMCDetails(data, transaction);
    } else {
      throw new Error(`Record does not exist for REQUEST_NUMBER: ${data.REQUEST_NUMBER}`);
    }

    await transaction.commit();
    transactionState.committed = true;

    res.status(200).json({
      success: true,
      message: "AMC details updated successfully",
      requestNumber: data.REQUEST_NUMBER,
    });
  } catch (error) {
    if (transaction && !transactionState.committed && !transactionState.rolledBack) {
      try {
        await transaction.rollback();
        transactionState.rolledBack = true;
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }

    console.error("Error in upsertAMCDetails:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update AMC details",
      error: (error as Error).message,
    });
  }
}

// ✅ Internal function to update AMC details
async function updateAMCDetails(data: TAMCdata, transaction: Transaction) {
  const sql = `
    UPDATE PURCHASE_REQUEST_HEADER SET
      AMC_FROM = ?,
      AMC_TO = ?,
      TYPE_OF_CONTRACT = ?,
      DESCRIPTION = ?,
      HISTORY_SERIAL = 0
    WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?;
  `;

  const params = [
    data.AMC_FROM,
    data.AMC_TO,
    data.TYPE_OF_CONTRACT,
    data.DESCRIPTION,
    data.REQUEST_NUMBER,
    data.COMPANY_CODE,
  ];

  await sequelize.query(sql, { replacements: params, transaction });
}

// ✅ Internal function to check if record exists
async function recordExists(
  requestNumber: string,
  companyCode: string,
  transaction: Transaction
): Promise<boolean> {
  const [results]: any = await sequelize.query(
    `
    SELECT 1 
    FROM PURCHASE_REQUEST_HEADER 
    WHERE REQUEST_NUMBER = ? AND COMPANY_CODE = ?
    LIMIT 1
    `,
    {
      replacements: [requestNumber, companyCode],
      transaction,
    }
  );

  return results.length > 0;
}
