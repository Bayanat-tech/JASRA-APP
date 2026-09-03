import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

// ------------------------------------------------------------
// Safe Number Converter
// ------------------------------------------------------------
const toNumber = (val: any): number | null => {
  if (val === undefined || val === null || val === "") {
    return null;
  }
  const n = Number(val);
  return isNaN(n) ? null : n;
};

// ------------------------------------------------------------
// Safe Date Converter
// ------------------------------------------------------------
const toDate = (val: any): Date | null => {
  if (!val) {
    return null;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// ------------------------------------------------------------
// UPSERT TRANSFER REQUEST FLOW
// ------------------------------------------------------------
export const upsertTransferReqFlow = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;
  console.log("Reached Controller: upsertTransferReqFlow");
  console.log("upsertTransferReqFlow called with body:", req.body);

  try {
    const data = req.body;

    // --------------------------------------------------------
    // Validate Company Code
    // --------------------------------------------------------
    if (!data?.company_code) {
      res.status(400).json({
        success: false,
        message: "company_code is required"
      });
      return;
    }

    // --------------------------------------------------------
    // Get Oracle Connection
    // --------------------------------------------------------
    connection = await oracleDb.getConnection();

    // --------------------------------------------------------
    // Get Oracle Object Class
    // NO schema prefix
    // --------------------------------------------------------
    const TransferReqFlowObjClass =
      await connection.getDbObjectClass("TRANSFER_REQ_FLOW_OBJ");

    // --------------------------------------------------------
    // Create Oracle Object
    // --------------------------------------------------------
// This is fine – just pass the data through
    const obj: any = new TransferReqFlowObjClass({
    REQUEST_NUMBER: data.request_number,          // '' or null → procedure handles it
    REQUEST_DATE: toDate(data.request_date),
    COMPANY_CODE: data.company_code,
    CREATED_BY: data.created_by || data.loginid,
    REASON_FOR_TRNSFER: data.reason_for_trnsfer,
    NEXT_ACTION_BY: data.next_action_by,
    RESON_FOR_REJECTION: data.reson_for_rejection,
    EMPLOYEE_CODE: data.employee_code,
    CREATED_AT: toDate(data.created_at),
    UPDATED_BY: data.updated_by,
    UPDATED_AT: toDate(data.updated_at),
    LAST_ACTION: data.last_action,                // comes from button
    CURRENT_SUPERVISOR_EMPCODE: data.current_supervisor_empcode,
    TRANSFER_TO_SUPERVISOR_EMPCODE: data.transfer_to_supervisor_empcode,
    DATA_TRANSFER: data.data_transfer,
    FINAL_APPROVED: data.final_approved,
    FLOW_LEVEL_RUNNING: toNumber(data.flow_level_running),
    TRANSFER_WEF: toDate(data.transfer_wef),
    HISTORY_SERIAL: toNumber(data.history_serial)
    });

    // --------------------------------------------------------
    // Call Oracle Procedure
    // --------------------------------------------------------
    await connection.execute(
      `
      BEGIN
        PROC_UPSERT_TRANSFER_REQ_FLOW(:p_data);
      END;
      `,
      {
        p_data: obj
      }
    );

    // --------------------------------------------------------
    // Commit
    // --------------------------------------------------------
    await connection.commit();

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------
    res.json({
      success: true,
      message: "Transfer request saved successfully"
    });
  } catch (err: any) {
    console.error("Oracle error:", err);
    res.status(500).json({
      success: false,
      message: "Transfer request upsert failed",
      details: err.message
    });
  } finally {
    if (connection) {
      await connection.close().catch(() => {});
    }
  }
};