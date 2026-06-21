import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Check Budget Status using Oracle function FUN_CHECK_PR_EXCEED
 */
export const CheckBudgetStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    const { request_number, company_code } = req.body;
    console.log("inside CheckBudgetStatus1");

    // Validate input
    if (!company_code || !request_number) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters: company_code or request_number",
      });
      return;
    }

    // Sanitize request_number (replace '/' with '$' if needed)
    const request_number1 = request_number.replace(/\//g, "$");

    connection = await oracleDb.getConnection();
    if (!connection) throw new Error("Failed to get Oracle connection");

    // Call Oracle function
    const query = `
      SELECT FUN_CHECK_PR_EXCEED(:company_code, :request_number1) AS RESULT
      FROM dual
    `;

    const result = await connection.execute<{ RESULT: string }>(
      query,
      { company_code, request_number1 },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Type-safe extraction
    const resultString = result.rows?.[0]?.RESULT ?? "No result found";
    console.log("inside CheckBudgetStatus3", resultString);

    res.status(200).json({
      success: true,
      result: resultString,
    });
  } catch (err) {
    console.error("Error calling function:", err);
    res.status(500).json({
      success: false,
      message: "Failed to execute function",
      error: err instanceof Error ? err.message : "Internal Server Error",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
};
