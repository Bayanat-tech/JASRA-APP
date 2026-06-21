import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Cancels the final approval for a purchase request
 */
export const cancelFinalApproval = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    console.log("✅ cancelFinalApproval API called");

    const { company_code, request_number, user_id } = req.body;

    if (!company_code || !request_number || !user_id) {
      res.status(400).json({
        success: false,
        message: "❌ company_code, request_number, and user_id are required",
      });
      return;
    }

    // Get Oracle connection from your wrapper
    connection = await oracleDb.getConnection();

    if (!connection) {
      throw new Error("Failed to get Oracle connection");
    }

    console.log("📞 Calling stored procedure PRO_CANCEL_FINAL_APPROVAL_PR...");

    // Execute the stored procedure
    await connection.execute(
      `BEGIN PRO_CANCEL_FINAL_APPROVAL_PR(:company_code, :request_number, :user_id); END;`,
      { company_code, request_number, user_id }
    );

    // Commit transaction
    await connection.commit();
    console.log("✅ Stored procedure executed and transaction committed.");

    res.status(200).json({
      success: true,
      message: "✅ Final approval cancelled successfully.",
    });
  } catch (error) {
    // Rollback if connection exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("❌ Error rolling back transaction:", rollbackError);
      }
    }

    console.error("❌ Error in cancelFinalApproval:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while cancelling final approval.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    // Close connection if it exists
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("❌ Error closing Oracle connection:", closeError);
      }
    }
  }
};
