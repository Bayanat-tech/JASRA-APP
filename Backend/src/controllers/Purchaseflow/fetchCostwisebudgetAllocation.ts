import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Fetches cost-wise budget allocation data based on filters
 */
export const fetchCostwisebudgetAllocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    console.log("✅ fetchCostwisebudgetAllocation called");
    console.log("✅ Query Params:", req.query);

    const fromDate = String(req.query.fromDate || "").trim();
    const toDate = String(req.query.toDate || "").trim();
    const selectedProjectCode = String(req.query.selectedProjectCode || "").trim();
    const requestStatus = String(req.query.requestStatus || "").trim();
    const prType = String(req.query.prType || "").trim();
    const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();

    if (!fromDate || !toDate) {
      res.status(400).json({
        success: false,
        message: "❌ fromDate and toDate are required.",
      });
      return;
    }

    // ✅ Use wrapper to get Oracle connection
    connection = await oracleDb.getConnection();
    if (!connection) throw new Error("Failed to get Oracle connection");

    let query = `
      SELECT *
      FROM VW_COSTWISE_BUDGET_ALLOCATION
      WHERE REQUEST_DATE BETWEEN TO_DATE(:fromDate,'YYYY-MM-DD')
                             AND TO_DATE(:toDate,'YYYY-MM-DD')
    `;

    const binds: Record<string, string> = { fromDate, toDate };

    if (selectedProjectCode) {
      query += " AND PROJECT_CODE = :selectedProjectCode";
      binds.selectedProjectCode = selectedProjectCode;
    }
    if (requestStatus) {
      query += " AND LAST_ACTION = :requestStatus";
      binds.requestStatus = requestStatus;
    }
    if (prType) {
      query += " AND TYPE_OF_PR = :prType";
      binds.prType = prType;
    }
    if (serviceRmFlag) {
      query += " AND SERVICE_RM_FLAG = :serviceRmFlag";
      binds.serviceRmFlag = serviceRmFlag;
    }

    console.log("✅ Final Query:", query);
    console.log("✅ Query Binds:", binds);

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    console.log(`✅ Query executed successfully. Retrieved ${result.rows?.length || 0} records.`);

    res.status(200).json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error("❌ Error fetching cost-wise budget allocation data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching cost-wise budget allocation data.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    // ✅ Safely close connection
    try {
      await connection?.close();
    } catch (closeError) {
      console.error("❌ Error closing Oracle connection:", closeError);
    }
  }
};
