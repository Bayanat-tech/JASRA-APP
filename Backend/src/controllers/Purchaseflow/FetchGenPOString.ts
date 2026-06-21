import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

// Define expected row structure
interface GenPoRow {
  GEN_PO_NUMBER?: string;
}

export const FetchGenPOString = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    console.log("✅ Fetching GEN_PO_NUMBER from GT_SESSION_INFO");

    // ✅ Use pooled Oracle connection
    connection = await oracleDb.getConnection();

    const query = `
      SELECT GEN_PO_NUMBER
      FROM GT_SESSION_INFO
      WHERE ROWNUM = 1
    `;

    const result = await connection.execute<GenPoRow>(
      query,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const genPoNumber = result.rows?.[0]?.GEN_PO_NUMBER || "NO";

    console.log("✅ GEN_PO_NUMBER fetched:", genPoNumber);

    res.status(200).json({ success: true, data: genPoNumber });
  } catch (error) {
    console.error("❌ Error fetching GEN_PO_NUMBER:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Failed to close Oracle connection:", err);
      }
    }
  }
};
