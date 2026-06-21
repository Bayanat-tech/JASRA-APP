import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

// Define expected row structure
export interface MessageBoxItem {
  MESSAGE_BOX: string;
  MESSAGE_TYPE: string;
}

export const Fetchmessagebox = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const userId = String(req.query.userId || "").trim();
    const companyCode = String(req.query.companyCode || "").trim();

    if (!userId || !companyCode) {
      res.status(400).json({ success: false, data: [], message: "Missing userId or companyCode" });
      return;
    }

    console.log("✅ Inside backend Fetchmessagebox");

    connection = await oracleDb.getConnection();

    const query = `
      SELECT MESSAGE_BOX, MESSAGE_TYPE
      FROM GT_SESSION_MESSAGEBOX
      WHERE USER_ID = :userId AND COMPANY_CODE = :companyCode
    `;

    const result = await connection.execute<MessageBoxItem>(
      query,
      { userId, companyCode },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const messages = result.rows || [];

    console.log("✅ Messages fetched:", messages);

    // Match frontend expectation: { success: boolean, data: MessageBoxItem[] }
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("❌ Error fetching Fetchmessagebox:", error);
    res.status(500).json({ success: false, data: [], message: "Internal server error" });
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
