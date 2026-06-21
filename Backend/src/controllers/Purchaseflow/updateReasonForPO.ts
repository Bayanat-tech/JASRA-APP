import { Request, Response, NextFunction } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";

export const updateReasonForPO = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { ref_doc_no, company_code, reason_po_modify, loginid } = req.body;

    // Validate input
    if (!ref_doc_no || !company_code || !reason_po_modify || !loginid) {
      res.status(400).json({
        success: false,
        message:
          "All fields (ref_doc_no, company_code, reason_po_modify, loginid) are required",
      });
      return;
    }

    if (reason_po_modify.trim() === "") {
      res.status(400).json({
        success: false,
        message: "Enter Reason for Purchase Order",
      });
      return;
    }

    // Get Oracle connection
    connection = await oracleDb.getConnection();

    // Format ref_doc_no for Oracle if needed
    const formattedRefDocNo = ref_doc_no.replace(/\//g, "$");

    // Start transaction
    await connection.execute("BEGIN NULL; END;"); // Dummy begin block (Oracle starts a transaction implicitly)
    
    // Update query
    const updateSql = `
      UPDATE PURCHASE_REQUEST_DETAILS
      SET reason_for_po_modify = :reason_po_modify,
          updated_by = :loginid,
          last_updated = CURRENT_TIMESTAMP
      WHERE company_code = :company_code
        AND ref_doc_no = :ref_doc_no
    `;

    const result = await connection.execute(
      updateSql,
      {
        reason_po_modify,
        loginid,
        company_code,
        ref_doc_no: formattedRefDocNo,
      },
      { autoCommit: true } // Commit immediately after update
    );

    console.log(`Rows updated: ${result.rowsAffected}`);

    res.status(200).json({
      success: true,
      message: "Reason for PO modification updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating reason for PO:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
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
