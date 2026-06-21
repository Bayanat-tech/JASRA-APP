import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

// Define the shape of your query result
interface UserFlowLevelRow {
  FLOWLEVEL: number | null; // assuming FLOW_LEVEL is numeric
}

export const fetchUserlevel = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { userId, companyCode, flow_code } = req.query;

    if (!userId || !companyCode || !flow_code) {
      res.status(400).json({
        success: false,
        message: "Missing userId, companyCode, or flow_code",
      });
      return;
    }

    const userIdStr = String(userId);
    const companyCodeStr = String(companyCode);
    const flowCodeStr = String(flow_code);

    // Use wrapper's getConnection or raw oracledb connection
    connection = await oracleDb.getConnection();

    // Use generic type to tell TypeScript the shape of rows
    const result = await connection.execute<UserFlowLevelRow>(
      `SELECT MIN(FLOW_LEVEL) AS FLOWLEVEL
       FROM V_USER_FLOW_DETAILS
       WHERE USER_CODE = :userId
         AND COMPANY_CODE = :companyCode
         AND FLOW_CODE = :flowCode`,
      {
        userId: userIdStr,
        companyCode: companyCodeStr,
        flowCode: flowCodeStr,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const userLevel = result.rows?.[0]?.FLOWLEVEL;
console.log('userLevel',userLevel);
    if (userLevel !== null && userLevel !== undefined) {
      res.status(200).json({ success: true, data: userLevel });
    } else {
      res.status(404).json({
        success: false,
        message: "No flow level found for the given user and company.",
      });
    }
  } catch (error) {
    console.error("❌ Error fetching user level:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
