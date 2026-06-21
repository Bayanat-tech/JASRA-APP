import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Fetches the PO listing for a given purchase request
 */
export const fetchPOlisting = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    console.log("✅ fetchPOlisting API called");

    const { request_number } = req.params;

    if (!request_number) {
      res.status(400).json({ success: false, message: "❌ request_number is required" });
      return;
    }

    // Get Oracle connection from your wrapper
    connection = await oracleDb.getConnection();
    if (!connection) {
      throw new Error("Failed to get Oracle connection");
    }

    console.log("📞 Calling stored procedure PRO_CALL_GEN_JESRA_PO_NO_DRAFT...");

    // Execute the stored procedure
    await connection.execute(
      `BEGIN PRO_CALL_GEN_JESRA_PO_NO_DRAFT(:request_number); END;`,
      { request_number }
    );

    // Commit transaction
    await connection.commit();
    console.log("✅ Stored procedure executed and transaction committed.");

    // Query PO listing
    const query = `
      SELECT * 
      FROM VW_PO_LISTING
      WHERE REQUEST_NUMBER = :request_number
    `;

    const result = await connection.execute(query, { request_number }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    // Map all column names to lower case
    const rowsWithLowerCaseKeys = (result.rows || []).map(row => {
      const newRow: Record<string, any> = {};

      // Type assertion to satisfy TypeScript
      const objRow = row as Record<string, any>;

      for (const key in objRow) {
        newRow[key.toLowerCase()] = objRow[key];
      }

      return newRow;
    });

    console.log(
      "✅ Query executed successfully. Retrieved",
      rowsWithLowerCaseKeys.length,
      "records"
    );

    res.status(200).json({ success: true, data: rowsWithLowerCaseKeys });
  } catch (error) {
    // Rollback if connection exists
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("❌ Error rolling back transaction:", rollbackError);
      }
    }

    console.error("❌ Error in fetchPOlisting:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching PO listing",
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
