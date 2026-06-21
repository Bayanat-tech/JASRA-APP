// leaveNotifications.ts
import oracledb from "oracledb";
import { oracleDb } from "./../../../src/database/connection";
import { notifyUser } from "../../../src/helpers/functions";
import constants from "../../helpers/constants";

type LeaveRow = {
  REQUEST_NUMBER?: string;
  COMPANY_CODE?: string;
  FINAL_APPROVED?: string | null;
  NEXT_ACTION_BY_EMAIL?: string | null;
  IMMEDIATE_SUPERVISOR_EMAIL?: string | null;
  CREATED_BY_EMAIL?: string | null;
  CREATE_USER?: string | null;
  NEXT_ACTION_BY?: string | null;
  EMPLOYEE_NAME?: string | null;
  LAST_ACTION?: string | null;
};

export async function sendLeaveNotifications(requestNumber: string, companyCode?: string) {
  const connection = await oracleDb.getConnection();
  try {
    const sql = `
      SELECT
        TRIM(NVL(REQUEST_NUMBER,'')) AS REQUEST_NUMBER,
        TRIM(NVL(COMPANY_CODE,'')) AS COMPANY_CODE,
        TRIM(NVL(FINAL_APPROVED,'NO')) AS FINAL_APPROVED,
        TRIM(NVL(NEXT_ACTION_BY_EMAIL,'')) AS NEXT_ACTION_BY_EMAIL,
        TRIM(NVL(IMMEDIATE_SUPERVISOR_EMAIL,'')) AS IMMEDIATE_SUPERVISOR_EMAIL,
        TRIM(NVL(CREATED_BY_EMAIL,'')) AS CREATED_BY_EMAIL,
        TRIM(NVL(CREATE_USER,'')) AS CREATE_USER,
        TRIM(NVL(NEXT_ACTION_BY,'')) AS NEXT_ACTION_BY,
        TRIM(NVL(EMPLOYEE_NAME,'')) AS EMPLOYEE_NAME,
        TRIM(NVL(LAST_ACTION,'')) AS LAST_ACTION
      FROM VW_HR_LEAVE_REQUEST_FLOW1
      WHERE REQUEST_NUMBER = :req
      ${companyCode ? "AND COMPANY_CODE = :comp" : ""}
      FETCH FIRST 1 ROWS ONLY
    `;
    const binds: any = { req: requestNumber };
    if (companyCode) binds.comp = companyCode;

    const res = await connection.execute<LeaveRow>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const row = res.rows?.[0] as LeaveRow | undefined;
    if (!row) {
      console.warn("[sendLeaveNotifications] No row found for", requestNumber);
      return;
    }

    const finalApproved = (row.FINAL_APPROVED ?? "NO").toString().trim().toUpperCase();
    const createUser = row.CREATE_USER?.trim();
    const nextActionBy = row.NEXT_ACTION_BY?.trim();
    const nextActionByEmail = row.NEXT_ACTION_BY_EMAIL?.trim();
    const immediateSupervisorEmail = row.IMMEDIATE_SUPERVISOR_EMAIL?.trim();
    const createUserEmail = row.CREATED_BY_EMAIL?.trim();
    const lastAction = row.LAST_ACTION?.trim().toUpperCase();

    // Notify the next action user
    if (nextActionByEmail && lastAction !== "SAVEASDRAFT") {
      const recipients1 = [nextActionByEmail, createUserEmail].filter(Boolean).join(",");
      if (recipients1) {
      await notifyUser({
        event: constants.EVENTS.LEAVE_APPROVAL_REQUEST,
        request_user: { request_number: requestNumber, company_code: row.COMPANY_CODE },
        request_users: recipients1,
        subject: `Leave Approval Required: ${requestNumber}`,
        message: `The leave request (${requestNumber}) for ${row.EMPLOYEE_NAME || "the employee"} requires your action.`,
        htmlMessage: `<p>The leave request <b>${requestNumber}</b> for ${row.EMPLOYEE_NAME || "the employee"} requires your action. Please login to www.bayanattechnology.com and complete the action.</p> `,
      });
    }
    }
  
    if (finalApproved === "YES" && createUser === nextActionBy) {
      const recipients = [immediateSupervisorEmail, nextActionByEmail].filter(Boolean).join(",");
      if (recipients) {
        await notifyUser({
          event: constants.EVENTS.LEAVE_APPROVED,
          request_user: { request_number: requestNumber, company_code: row.COMPANY_CODE },
          request_users: recipients,
          subject: `Leave Approved: ${requestNumber}`,
          message: `The leave request (${requestNumber}) for ${row.EMPLOYEE_NAME || "the employee"} has been approved.`,
          htmlMessage: `<p>The leave request <b>${requestNumber}</b> for ${row.EMPLOYEE_NAME || "the employee"} has been approved.</p>`,
        });
      }
    }

    // Notify for CANCEL action
    if (lastAction === "CANCEL" && immediateSupervisorEmail) {
      await notifyUser({
        event: constants.EVENTS.LEAVE_CANCEL,
        request_user: { request_number: requestNumber, company_code: row.COMPANY_CODE },
        request_users: immediateSupervisorEmail,
        subject: `Leave Request Cancelled: ${requestNumber}`,
        message: `The leave request (${requestNumber}) for ${row.EMPLOYEE_NAME || "the employee"} has been cancelled.`,
        htmlMessage: `<p>The leave request <b>${requestNumber}</b> for ${row.EMPLOYEE_NAME || "the employee"} has been cancelled.</p>`,
      });
    }

    // Notify for REJECTED action
    if (lastAction === "REJECTED" && immediateSupervisorEmail) {
      await notifyUser({
        event: constants.EVENTS.LEAVE_REJECTED,
        request_user: { request_number: requestNumber, company_code: row.COMPANY_CODE },
        request_users: immediateSupervisorEmail,
        subject: `Leave Request Rejected: ${requestNumber}`,
        message: `The leave request (${requestNumber}) for ${row.EMPLOYEE_NAME || "the employee"} has been rejected.`,
        htmlMessage: `<p>The leave request <b>${requestNumber}</b> for ${row.EMPLOYEE_NAME || "the employee"} has been rejected.</p>`,
      });
    }

    // Notify for SENTBACK action
    if (lastAction === "SENTBACK") {
      const recipients = [immediateSupervisorEmail, nextActionByEmail].filter(Boolean).join(",");
      if (recipients) {
        await notifyUser({
          event: constants.EVENTS.LEAVE_SENTBACK,
          request_user: { request_number: requestNumber, company_code: row.COMPANY_CODE },
          request_users: recipients,
          subject: `Leave Request Sent Back: ${requestNumber}`,
          message: `The leave request (${requestNumber}) for ${row.EMPLOYEE_NAME || "the employee"} has been sent back for further action.`,
          htmlMessage: `<p>The leave request <b>${requestNumber}</b> for ${row.EMPLOYEE_NAME || "the employee"} has been sent back for further action. Please login to www.bayanattechnology.com and complete the action.</p>`,
        });
      }
    }

    console.log(`[sendLeaveNotifications] Notifications sent for ${requestNumber}.`);
  } catch (err) {
    console.error("[sendLeaveNotifications] Error:", err);
    throw err;
  } finally {
    try {
      await connection.close();
    } catch (closeErr) {
      console.warn("[sendLeaveNotifications] Close connection error", closeErr);
    }
  }
}
