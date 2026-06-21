import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Handles saving expense adjustments and calls the AMC procedure.
 */
export const handleSaveExpSamt = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  const { company_code, request_number, expense_data } = req.body;

  if (!company_code || !request_number || !Array.isArray(expense_data) || expense_data.length === 0) {
    res.status(400).json({ 
      success: false, 
      message: "company_code, request_number, and expense_data are required." 
    });
    return;
  }

  try {
    // Get Oracle connection
    connection = await oracleDb.getConnection();
    if (!connection) throw new Error("Failed to get Oracle connection");

    // Start transaction (Oracle transactions start automatically)
    
    // 1️⃣ Delete existing rows for the request
    await connection.execute(
      `DELETE FROM GT_EXPENSE_ADJ 
       WHERE COMPANY_CODE = :company_code AND REQUEST_NUMBER = :request_number`,
      { company_code, request_number }
    );

    // 2️⃣ Insert multiple rows from frontend
    for (const row of expense_data) {
      // Convert "June 2025" → "2025-06-01"
      const parsedDate = new Date(`${row.REQUEST_DATE} 1`); // Add day 1
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const firstDay = `${year}-${month}-01`;

      await connection.execute(
        `INSERT INTO GT_EXPENSE_ADJ (COMPANY_CODE, REQUEST_NUMBER, REQUEST_DATE, NEW_ADJ_AMOUNT)
         VALUES (:company_code, :request_number, TO_DATE(:request_date, 'YYYY-MM-DD'), :new_adj_amount)`,
        {
          company_code,
          request_number,
          request_date: firstDay,
          new_adj_amount: row.NEW_ADJ_AMOUNT
        }
      );
    }

    // 3️⃣ Call procedure to process PURCHASE_REQUEST_DETAILS_AMC
    await connection.execute(
      `BEGIN PROC_ADJAMT_PURCHASE_REQUEST_DETAILS_AMC(:company_code, :request_number); END;`,
      { company_code, request_number }
    );

    // 4️⃣ Commit transaction
    await connection.commit();

    res.status(200).json({
      success: true,
      message: "GT_EXPENSE_ADJ processed and PROC_ADJAMT_PURCHASE_REQUEST_DETAILS_AMC executed successfully.",
    });

  } catch (error: any) {
    // Rollback if connection exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("❌ Error rolling back transaction:", rollbackError);
      }
    }

    console.error("❌ Error in handleSaveExpSamt:", error);
    res.status(500).json({
      success: false,
      message: "Error while processing GT_EXPENSE_ADJ",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    // Close connection if exists
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("❌ Error closing Oracle connection:", closeError);
      }
    }
  }
};
