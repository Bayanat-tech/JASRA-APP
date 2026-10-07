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
// Safe String Converter
// ------------------------------------------------------------
const toStr = (val: any): string | null => {
  if (val === undefined || val === null || val === "") {
    return null;
  }
  return String(val).trim();
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
    // Validate mandatory transfer-to codes (DB columns are NOT NULL)
    // --------------------------------------------------------
    if (!toStr(data.transfer_to_division) || !toStr(data.transfer_to_department)) {
      res.status(400).json({
        success: false,
        message: "transfer_to_division and transfer_to_department are required"
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
    // Create Oracle Object (codes only, never names)
    // --------------------------------------------------------
    const obj: any = new TransferReqFlowObjClass({
      REQUEST_NUMBER: data.request_number, // '' or null → procedure handles it
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
      LAST_ACTION: data.last_action, // comes from button
      CURRENT_SUPERVISOR_EMPCODE: data.current_supervisor_empcode,
      TRANSFER_TO_SUPERVISOR_EMPCODE: data.transfer_to_supervisor_empcode,
      DATA_TRANSFER: data.data_transfer,
      FINAL_APPROVED: data.final_approved,
      FLOW_LEVEL_RUNNING: toNumber(data.flow_level_running),
      TRANSFER_WEF: toDate(data.transfer_wef),
      HISTORY_SERIAL: toNumber(data.history_serial),
      TRANSFER_TO_DEPT_CODE: toStr(data.transfer_to_dept_code),
      TRANSFER_TO_ENGINEER: toStr(data.transfer_to_engineer),
      TRANSFER_TO_DIVISION: toStr(data.transfer_to_division),
      TRANSFER_TO_DEPARTMENT: toStr(data.transfer_to_department)
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

// ------------------------------------------------------------
// INSERT / UPDATE EMPLOYEE SUPERVISOR (BULK)
// ------------------------------------------------------------
export const insUpdEmployeeSupervisourBulk = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  console.log("Reached Controller: insUpdEmployeeSupervisourBulk");
  console.log("insUpdEmployeeSupervisourBulk called with body:", req.body);

  try {
    const data = req.body?.data;

    // --------------------------------------------------------
    // Validate Request – expect array
    // --------------------------------------------------------
    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({
        success: false,
        message: "data array is required and cannot be empty"
      });
      return;
    }

    // --------------------------------------------------------
    // Get Oracle Connection
    // --------------------------------------------------------
    connection = await oracleDb.getConnection();

    // --------------------------------------------------------
    // Get Oracle Object Class (NO schema prefix)
    // --------------------------------------------------------
    const EmployeeSupervisourObjClass = await connection.getDbObjectClass(
      "EMPLOYEE_SUPERVISOUR_OBJ"
    );

    // --------------------------------------------------------
    // Build Oracle Object Array
    // --------------------------------------------------------
    const employeeObjects: any[] = [];

    for (const row of data) {
      const employeeNo = toStr(row.EMPLOYEE_NO ?? row.employee_no);

      if (!employeeNo) {
        res.status(400).json({
          success: false,
          message: "EMPLOYEE_NO is required for every row"
        });
        return;
      }

      const obj: any = new EmployeeSupervisourObjClass({
        EMPLOYEE_NO: employeeNo,
        EMPLOYEE_NAME: toStr(row.EMPLOYEE_NAME ?? row.employee_name),
        POSITION: toStr(row.POSITION ?? row.position),
        IMMEDIATE_SUPERVISOR: toStr(
          row.IMMEDIATE_SUPERVISOR ?? row.immediate_supervisor
        ),
        LEVEL_1: toStr(row.LEVEL_1 ?? row.level_1),
        LEVEL_2: toStr(row.LEVEL_2 ?? row.level_2),
        SENIOR_PAYROLL: toStr(row.SENIOR_PAYROLL ?? row.senior_payroll),
        HR_MANAGER: toStr(row.HR_MANAGER ?? row.hr_manager)
      });

      employeeObjects.push(obj);
    }

    // --------------------------------------------------------
    // Call Oracle Procedure (collection type)
    // --------------------------------------------------------
    await connection.execute(
      `
      BEGIN
        PROC_INS_UPD_EMPLOYEE_SUPERVISOUR(:p_data);
      END;
      `,
      {
        p_data: {
          type: "EMPLOYEE_SUPERVISOUR_TAB",
          val: employeeObjects
        }
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
      message: "Employee supervisor records saved successfully",
      recordCount: employeeObjects.length
    });
  } catch (err: any) {
    console.error("Oracle error:", err);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }

    res.status(500).json({
      success: false,
      message: "Employee supervisor bulk upsert failed",
      details: err?.message || "Unknown error"
    });
  } finally {
    if (connection) {
      await connection.close().catch(() => {});
    }
  }
};

// ------------------------------------------------------------
// UPDATE BULK SUPERVISOR
// Calls: PROC_UPDATE_BULK_SUPERVISOR
// ------------------------------------------------------------
export const updateBulkSupervisor = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  console.log("Reached Controller: updateBulkSupervisor");

  try {
    // --------------------------------------------------------
    // Get Oracle Connection
    // --------------------------------------------------------
    connection = await oracleDb.getConnection();

    // --------------------------------------------------------
    // Call Oracle Procedure (no parameters)
    // --------------------------------------------------------
    await connection.execute(
      `
      BEGIN
        PROC_UPDATE_BULK_SUPERVISOR;
      END;
      `
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
      message:
        "HR employee supervisor hierarchy updated successfully from EMPLOYEE_SUPERVISOUR"
    });
  } catch (err: any) {
    console.error("Oracle error in updateBulkSupervisor:", err);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }

    res.status(500).json({
      success: false,
      message: "Bulk supervisor update failed",
      details: err?.message || "Unknown error"
    });
  } finally {
    if (connection) {
      await connection.close().catch(() => {});
    }
  }
};