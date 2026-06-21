import { Request, Response, NextFunction } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

export const updatePrintSignatureInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { ref_doc_no, loginid, flag_yes_no } = req.body;

    if (!ref_doc_no || !loginid || !flag_yes_no) {
      res.status(400).json({
        success: false,
        message: "ref_doc_no, loginid, and flag_yes_no are required",
      });
      return;
    }

    console.log("Input:", ref_doc_no, loginid, flag_yes_no);

    // Format request number for Oracle
    const formattedRefDocNo = ref_doc_no.replace(/\//g, "$");

    // Get Oracle connection from your helper
    connection = await oracleDb.getConnection();

    // Call stored procedure using PL/SQL block
    const plsql = `
      BEGIN
        PROC_PRINT_SIGNATURE_INFO(:ref_doc_no, :loginid, :flag_yes_no);
      END;
    `;

    await connection.execute(
      plsql,
      {
        ref_doc_no: formattedRefDocNo,
        loginid,
        flag_yes_no,
      },
      { autoCommit: true } // commit immediately after execution
    );

    console.log("✅ Stored procedure executed successfully");

    res.status(200).json({
      success: true,
      message: "Signature info updated successfully",
    });
  } catch (error: any) {
    console.error("❌ Error updating print signature info:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Oracle connection closed");
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};
