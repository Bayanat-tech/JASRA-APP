// notifications.ts
import { oracleDb } from "./../../../src/database/connection";
import { notifyUser } from "../../../src/helpers/functions";

type EmailInfo = { level1: string; level2: string };

const toCsv = (list: (string | null | undefined)[]) =>
  list.filter(Boolean).join(",");

async function getApproverListsFromFixedView(connection: any): Promise<EmailInfo> {
  const r = await oracleDb.query(
    `SELECT EMP_ID_LEVEL1_EMAILS, EMP_ID_LEVEL2_EMAILS FROM VW_VENDOR_EMAIL_INFOR`,
    {},
    connection
  );
  const row = r.rows?.[0] || r[0] || {};
  return {
    level1: row?.EMP_ID_LEVEL1_EMAILS || "",
    level2: row?.EMP_ID_LEVEL2_EMAILS || "",
  };
}

async function getVendorEmailByDocNo(docNo: string, connection: any): Promise<string | null> {
  const acCodeRes = await oracleDb.query(
    `SELECT AC_CODE FROM TR_AC_LPO_HEADER WHERE DOC_NO = :docNo`,
    { docNo: { val: docNo } },
    connection
  );
  const acCodeRow = acCodeRes.rows?.[0] || acCodeRes[0];
  const acCode = acCodeRow?.AC_CODE;
  if (!acCode) return null;

  const emailRes = await oracleDb.query(
    `SELECT EMAIL_ID FROM SEC_LOGIN WHERE LOGINID = :loginId`,
    { loginId: { val: acCode } },
    connection
  );
  const emailRow = emailRes.rows?.[0] || emailRes[0];
  return emailRow?.EMAIL_ID || null;
}

export async function sendVendorLpoNotifications(
  {
    companyCode,
    docNo,
  }: { companyCode: string; docNo: string },
  connection: any
): Promise<void> {

  const stateRes = await oracleDb.query(
    `SELECT FLOW_LEVEL, LAST_ACTION, FINAL_APPROVED, 
            NVL(SENDBACK_HISTORY,'No reason provided.') AS SENDBACK_HISTORY,
            NVL(REJECT_HISTORY,'No reason provided.') AS REJECT_HISTORY
     FROM TR_AC_LPO_HEADER
     WHERE COMPANY_CODE = :companyCode AND DOC_NO = :docNo`,
    { companyCode: { val: companyCode }, docNo: { val: docNo } },
    connection
  );
  const row = stateRes.rows?.[0] || stateRes[0] || {};
  const flowLevel = Number(row?.FLOW_LEVEL ?? 0);
  const lastAction = String(row?.LAST_ACTION ?? "");
  const finalApproved = String(row?.FINAL_APPROVED ?? "");
  const sendbackHistory = String(row?.SENDBACK_HISTORY ?? "No reason provided.");
  const rejectHistory = String(row?.REJECT_HISTORY ?? "No reason provided.");

  const { level1, level2 } = await getApproverListsFromFixedView(connection);
  const vendorEmail = await getVendorEmailByDocNo(docNo, connection);

  let recipients = "";
  let subject = "";
  let textBody = "";
  let htmlBody = "";

  const stdSign = `\n\nBest regards,\nBayanat Technology`;
  const stdSignHtml = `<p>Best regards,<br>Bayanat Technology</p>`;

  if (lastAction === "SUBMITTED" || lastAction === "APPROVED") {
    
    const approverList = flowLevel === 1 ? level1 : flowLevel === 2 ? level2 : "";
    if (approverList) {
      recipients = approverList;
      subject = `Vendor Request ${lastAction}`;
      textBody = `Dear Approver,\n\nThe vendor request with Document No: ${docNo} has been ${lastAction.toLowerCase()} and is awaiting your approval.${stdSign}`;
      htmlBody = `<p>Dear Approver,</p>
                  <p>The vendor request with <strong>Document No: ${docNo}</strong> has been ${lastAction.toLowerCase()} and is awaiting your approval.</p>
                  ${stdSignHtml}`;
    }
  }

  // final approved → vendor + level1
  if (lastAction === "APPROVED" && finalApproved === "YES") {
    const list = toCsv([level1, vendorEmail]);
    if (list) {
      recipients = list;
      subject = `Vendor Request Approved`;
      textBody = `Dear Recipient,\n\nThe vendor request with Document No: ${docNo} has been approved.${stdSign}`;
      htmlBody = `<p>Dear Recipient,</p>
                  <p>The vendor request with <strong>Document No: ${docNo}</strong> has been approved.</p>
                  ${stdSignHtml}`;
    }
  }

  if (!recipients) return; 
  try {
    await notifyUser({
      event: "APPROVAL_NOTIFICATION",
      request_users: recipients,
      subject,
      message: textBody,
      htmlMessage: htmlBody,
    });
  } catch (err) {
    console.error("Email notify failed for DOC_NO", docNo, err);
  }
}
