import { oracleDb } from "./../../../src/database/connection";
import { notifyUser } from "../../../src/helpers/functions";

const stdSign = `
Best regards,
Bayanat Technology`;
const stdSignHtml = `<p>Best regards,<br/>Bayanat Technology</p>`;

const toCsv = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean)
       .map(s => String(s).trim())
       .filter((v, i, a) => a.indexOf(v) === i)
       .join(",");

async function getEmailInfo(connection?: any) {
  const r = await oracleDb.query(
    `SELECT EMP_ID_LEVEL1_EMAILS, EMP_ID_LEVEL2_EMAILS FROM VW_VENDOR_EMAIL_INFOR`,
    {},
    connection
  );
  const row = r.rows?.[0] || r[0] || {};
  return {
    level1: row.EMP_ID_LEVEL1_EMAILS || "",
    level2: row.EMP_ID_LEVEL2_EMAILS || "",
  };
}

const extractLastActor = (history?: string | null): string => {
  if (!history) return "";
  const lastChunk =
    history
      .split("|")
      .map(s => s.trim())
      .filter(Boolean)
      .pop() || "";

  const pieces = lastChunk.split("-");
  const candidate = pieces[pieces.length - 1]?.trim() || lastChunk;

  return candidate
    .replace(/^sent\s*back\s*by[:\s]*/i, "")
    .replace(/^rejected\s*by[:\s]*/i, "")
    .trim();
};

async function getVendorEmail(docNo: string, connection?: any): Promise<string | null> {
  const acCodeRes = await oracleDb.query(
    `SELECT AC_CODE FROM TR_AC_LPO_HEADER WHERE DOC_NO = :docNo`,
    { docNo: { val: docNo } },
    connection
  );
  const acCode = (acCodeRes.rows?.[0] || acCodeRes[0])?.AC_CODE;
  if (!acCode) return null;

  const emailRes = await oracleDb.query(
    `SELECT EMAIL_ID FROM SEC_LOGIN WHERE LOGINID = :loginId`,
    { loginId: { val: acCode } },
    connection
  );
  return (emailRes.rows?.[0] || emailRes[0])?.EMAIL_ID || null;
}

async function getHistories(companyCode: string, docNo: string, connection?: any) {
  const r = await oracleDb.query(
    `SELECT NVL(SENDBACK_HISTORY,'') AS SENDBACK_HISTORY,
            NVL(REJECT_HISTORY,'') AS REJECT_HISTORY
       FROM TR_AC_LPO_HEADER
      WHERE COMPANY_CODE = :companyCode AND DOC_NO = :docNo`,
    { companyCode: { val: companyCode }, docNo: { val: docNo } },
    connection
  );
  const row = r.rows?.[0] || r[0] || {};
  return { sendbackHistory: row.SENDBACK_HISTORY, rejectHistory: row.REJECT_HISTORY };
}

async function getMaxFlowLevel(docNo: string, connection?: any): Promise<number> {
  const result = await oracleDb.query(
    `SELECT MAX(FLOW_LEVEL) AS MAX_FLOW_LEVEL
       FROM TR_AC_LPO_HEADER_HISTORY
      WHERE DOC_NO = :docNo`,
    { docNo: { val: docNo } },
    connection
  );
  return result.rows?.[0]?.MAX_FLOW_LEVEL || result[0]?.MAX_FLOW_LEVEL || 0;
}

export async function sendVendorLposendbackNotification(
  params: {
    action: "SENTBACK" | "REJECTED";
    docNo: string;
    companyCode: string;
    flowLevel: number;
  },
  connection?: any
): Promise<void> {
  const { action, docNo, companyCode } = params;

  const maxFlowLevel = await getMaxFlowLevel(docNo, connection);
  const { level1, level2 } = await getEmailInfo(connection);
  const vendorEmail = await getVendorEmail(docNo, connection);
  const { sendbackHistory, rejectHistory } = await getHistories(companyCode, docNo, connection);

  let recipients = "";
  let subject = "";
  let textBody = "";
  let htmlBody = "";

  if (action === "SENTBACK") {
    const actor = extractLastActor(sendbackHistory); 

    if (maxFlowLevel === 1) {
      recipients = toCsv([level1, vendorEmail]);
    } else if (maxFlowLevel > 2) {
      recipients = toCsv([level1, level2, vendorEmail]);
    }

    if (recipients) {
      subject = `Vendor Request Sent Back`;
      textBody = `Dear Recipient,\n\nThe vendor request with Document No: ${docNo} has been sent back.\n\nSent back by: ${actor || "Unknown"}${stdSign}`;
      htmlBody = `<p>Dear Recipient,</p>
                  <p>The vendor request with <strong>Document No: ${docNo}</strong> has been sent back.</p>
                  <p><strong>Sent back by:</strong> ${actor || "Unknown"}</p>
                  ${stdSignHtml}`;
    }
  } else if (action === "REJECTED") {
    const actor = extractLastActor(rejectHistory); 

    if (maxFlowLevel === 1) {
      recipients = toCsv([level1, vendorEmail]);
    } else if (maxFlowLevel > 2) {
      recipients = toCsv([level1, level2, vendorEmail]);
    }

    if (recipients) {
      subject = `Vendor Request Rejected`;
      textBody = `Dear Recipient,\n\nThe vendor request with Document No: ${docNo} has been rejected.\n\nRejected by: ${actor || "Unknown"}${stdSign}`;
      htmlBody = `<p>Dear Recipient,</p>
                  <p>The vendor request with <strong>Document No: ${docNo}</strong> has been rejected.</p>
                  <p><strong>Rejected by:</strong> ${actor || "Unknown"}</p>
                  ${stdSignHtml}`;
    }
  }

  if (!recipients) return;

  await notifyUser({
    event: "APPROVAL_NOTIFICATION",
    request_users: recipients,
    subject,
    message: textBody,
    htmlMessage: htmlBody,
  });
}
