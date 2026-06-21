import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Generates GT_EXPENSE_ADJ by calling the stored procedure
 */
export const handleGenerateExpenseAdj = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    const { company_code, request_number } = req.body;

    if (!company_code || !request_number) {
      res.status(400).json({ error: "company_code and request_number are required." });
      return;
    }

    console.log("Calling PROC_CREATE_GT_EXPENSE_ADJ with:", { company_code, request_number });

    // ✅ Use the wrapper's getConnection()
    connection = await oracleDb.getConnection();
    if (!connection) throw new Error("Failed to get Oracle connection");

    // Execute the stored procedure
    await connection.execute(
      `BEGIN PROC_CREATE_GT_EXPENSE_ADJ(:company_code, :request_number); END;`,
      { company_code, request_number }
    );

    // Commit transaction
    await connection.commit();

    res.status(200).json({
      success: true,
      message: "GT_EXPENSE_ADJ generated successfully.",
    });

  } catch (error: any) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("❌ Error rolling back transaction:", rollbackError);
      }
    }

    console.error("❌ Error in handleGenerateExpenseAdj:", error);
    res.status(500).json({
      success: false,
      message: "Error while generating GT_EXPENSE_ADJ.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("❌ Error closing Oracle connection:", closeError);
      }
    }
  }
};
