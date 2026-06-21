import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

export const CheckCostcontroller = async (req: Request, res: Response): Promise<void> => {
  let connection;

  try {
    // Extract and validate query parameters
    const userId = String(req.query.userId || "").trim();
    const companyCode = 'JASRA';

    if (!userId || !companyCode) {
      console.error("❌ Missing userId or companyCode:", { userId, companyCode });
      res.status(400).json({ success: false, message: "Missing userId or companyCode" });
      return;
    }

    console.log("✅ Inside backend CheckCostcontroller", { userId, companyCode });

    // Get Oracle connection
    connection = await oracledb.getConnection();

    // Execute query with bind variables
    const result = await connection.execute<{ COSTCONTROLLER: string }>(
      `SELECT
          CASE
              WHEN COUNT(*) > 0 THEN 'YES'
              ELSE 'NO'
          END AS COSTCONTROLLER
       FROM V_USER_FLOW_DETAILS
       WHERE (FLOW_ROLE = '009' OR FLOW_ROLE = '010')
         AND USER_CODE = :userId
         AND COMPANY_CODE = :companyCode`,
      { userId, companyCode }, // bind variables
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const costController = result.rows?.[0]?.COSTCONTROLLER || "NO";

    console.log("✅ Query result:", costController);

    res.status(200).json({ success: true, data: costController });
  } catch (error) {
    console.error("❌ Error fetching Costcontroller:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Failed to close Oracle connection:", closeErr);
      }
    }
  }
};
