import { Router, Request, Response } from "express";
import oracledb, { getConnection } from "oracledb";

const router = Router();

interface LeaveFormRow {
  EMPLOYEE_CODE: string;
  REQUEST_NUMBER: string;
  REQUEST_DATE: Date;
  LEAVE_START_DATE: Date;
  LEAVE_END_DATE: Date;
  LEAVE_DAYS: number;
  REMARKS: string | null;
  HALF_DAY: string | null;
  CONTACT_DETAILS_DURING_LEAVE: string | null;
  LEAVE_TYPE: string;
  LEAVE_TYPE_DESC: string;
  RPT_NAME: string;
  ALTERNATE_ID: string | null;
  DIV_CODE: string;
  DIV_NAME: string;
  DEPT_CODE: string;
  DEPT_NAME: string;
  DESG_CODE: string;
  DESG_NAME: string;
  JOIN_DATE: Date;
}

async function getLeaveFormData(
  requestNumber: string,
  employeeCode: string
): Promise<LeaveFormRow | null> {
  const connection = await getConnection();
  try {
    const result = await connection.execute<LeaveFormRow>(
      `SELECT
          EMPLOYEE_CODE,
          REQUEST_NUMBER,
          REQUEST_DATE,
          LEAVE_START_DATE,
          LEAVE_END_DATE,
          LEAVE_DAYS,
          REMARKS,
          HALF_DAY,
          CONTACT_DETAILS_DURING_LEAVE,
          LEAVE_TYPE,
          LEAVE_TYPE_DESC,
          RPT_NAME,
          ALTERNATE_ID,
          DIV_CODE,
          DIV_NAME,
          DEPT_CODE,
          DEPT_NAME,
          DESG_CODE,
          DESG_NAME,
          JOIN_DATE
       FROM VW_JASRA_LEAVE_FORM
       WHERE REQUEST_NUMBER = :REQUEST_NUMBER
         AND EMPLOYEE_CODE = :EMPLOYEE_CODE`,
      { REQUEST_NUMBER: requestNumber, EMPLOYEE_CODE: employeeCode },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const row = result.rows?.[0];
    return row ?? null;
  } finally {
    await connection.close();
  }
}

function formatDate(value: Date | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

const COMPANY_LOGO_URL =
  "https://axpnrpp1t5qs.compat.objectstorage.me-dubai-1.oraclecloud.com/app-dev-bucket-test/uploads/2026/9/blob";

function buildLeaveFormHtml(data: LeaveFormRow): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Leave Application Form - ${data.REQUEST_NUMBER}</title>
<style>
  @page { size: A4; margin: 14mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #000; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  td, th { border: 1px solid #000; padding: 5px 7px; vertical-align: top; }
  .no-border td, .no-border th { border: none; }
  .label { font-weight: bold; }
  .title-block { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .title-block h1 { font-size: 18px; margin: 0; }
  .form-meta { font-size: 11px; }
  .logo { text-align: right; }
  .logo img { max-height: 48px; max-width: 200px; object-fit: contain; }
  .section-title { font-weight: bold; font-size: 13px; margin: 10px 0 4px; }
  .signature-line { margin-top: 14px; }
  .checkbox { display: inline-block; width: 10px; height: 10px; border: 1px solid #000; margin-right: 5px; }
  .small { font-size: 10px; }
  .filled { font-weight: normal; }
  @media print {
    .no-print { display: none; }
  }
</style>
</head>
<body>

  <div class="title-block">
    <div>
      <h1>LEAVE APPLICATION FORM</h1>
      <div class="form-meta">Form No: <b>AJG/HRD/F-231 Rev.02</b> &nbsp;|&nbsp; Issue Date: <b>13-Jun-2023</b></div>
    </div>
    <div class="logo"><img src="${COMPANY_LOGO_URL}" alt="Company Logo" /></div>
  </div>

  <table>
    <tr>
      <td class="label" style="width:20%;">Division</td>
      <td style="width:30%;">${data.DIV_NAME ?? ""}</td>
      <td class="label" style="width:20%;">Department/Project</td>
      <td style="width:30%;">${data.DEPT_NAME ?? ""}</td>
    </tr>
  </table>

  <div class="section-title">Employee Information</div>
  <table>
    <tr>
      <td class="label" style="width:20%;">Employee Name</td>
      <td style="width:30%;">${data.RPT_NAME ?? ""}</td>
      <td class="label" style="width:20%;">Employee No</td>
      <td style="width:30%;">${data.ALTERNATE_ID ?? ""}</td>
    </tr>
    <tr>
      <td class="label">Designation</td>
      <td>${data.DESG_NAME ?? ""}</td>
      <td class="label">Date of Joining</td>
      <td>${formatDate(data.JOIN_DATE)}</td>
    </tr>
  </table>

  <div class="section-title">Leave Details</div>
  <table>
    <tr>
      <th style="width:34%;">Type of Leave<br/><span class="small">(Please Tick whichever is Applicable)</span></th>
      <th style="width:22%;">From</th>
      <th style="width:22%;">To</th>
      <th style="width:22%;">No. of Days</th>
    </tr>
    <tr>
      <td>${data.LEAVE_TYPE_DESC ?? ""}</td>
      <td>${formatDate(data.LEAVE_START_DATE)}</td>
      <td>${formatDate(data.LEAVE_END_DATE)}</td>
      <td>${data.LEAVE_DAYS ?? ""}</td>
    </tr>
    <tr>
      <td colspan="2">Contact details in home country: ${data.CONTACT_DETAILS_DURING_LEAVE ?? ""}</td>
      <td colspan="2">Exit Permit required: <span class="checkbox"></span> Yes &nbsp; <span class="checkbox"></span> No</td>
    </tr>
    <tr>
      <td colspan="2" class="signature-line">Employee Signature: ____________________________</td>
      <td colspan="2">Date: ${formatDate(data.REQUEST_DATE)}</td>
    </tr>
  </table>

  <div class="section-title">Leave Cover</div>
  <table>
    <tr>
      <td class="label" style="width:15%;">For Applicant</td>
      <td style="width:65%;">
        I, ______________________________________, hereby, certify that I have handed over all the relevant tasks to
        ______________________________________ (Employee Name &amp; Emp ID taking over), ______________________________________ (Title).
      </td>
      <td style="width:20%;">Date &amp; Signature<br/><br/><br/></td>
    </tr>
    <tr>
      <td class="label">For Employee Taking Over</td>
      <td>
        I, ______________________________________, hereby, acknowledge that I have received a full handover of the tasks to be handled during the absence of
        ______________________________________ (Applicant name &amp; Emp ID), until he/she is back from leave.
      </td>
      <td>Date &amp; Signature<br/><br/><br/></td>
    </tr>
  </table>

  <table>
    <tr><th colspan="4" style="text-align:left;">HRD USE ONLY</th></tr>
    <tr>
      <td style="width:30%;">No. of Leave Entitlement as of First Date Requested</td>
      <td style="width:20%;"></td>
      <td style="width:30%;">Is Employee Entitled for Company Ticket?</td>
      <td style="width:20%;"></td>
    </tr>
    <tr>
      <td>Additional Unpaid Leave Days</td>
      <td></td>
      <td>Is Leave Settlement Required?</td>
      <td></td>
    </tr>
    <tr>
      <td>Employee Total No. Days of previous Leave Taken</td>
      <td></td>
      <td>Date of Time Sheet Required for Leave Settlement</td>
      <td></td>
    </tr>
    <tr>
      <td colspan="4">Comments/Remarks:<br/><br/></td>
    </tr>
    <tr>
      <td colspan="2">Payroll Officer: ____________________________</td>
      <td colspan="2">Date:</td>
    </tr>
  </table>

  <div class="section-title">Leave Status <span class="small">(Please note that LEAVE must be APPROVED only after obtaining entitlement from HRD)</span></div>
  <table>
    <tr>
      <th>Approvals</th>
      <th>Line Manager/ Head of Division</th>
      <th>Group HR Manager</th>
      <th>GCEO</th>
    </tr>
    <tr>
      <td>Date</td><td></td><td></td><td></td>
    </tr>
    <tr>
      <td>Signature</td><td></td><td></td><td></td>
    </tr>
  </table>

  <div class="small">
    <b>IMPORTANT NOTES:</b><br/>
    1. Annual Leave should be applied for in advance, as per given dates for the annual leave calendar. Any other leave/s taken outside the dates submitted and approved earlier (as per the annual leave calendar), would be considered as Emergency Leave.<br/>
    2. In the case of Maternity &amp; Sick Leave, medical certificate (e-JAZA) is to be submitted along with the Leave Form.<br/>
    3. All Leave Forms after due authorization should be submitted to Line Management for approval and then the HR Department before proceeding on Leave.<br/><br/>
    *If Health Care issue, to attach Medical Certificate (e-JAZA).<br/>
    **Employees who worked during off days but not entitled for Overtime payment must attach Time Sheet &amp; Overtime Preapproval Form signed by line manager. Days in lieu must be taken locally.
  </div>

</body>
</html>
`;
}

export const printLeaveForm =  async (req: Request, res: Response) => {
    const { requestNumber, employeeCode } = req.params;

    try {
      const data = await getLeaveFormData(requestNumber, employeeCode);

      if (!data) {
        res.status(404).send("Leave request not found.");
        return;
      }

      const html = buildLeaveFormHtml(data);

      console.log('leaveformdata',data);

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (err) {
      console.error("Error generating leave application form:", err);
      res.status(500).send("Failed to generate leave application form.");
    }
  };