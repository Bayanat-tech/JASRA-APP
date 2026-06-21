import { oracleDb } from "./../../../src/database/connection";
import { TVendorMain, DetailsTVendor } from "./vendore.interface";
import { Request, Response } from "express";
import { VendorService } from "../../services/vendor.service";
import {sendVendorLpoNotifications} from "./sendVendorLpoNotifications";
import {sendVendorLposendbackNotification} from "./sendVendorLposendbackNotification";
import { notifyUser } from "../../../src/helpers/functions";

function formatDateForOracle(date: unknown): string | null {
  if (!date) return null;

  try {
    let dateStr: string;
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dateStr = `${year}-${month}-${day}`;
    } else if (typeof date === "string") {
      const cleanDate = date.split(/[\sT]/)[0];
      if (cleanDate.includes("/") || cleanDate.includes("-")) {
        let parts = cleanDate.split(/[-\/]/);
        if (parts[0].length === 4) {
          dateStr = cleanDate;
        } else {
          dateStr = `${parts[2]}-${parts[1].padStart(
            2,
            "0"
          )}-${parts[0].padStart(2, "0")}`;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      console.error("Invalid date format:", dateStr);
      return null;
    }

    return dateStr;
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return null;
  }
}

function defaultDate(val?: string | Date | null): string | null {
  return val === null || val === undefined || val === ""
    ? formatDateForOracle(new Date())
    : formatDateForOracle(val);
}

function defaultNumber(val: unknown): number {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

function defaultBoolean(val: unknown): number {
  return val ? 1 : 0;
}

function defaultString(value: any): string {
  if (value == null) return "";
  if (typeof value === "object") {
    if (Object.keys(value).length === 0) return "";
    if ("value" in value) return String(value.value ?? "");
    if ("label" in value) return String(value.label ?? "");
    return JSON.stringify(value);
  }
  return String(value);
}

type LpoParams = {
  company_code: string;
  doc_no: string;
};

export const postLpoRequestHandler = async (
  req: Request<LpoParams>,
  res: Response
): Promise<void> => {
  const { company_code, doc_no } = req.params;

  try {
    const sanitizedData: TVendorMain = {
      ...req.body,
      COMPANY_CODE: defaultString(req.body.COMPANY_CODE),
      DOC_NO: defaultString(req.body.DOC_NO),
      DOC_DATE: defaultDate(req.body.DOC_DATE),
      ACCOUNT_DATE: defaultDate(req.body.ACCOUNT_DATE),
      AC_CODE: defaultString(req.body.AC_CODE),
      REMARKS: req.body.REMARKS == null ? "" : String(req.body.REMARKS),
      LAST_ACTION: defaultString(req.body.LAST_ACTION),
      INVOICE_NUMBER: defaultString(req.body.INVOICE_NUMBER),
      INVOICE_DATE: defaultDate(req.body.INVOICE_DATE),
      REF_DOC_NO: defaultString(req.body.REF_DOC_NO),
      items:
        req.body.items?.map((item: DetailsTVendor) => ({
          ...item,
          DOC_DATE: defaultDate(item.DOC_DATE),
          AC_CODE: item.AC_CODE,
        })) ?? [],
    };

    const result = await upsertLpoRequest(sanitizedData);
    console.log("result", result);

    res.status(200).json({
      success: true,
      data: { requestNumber: result },
      message: "LPO saved successfully",
      status: 200,
    });
  } catch (err: any) {
    console.error("Error in postLpoRequestHandler:", err);
    res.status(500).json({
      success: false,
      message: err.message ?? "Internal Server Error",
    });
  }
};

async function sendDataToDotNetAPI(
  companyCode: string,
  docNo: string,
  transaction: any = null
) {
  try {
    // =============================================
    // PART 1: SEND ONLY FILES TO .NET API
    // =============================================
    const fileDataResult = await oracleDb.query(
      `SELECT 
        REQUEST_NUMBER, 
        SR_NO, 
        ORG_FILE_NAME, 
        AWS_FILE_LOCN, 
        EXTENSIONS, 
        USER_FILE_NAME, 
        ATTACHMENT_SR_NO
      FROM UPLOADED_FILES_DLTS_VENDOR
      WHERE REQUEST_NUMBER = :docNo 
      AND (FILE_TRANSFER != 'Y' OR FILE_TRANSFER IS NULL)`,
      { docNo: { val: docNo } },
      transaction
    );
    const fileData: any[] = fileDataResult.rows || fileDataResult;

    // Send each file to .NET API
    let filesSentSuccessfully = 0;
    for (const file of fileData) {
      try {
        await VendorService.insertUploadedFile(file);
        filesSentSuccessfully++;
        console.log(`✅ File sent successfully: ${file.ORG_FILE_NAME} (SR_NO: ${file.SR_NO})`);
      } catch (error: any) {
        console.error(`❌ Failed to send file: ${file.ORG_FILE_NAME}`, error);
        
        // Send notification but don't stop - files are not critical for main data transfer
        const apiError = error?.response?.data ?? error;
        const apiMessage = (apiError && (apiError.message || apiError.error)) || error?.message || String(error);

        const notifPayload = {
          event: "VENDOR_API_FILE_ERROR",
          message: `Failed to upload file to .NET API for Document No: ${docNo}.\nFile: ${file.ORG_FILE_NAME}\nError: ${apiMessage}`,
          subject: "Vendor API File Upload Failed",
          request_user: "Sagar.b@bayanattechnology.com,Sandeep.dandekar@bayanattechnology.com,prem@bayanattechnology.com",
          cc: "prem@bayanattechnology.com",
          htmlMessage: `
            <h3>Vendor API File Upload Failed</h3>
            <p><strong>Document No:</strong> ${docNo}</p>
            <p><strong>File Name:</strong> ${escapeHtml(file.ORG_FILE_NAME)}</p>
            <p><strong>Error Message:</strong> ${escapeHtml(apiMessage)}</p>
          `,
        };

        try {
          await notifyUser(notifPayload);
        } catch (notifErr) {
          console.error("notifyUser failed:", notifErr);
        }
      }
    }

    // Update FILE_TRANSFER flag for successfully sent files
    if (filesSentSuccessfully > 0) {
      try {
        console.log(`Updating FILE_TRANSFER for REQUEST_NUMBER=${docNo}. Files found: ${fileData.length}`);
        console.log(`File details:`, fileData.map(f => ({ SR_NO: f.SR_NO, ORG_FILE_NAME: f.ORG_FILE_NAME, ATTACHMENT_SR_NO: f.ATTACHMENT_SR_NO })));

        const parsedDocNo = Number(docNo);
        const requestNumberBind = !isNaN(parsedDocNo) ? { requestNumber: { val: parsedDocNo } } : { requestNumber: { val: docNo } };

        const updateResult: any = await oracleDb.query(
          `UPDATE UPLOADED_FILES_DLTS_VENDOR
           SET FILE_TRANSFER = 'Y' 
           WHERE REQUEST_NUMBER = :requestNumber 
           AND NVL(FILE_TRANSFER,'N') != 'Y'`,
          requestNumberBind,
          transaction
        );

        const rowsAffected = updateResult?.rowsAffected ?? updateResult?.rows?.length;
        console.log(`Updated FILE_TRANSFER flag. rowsAffected=${rowsAffected}`, updateResult);

        // Verification select to show current flags
        try {
          const verify = await oracleDb.query(
            `SELECT SR_NO, ORG_FILE_NAME, NVL(FILE_TRANSFER,'N') AS FILE_TRANSFER FROM UPLOADED_FILES_DLTS_VENDOR WHERE REQUEST_NUMBER = :requestNumber`,
            requestNumberBind
          );
          console.log(`Verification rows for REQUEST_NUMBER=${docNo}:`, verify.rows || verify);
        } catch (verErr) {
          console.error('Error verifying FILE_TRANSFER rows:', verErr);
        }
      } catch (err) {
        console.error('Error updating FILE_TRANSFER flags:', err);
      }
    }

    // =============================================
    // PART 2: CALL ORACLE PROCEDURE FOR HEADER/DETAIL
    // =============================================
    console.log(` Calling Oracle procedure PROC_AWARE_VMS_ENTRY for DOC_NO: ${docNo}`);
    try {
      await VendorService.callAwareVmsEntry(companyCode, docNo, 'SYSTEM');
      console.log(` Oracle procedure executed successfully for DOC_NO: ${docNo}`);
    } catch (spError: any) {
      console.error(`Oracle procedure PROC_AWARE_VMS_ENTRY failed for ${companyCode}/${docNo}:`, spError);

      const apiMessage = spError?.message || String(spError);
      const notifPayload = {
        event: "VENDOR_SP_ERROR",
        message: `Stored procedure PROC_AWARE_VMS_ENTRY failed for Document ${docNo} (Company: ${companyCode}). Error: ${apiMessage}`,
        subject: "Vendor SP Transfer Failed",
        request_user: "Sagar.b@bayanattechnology.com,Sandeep.dandekar@bayanattechnology.com",
        cc: "prem@bayanattechnology.com",
        htmlMessage: `
          <h3>Vendor SP Transfer Failed</h3>
          <p><strong>Company:</strong> ${escapeHtml(companyCode)}</p>
          <p><strong>Document No:</strong> ${escapeHtml(docNo)}</p>
          <pre>${escapeHtml(apiMessage)}</pre>
        `,
      };

      try {
        await notifyUser(notifPayload);
      } catch (notifErr) {
        console.error("notifyUser failed for SP error:", notifErr);
      }

      throw spError;
    }

    // =============================================
    // PART 3: UPDATE DATA_TRANSFER FLAG
    // =============================================
    await VendorService.updateDataTransferFlag(companyCode, docNo);
    console.log(`Successfully completed all data transfer for DOC_NO: ${docNo}`);
    
  } catch (error) {
    console.error("Error in sendDataToDotNetAPI:", error);
    throw error;
  }
}

// small helper to avoid injecting raw HTML from API errors
function escapeHtml(input: any): string {
  if (input == null) return "";
  const s = typeof input === "string" ? input : JSON.stringify(input);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function upsertLpoRequest(data: TVendorMain) {
  let connection: any;
  let committed = false;
  try {
    connection = await oracleDb.getConnection();
    await connection.execute("BEGIN NULL; END;"); 

    const isAddMode = !data.DOC_NO;
    let generatedRequestNumber = data.DOC_NO;

    // Insert or update the LPO header
    const requestNumber = await upsertLpoRequestHeader(data, connection);

    if (isAddMode) {
      const codeResult: any = await oracleDb.query(
        `SELECT code FROM GT_SESSION_INFO WHERE session_id = SYS_CONTEXT('USERENV','SESSIONID') AND ROWNUM = 1`,
        {},
        connection
      );
      const code = codeResult.rows?.[0]?.CODE || codeResult[0]?.CODE;
      if (code) {
        generatedRequestNumber = code;
      }
    }

    // Insert or update the LPO details
    await upsertLpoRequestDetails(
      data.items ?? [],
      data.COMPANY_CODE,
      generatedRequestNumber ?? "",
      data.AC_CODE,
      data.LAST_ACTION,
      connection
    );

    await connection.commit();
    committed = true;

    // Fetch the latest FINAL_APPROVED from the database
    const result: any = await oracleDb.query(
      `SELECT FINAL_APPROVED
       FROM TR_AC_LPO_HEADER 
       WHERE COMPANY_CODE = :companyCode AND DOC_NO = :docNo`,
      {
        companyCode: { val: data.COMPANY_CODE },
        docNo: { val: generatedRequestNumber },
      },
      connection
    );
    const LAST_ACTION =
      result.rows?.[0]?.FINAL_APPROVED || result[0]?.FINAL_APPROVED;

    if (LAST_ACTION === "YES") {
      console.log(
        `Sending data to .NET API for DOC_NO: ${generatedRequestNumber}`
      );
      await sendDataToDotNetAPI(
        data.COMPANY_CODE,
        generatedRequestNumber ?? ""
      );
    }

    return generatedRequestNumber;
  } catch (error) {
    if (connection && !committed) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

async function upsertLpoRequestHeader(
  data: TVendorMain,
  connection: any
): Promise<string> {
  let isNew = false;

  const company_code = defaultString(data.COMPANY_CODE);
  const doc_no = defaultString(data.DOC_NO);
  const ac_code = defaultString(data.AC_CODE);

  const rowsResult = await oracleDb.query(
    `SELECT COUNT(*) as cnt 
     FROM TR_AC_LPO_HEADER 
     WHERE COMPANY_CODE = :companyCode AND DOC_NO = :docNo `,
    {
      companyCode: { val: company_code },
      docNo: { val: doc_no }
    
    },
    connection
  );

  const rows = rowsResult.rows || rowsResult;
  if (rows.length > 0 && rows[0].CNT === 0) {
    isNew = true;
  }

  if (isNew) {
    const insertQuery = `
      INSERT INTO TR_AC_LPO_HEADER (
        INVOICE_NUMBER, INVOICE_DATE, COMPANY_CODE, DOC_TYPE, DOC_NO, DOC_DATE, ACCOUNT_DATE, 
        AC_CODE, REF_NO, REF_DATE, REMARKS, CURR_CODE, EX_RATE, CANCELED, 
        CREATE_USER, EDIT_USER, CREATE_DATE, EDIT_DATE, LAST_SERIAL_NO, 
        PAYMENT_TERMS, CREDIT_PERIOD, DUE_DATE, REF_DOC_NO, REF_DOC_TYPE,
        PARTY_NAME, PARTY_ADDRESS, PARTY_PHONE, PARTY_FAX, INV_GENERATED,
        DELIVERY_TO, DLVR_CONTACT, DLVR_EMAIL, DLVR_MOBILE, DLVR_TERM, DIV_CODE,
        CASH_IND, APP_REF_NO, TX_CAT_CODE, TX_COMPNTCAT_CODE_1, TX_COMPNTCAT_CODE_2,
        TX_COMPNTCAT_CODE_3, TX_COMPNTCAT_CODE_4, TX_COMPNT_1_EXPMT, LAST_ACTION, 
        DATA_TRANSFER, PDO_TYPE,REF_DOC1,REF_DOC2,REF_DOC3
      ) VALUES (
        :invoiceNumber,
        TO_DATE(:invoiceDate, 'YYYY-MM-DD'),
        :companyCode,
        :docType,
        :docNo,
        TO_DATE(:docDate, 'YYYY-MM-DD'),
        TO_DATE(:accountDate, 'YYYY-MM-DD'),
        :acCode,
        :refNo,
        CASE WHEN :refDate IS NOT NULL THEN TO_DATE(:refDate, 'YYYY-MM-DD') ELSE NULL END,
        :remarks,
        :currCode,
        :exRate,
        :canceled,
        :createUser,
        :editUser,
        TO_DATE(:createDate, 'YYYY-MM-DD'),
        TO_DATE(:editDate, 'YYYY-MM-DD'),
        :lastSerialNo,
        :paymentTerms,
        :creditPeriod,
        CASE WHEN :dueDate IS NOT NULL THEN TO_DATE(:dueDate, 'YYYY-MM-DD') ELSE NULL END,
        :refDocNo,
        :refDocType,
        :partyName,
        :partyAddress,
        :partyPhone,
        :partyFax,
        :invGenerated,
        :deliveryTo,
        :dlvrContact,
        :dlvrEmail,
        :dlvrMobile,
        :dlvrTerm,
        :divCode,
        :cashInd,
        :appRefNo,
        :txCatCode,
        :txCompntcatCode_1,
        :txCompntcatCode_2,
        :txCompntcatCode_3,
        :txCompntcatCode_4,
        :txCompnt_1_expmT,
        :lastAction,
        :dataTransfer,
        :pdoType,
        :refdoc1,
        :refdoc2,
        :refdoc3
      )
    `;

    const replacements = {
      invoiceNumber: { val: defaultString(data.INVOICE_NUMBER) },
      invoiceDate: { val: formatDateForOracle(data.INVOICE_DATE) },
      companyCode: { val: company_code },
      docType: { val: defaultString("SAS") },
      docNo: { val: doc_no },
      docDate: { val: formatDateForOracle(data.DOC_DATE) },
      acCode: { val: ac_code },
      refNo: { val: defaultString(data.REF_NO) },
      refDate: { val: formatDateForOracle(data.REF_DATE) },
      remarks: { val: defaultString(data.REMARKS) },
      currCode: { val: defaultString(data.CURR_CODE) },
      exRate: { val: data.EX_RATE ?? 0 },
      canceled: { val: data.CANCELED ?? 0 },
      createUser: { val: defaultString(data.CREATE_USER) },
      editUser: { val: defaultString(data.EDIT_USER) },
      createDate: { val: formatDateForOracle(data.CREATE_DATE || new Date()) },
      editDate: { val: formatDateForOracle(data.EDIT_DATE || new Date()) },
      lastSerialNo: { val: data.LAST_SERIAL_NO ?? 0 },
      paymentTerms: { val: defaultString(data.PAYMENT_TERMS) },
      creditPeriod: { val: data.CREDIT_PERIOD ?? 0 },
      dueDate: { val: formatDateForOracle(data.DUE_DATE) },
      refDocNo: { val: defaultString(data.REF_DOC_NO) },
      refDocType: { val: defaultString(data.REF_DOC_TYPE) },
      partyName: { val: defaultString(data.PARTY_NAME) },
      partyAddress: { val: defaultString(data.PARTY_ADDRESS) },
      partyPhone: { val: defaultString(data.PARTY_PHONE) },
      partyFax: { val: defaultString(data.PARTY_FAX) },
      invGenerated: { val: data.INV_GENERATED ?? 0 },
      deliveryTo: { val: defaultString(data.DELIVERY_TO) },
      dlvrContact: { val: defaultString(data.DLVR_CONTACT) },
      dlvrEmail: { val: defaultString(data.DLVR_EMAIL) },
      dlvrMobile: { val: defaultString(data.DLVR_MOBILE) },
      dlvrTerm: { val: defaultString(data.DLVR_TERM) },
      divCode: { val: defaultString(data.DIV_CODE) },
      cashInd: { val: data.CASH_IND ?? 0 },
      appRefNo: { val: defaultString(data.APP_REF_NO) },
      txCatCode: { val: defaultString(data.TX_CAT_CODE) },
      txCompntcatCode_1: { val: defaultString(data.TX_COMPNTCAT_CODE_1) },
      txCompntcatCode_2: { val: defaultString(data.TX_COMPNTCAT_CODE_2) },
      txCompntcatCode_3: { val: defaultString(data.TX_COMPNTCAT_CODE_3) },
      txCompntcatCode_4: { val: defaultString(data.TX_COMPNTCAT_CODE_4) },
      txCompnt_1_expmT: { val: data.TX_COMPNT_1_EXPMT ?? 0 },
      lastAction: { val: "SAVEASDRAFT" },
      dataTransfer: { val: defaultString(data.DATA_TRANSFER) },
      pdoType: { val: defaultString(data.PDO_TYPE) },
           refdoc1: { val: defaultString(data.REF_DOC1) },
            refdoc2: { val: defaultString(data.REF_DOC2) },
             refdoc3: { val: defaultString(data.REF_DOC3) },
             accountDate: { val: formatDateForOracle(data.ACCOUNT_DATE) },
    };

    await oracleDb.query(insertQuery, replacements, connection);
  } else {
    const updateQuery = `
      UPDATE TR_AC_LPO_HEADER SET 
        REF_DOC1 = :refdoc1,
        REF_DOC2 = :refdoc2,
        REF_DOC3 = :refdoc3,
        ACCOUNT_DATE = CASE WHEN :accountDate IS NOT NULL 
                      THEN TO_DATE(:accountDate, 'YYYY-MM-DD') 
                      ELSE ACCOUNT_DATE END,
        INVOICE_NUMBER = :invoiceNumber, 
        INVOICE_DATE = TO_DATE(:invoiceDate, 'YYYY-MM-DD'),
        LAST_ACTION = :lastAction,
        AC_CODE = :acCode, 
        REF_DOC_NO = :refDocNo, 
        REF_DATE = CASE WHEN :refDate IS NOT NULL THEN TO_DATE(:refDate, 'YYYY-MM-DD') ELSE NULL END,
        REMARKS = :remarks,
        CURR_CODE = :currCode, 
        EX_RATE = :exRate, 
      
        EDIT_USER = :editUser, 
        EDIT_DATE = TO_DATE(:editDate, 'YYYY-MM-DD')
      WHERE COMPANY_CODE = :companyCode AND DOC_TYPE = :docType AND DOC_NO = :docNo 
    `;

    const updateReplacements = {
         refdoc1: { val: defaultString(data.REF_DOC1) },
            refdoc2: { val: defaultString(data.REF_DOC2) },
             refdoc3: { val: defaultString(data.REF_DOC3) },
             accountDate: { val: formatDateForOracle(data.ACCOUNT_DATE) },
      invoiceNumber: { val: defaultString(data.INVOICE_NUMBER) },
      invoiceDate: { val: formatDateForOracle(data.INVOICE_DATE) },
      lastAction: { val: defaultString(data.LAST_ACTION) },
      acCode: { val: ac_code },
      refDocNo: { val: defaultString(data.REF_DOC_NO) },
      refDate: { val: formatDateForOracle(data.REF_DATE) },
      remarks: { val: defaultString(data.REMARKS) },
      currCode: { val: defaultString(data.CURR_CODE) },
      exRate: { val: data.EX_RATE ?? 0 },
     
      editUser: { val: defaultString(data.EDIT_USER) },
      editDate: { val: formatDateForOracle(new Date()) },
      companyCode: { val: company_code },
      docType: { val: defaultString(data.DOC_TYPE) },
      docNo: { val: doc_no },
    };

    await oracleDb.query(updateQuery, updateReplacements, connection);
  }
  await sendVendorLpoNotifications({ companyCode: company_code, docNo: doc_no }, connection);
  return data.DOC_NO ?? "";
}

async function upsertLpoRequestDetails(
  items: DetailsTVendor[],
  companyCode: string,
  docNo: string,
  header_ac_code: string,
  last_action: string,
  connection: any
) {
  const key_doc_no = docNo;
  console.log("inside detail", key_doc_no);
  console.log("inside detail companyCode:", companyCode);

  await oracleDb.query(
    `DELETE FROM TR_AC_LPO_DETAIL WHERE COMPANY_CODE = :companyCode AND DOC_NO = :docNo AND HEADER_AC_CODE = :headerAcCode`,
    {
      companyCode: { val: companyCode },
      docNo: { val: key_doc_no },
      headerAcCode: { val: header_ac_code },
    },
    connection
  );

  for (const item of items) {
    console.log('inside item loop ', item.QTY);
   /* if (
      (last_action === "SUBMITTED" || last_action === "APPROVED") &&
      (!item.QTY || item.QTY <= 0)
    ) {
      console.log(
        `Skipping insert for SERIAL_NO=${item.SERIAL_NO} due to QTY=${item.QTY} and last_action=${last_action}`
      );
      continue;
    }*/

    const insertQuery = `
    INSERT INTO TR_AC_LPO_DETAIL (ITEM_REMARK,
      SERIAL_NO, COMPANY_CODE, DOC_TYPE, DOC_NO, DOC_DATE, AC_CODE,
      HEADER_AC_CODE, REMARKS, AMOUNT, SIGN_IND, CURR_CODE,
      EX_RATE, LCUR_AMOUNT, CANCELLED, JOB_NO, DEPT_CODE, QTY,
      PRICE, UOM, REF_DOC_TYPE, REF_DOC_NO, PROD_CODE, QTY_RCV,
      OTHER_REMARKS, AMOUNT_RCV, DIV_CODE, TX_CAT_CODE,
      TX_COMPNTCAT_CODE_1, TX_COMPNTCAT_CODE_2, TX_COMPNTCAT_CODE_3, TX_COMPNTCAT_CODE_4,
      TX_COMPNT_PERC_1, TX_COMPNT_PERC_2, TX_COMPNT_PERC_3, TX_COMPNT_PERC_4,
      TX_COMPNT_AMT_1, TX_COMPNT_AMT_2, TX_COMPNT_AMT_3, TX_COMPNT_AMT_4,
      TX_COMPNT_LCURAMT_1, TX_COMPNT_LCURAMT_2, TX_COMPNT_LCURAMT_3, TX_COMPNT_LCURAMT_4,
      TX_COMPNT_1_EXPMT, TX_COMPNT_2_EXPMT, TX_COMPNT_3_EXPMT, TX_COMPNT_4_EXPMT,
      EDIT_USER, CREATE_USER
    ) VALUES (:ITEM_REMARK,
      :SERIAL_NO, :COMPANY_CODE, :DOC_TYPE, :DOC_NO, 
      TO_DATE(:DOC_DATE, 'YYYY-MM-DD'),
      :AC_CODE, :HEADER_AC_CODE, :REMARKS, :AMOUNT, :SIGN_IND, :CURR_CODE,
      :EX_RATE, :LCUR_AMOUNT, :CANCELLED, :JOB_NO, :DEPT_CODE, :QTY,
      :PRICE, :UOM, :REF_DOC_TYPE, :REF_DOC_NO, :PROD_CODE, :QTY_RCV,
      :OTHER_REMARKS, :AMOUNT_RCV, :DIV_CODE, :TX_CAT_CODE,
      :TX_COMPNTCAT_CODE_1, :TX_COMPNTCAT_CODE_2, :TX_COMPNTCAT_CODE_3, :TX_COMPNTCAT_CODE_4,
      :TX_COMPNT_PERC_1, :TX_COMPNT_PERC_2, :TX_COMPNT_PERC_3, :TX_COMPNT_PERC_4,
      :TX_COMPNT_AMT_1, :TX_COMPNT_AMT_2, :TX_COMPNT_AMT_3, :TX_COMPNT_AMT_4,
      :TX_COMPNT_LCURAMT_1, :TX_COMPNT_LCURAMT_2, :TX_COMPNT_LCURAMT_3, :TX_COMPNT_LCURAMT_4,
      :TX_COMPNT_1_EXPMT, :TX_COMPNT_2_EXPMT, :TX_COMPNT_3_EXPMT, :TX_COMPNT_4_EXPMT,
      :EDIT_USER, :CREATE_USER
    )`;

    const safe = (val: any) => (val === undefined ? null : val);

    // Ensure DOC_DATE is properly formatted
    let docDate = null;
    if (item.DOC_DATE) {
      try {
        if (typeof item.DOC_DATE === "string") {
          docDate = formatDateForOracle(item.DOC_DATE);
        } else if (item.DOC_DATE instanceof Date) {
          docDate = formatDateForOracle(item.DOC_DATE);
        }
      } catch (error) {
        console.error("Error formatting DOC_DATE:", error);
        docDate = null;
      }
    }

    const replacements = {
        ITEM_REMARK: { val: safe(defaultString(item.ITEM_REMARK)) },
      SERIAL_NO: { val: safe(item.SERIAL_NO) },
      COMPANY_CODE: { val: safe(companyCode) },
      DOC_TYPE: { val: safe(defaultString(item.DOC_TYPE)) },
      DOC_NO: { val: safe(defaultString(docNo)) },
      DOC_DATE: { val: safe(docDate) },
      AC_CODE: { val: safe(defaultString(item.AC_CODE)) },
      HEADER_AC_CODE: { val: safe(defaultString(item.HEADER_AC_CODE)) },
      REMARKS: { val: safe(defaultString(item.REMARKS)) },
      AMOUNT: { val: safe(item.AMOUNT) },
      SIGN_IND: { val: safe(defaultString(item.SIGN_IND)) },
      CURR_CODE: { val: safe(defaultString(item.CURR_CODE)) },
      EX_RATE: { val: safe(item.EX_RATE) },
      LCUR_AMOUNT: { val: safe(item.LCUR_AMOUNT) },
      CANCELLED: { val: safe(item.CANCELLED) },
      JOB_NO: { val: safe(defaultString(item.JOB_NO)) },
      DEPT_CODE: { val: safe(defaultString(item.DEPT_CODE)) },
      QTY: { val: safe(item.QTY) },
      PRICE: { val: safe(item.PRICE) },
      UOM: { val: safe(defaultString(item.UOM)) },
      REF_DOC_TYPE: { val: safe(defaultString(item.REF_DOC_TYPE)) },
      REF_DOC_NO: { val: safe(defaultString(item.REF_DOC_NO)) },
      PROD_CODE: { val: safe(defaultString(item.PROD_CODE)) },
      QTY_RCV: { val: safe(item.QTY_RCV) },
      OTHER_REMARKS: { val: safe(defaultString(item.OTHER_REMARKS)) },
      AMOUNT_RCV: { val: safe(item.AMOUNT_RCV) },
      DIV_CODE: { val: safe(defaultString(item.DIV_CODE)) },
      TX_CAT_CODE: { val: safe(defaultString(item.TX_CAT_CODE)) },
      TX_COMPNTCAT_CODE_1: {
        val: safe(defaultString(item.TX_COMPNTCAT_CODE_1)),
      },
      TX_COMPNTCAT_CODE_2: {
        val: safe(defaultString(item.TX_COMPNTCAT_CODE_2)),
      },
      TX_COMPNTCAT_CODE_3: {
        val: safe(defaultString(item.TX_COMPNTCAT_CODE_3)),
      },
      TX_COMPNTCAT_CODE_4: {
        val: safe(defaultString(item.TX_COMPNTCAT_CODE_4)),
      },
      TX_COMPNT_PERC_1: { val: safe(item.TX_COMPNT_PERC_1) },
      TX_COMPNT_PERC_2: { val: safe(item.TX_COMPNT_PERC_2) },
      TX_COMPNT_PERC_3: { val: safe(item.TX_COMPNT_PERC_3) },
      TX_COMPNT_PERC_4: { val: safe(item.TX_COMPNT_PERC_4) },
      TX_COMPNT_AMT_1: { val: safe(item.TX_COMPNT_AMT_1) },
      TX_COMPNT_AMT_2: { val: safe(item.TX_COMPNT_AMT_2) },
      TX_COMPNT_AMT_3: { val: safe(item.TX_COMPNT_AMT_3) },
      TX_COMPNT_AMT_4: { val: safe(item.TX_COMPNT_AMT_4) },
      TX_COMPNT_LCURAMT_1: { val: safe(item.TX_COMPNT_LCURAMT_1) },
      TX_COMPNT_LCURAMT_2: { val: safe(item.TX_COMPNT_LCURAMT_2) },
      TX_COMPNT_LCURAMT_3: { val: safe(item.TX_COMPNT_LCURAMT_3) },
      TX_COMPNT_LCURAMT_4: { val: safe(item.TX_COMPNT_LCURAMT_4) },
      TX_COMPNT_1_EXPMT: { val: safe(item.TX_COMPNT_1_EXPMT) },
      TX_COMPNT_2_EXPMT: { val: safe(item.TX_COMPNT_2_EXPMT) },
      TX_COMPNT_3_EXPMT: { val: safe(item.TX_COMPNT_3_EXPMT) },
      TX_COMPNT_4_EXPMT: { val: safe(item.TX_COMPNT_4_EXPMT) },
      EDIT_USER: { val: safe(defaultString(item.EDIT_USER)) },
      CREATE_USER: { val: safe(defaultString(item.CREATE_USER)) },
    };

    try {
      await oracleDb.query(insertQuery, replacements, connection);
    } catch (error) {
      console.error("Insert error details:", {
        error,
        docDate,
        replacements,
      });
      throw error;
    }
  }
}

function formatResultDates(row: any): any {
  if (!row) return row;

  const dateFields = [
    "DOC_DATE",
    "INVOICE_DATE",
    "CREATE_DATE",
    "EDIT_DATE",
    "REF_DATE",
    "DUE_DATE",
    "ACCOUNT_DATE", 
  ];

  const formattedRow = { ...row };
  for (const field of dateFields) {
    if (formattedRow[field]) {
      try {
        if (formattedRow[field] instanceof Date) {
          const date = formattedRow[field];
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          formattedRow[field] = `${day}-${month}-${year}`;
        } else if (typeof formattedRow[field] === "string") {
          // Handle string date
          if (formattedRow[field].includes("T")) {
            // Handle ISO date string
            const date = new Date(formattedRow[field]);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            formattedRow[field] = `${day}-${month}-${year}`;
          } else if (formattedRow[field].includes("-")) {
            // Convert YYYY-MM-DD to DD-MM-YYYY if needed
            const parts = formattedRow[field].split("-");
            if (parts[0].length === 4) {
              formattedRow[field] = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }
        }
      } catch (error) {
        console.error(`Error formatting ${field}:`, error);
      }
    }
  }
  return formattedRow;
}

export const executeRawSql = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let rawSql: string = req.body?.raw_sql || req.query?.sql;

    if (!rawSql || typeof rawSql !== "string") {
      res.status(400).json({ error: "Missing or invalid raw SQL string" });
      return;
    }

    rawSql = rawSql.replace(/\bLEVEL\b(?=\s*[><=])/g, '"LEVEL"');

    // Modify the SQL to format dates if they're not already formatted
    if (
      rawSql.toLowerCase().includes("select") &&
      !rawSql.toLowerCase().includes("to_char")
    ) {
      const dateColumns = [
        "DOC_DATE",
        "INVOICE_DATE",
        "CREATE_DATE",
        "EDIT_DATE",
        "REF_DATE",
        "DUE_DATE",
      ];
      for (const col of dateColumns) {
        const regex = new RegExp(`\\b${col}\\b(?![^,]*TO_CHAR)`, "g");
        rawSql = rawSql.replace(
          regex,
          `TO_CHAR(${col}, 'DD-MM-YYYY') as ${col}`
        );
      }
    }

    console.log("Executing modified rawSql:", rawSql);
    const result = await oracleDb.query(rawSql);
    const rows = result.rows || result;

    // Format dates in the result
    const formattedRows = Array.isArray(rows)
      ? rows.map((row) => formatResultDates(row))
      : rows;

    res.json({
      success: true,
      data: formattedRows,
      totalCount: Array.isArray(formattedRows) ? formattedRows.length : 0,
    });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    res.status(500).json({
      error: "Failed to execute SQL",
      details: error.message,
    });
  }
};

export const getAccountsList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { company_code, ac_code } = req.query as Record<string, string>;
    const accounts = await VendorService.getAccountsList(company_code, ac_code);
    res.status(200).json({ success: true, data: accounts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDivisionList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const divisions = await VendorService.getDivisionList();
    res.status(200).json({ success: true, data: divisions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingLPOList = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { company_code, ac_code } = req.query as Record<string, string>;
  try {
    const lpoList = await VendorService.getPendingLPOList(
      company_code,
      ac_code
    );
    res.status(200).json({ success: true, data: lpoList });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingLPODetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { company_code, div_code, ac_code, doc_no } = req.query as Record<
    string,
    string
  >;
  try {
    const lpoDetail = await VendorService.getPendingLPODetail(
      company_code,
      ac_code,
      doc_no
    );
    res.status(200).json({ success: true, data: lpoDetail });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getdynamicdata = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { vs_parameter, vs_where } = req.body as {
      vs_parameter: string;
      vs_where: string;
    };

    console.log("Received body:", vs_parameter, vs_where);

    const result = await VendorService.getdynamicdata(vs_parameter, vs_where);

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    console.error("Error in getdynamicdata:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const checkAccountEmployeeHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { p_userid } = req.query as { p_userid: string };

    const data = await VendorService.checkAccountEmployee(p_userid);

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Error in checkAccountEmployeeHandler:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPartyAccountStatement = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { company_code, ac_code, doc_date_from, doc_date_to } =
    req.query as Record<string, string>;

  try {
    const data = await VendorService.getPartyAccountStatement(
      company_code,
      ac_code,
      doc_date_from,
      doc_date_to
    );
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Error in getPartyAccountStatement:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPartyOutstanding = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { company_code, ac_code } = req.query as Record<string, string>;

  try {
    const data = await VendorService.getPartyOutstanding(company_code, ac_code);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Error in getPartyOutstanding:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
//save attachment
// export const saveFileVendorHR = async (
//   req: Request,
//   res: Response
// ): Promise<Response | void> => {
//   const { request_number, files } = req.body;

//   if (!request_number) {
//     return res.status(400).json({
//       success: false,
//       message: "request_number is required.",
//     });
//   }

//   if (!files || !Array.isArray(files) || files.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "files must be a non-empty array.",
//     });
//   }

//   const duplicateRecords: string[] = [];
//   const successfulRecords: { org_file_name: string; sr_no: number }[] = [];

//   try {
//     for (const file of files) {
//       const { org_file_name } = file;

//       const duplicateCheckResult = await oracleDb.query(
//         `SELECT COUNT(*) AS COUNT 
//          FROM UPLOADED_FILES_DLTS_VH 
//          WHERE request_number = :request_number AND org_file_name = :org_file_name`,
//         {
//           request_number: { val: request_number },
//           org_file_name: { val: org_file_name },
//         }
//       );

//       const count = duplicateCheckResult.rows?.[0]?.COUNT || 0;

//       if (count > 0) {
//         duplicateRecords.push(org_file_name);
//         continue;
//       }

//       const {
//         company_code,
//         file_name,
//         extensions,
//         aws_file_locn,
//         flow_level,
//         modules,
//         updated_by,
//         created_by,
//         user_file_name,
//       } = file;

//       await oracleDb.query(
//         `INSERT INTO UPLOADED_FILES_DLTS_VH (
//           company_code, request_number, file_name, extensions, org_file_name,
//           aws_file_locn, flow_level, modules, updated_by, created_by, 
//           user_file_name, created_at, updated_at
//         ) VALUES (
//           :company_code, :request_number, :file_name, :extensions, :org_file_name,
//           :aws_file_locn, :flow_level, :modules, :updated_by, :created_by,
//           :user_file_name, SYSDATE, SYSDATE
//         )`,
//         {
//           company_code: { val: company_code || null },
//           request_number: { val: request_number },
//           file_name: { val: file_name || null },
//           extensions: { val: extensions || null },
//           org_file_name: { val: org_file_name || null },
//           aws_file_locn: { val: aws_file_locn || null },
//           flow_level: { val: flow_level || null },
//           modules: { val: modules || null },
//           updated_by: { val: updated_by || null },
//           created_by: { val: created_by || null },
//           user_file_name: { val: user_file_name || null },
//         }
//       );

//       // Fetch SR_NO
//       const srNoResult = await oracleDb.query(
//         `SELECT SR_NO 
//          FROM UPLOADED_FILES_DLTS_VH 
//          WHERE request_number = :request_number 
//          AND org_file_name = :org_file_name 
//          ORDER BY created_at DESC 
//          FETCH FIRST 1 ROW ONLY`,
//         {
//           request_number: { val: request_number },
//           org_file_name: { val: org_file_name },
//         }
//       );

//       const sr_no = srNoResult.rows?.[0]?.SR_NO;
//       if (sr_no) {
//         successfulRecords.push({ org_file_name, sr_no });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "File data processed successfully.",
//       data: {
//         successfulRecords,
//         duplicateRecords,
//       },
//     });
//   } catch (error) {
//     console.error("Error storing file data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while storing file data.",
//       error: error instanceof Error ? error.message : String(error),
//     });
//   }
// };
export const saveFileVendorHR = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { request_number, files } = req.body;

  if (!request_number) {
    return res.status(400).json({
      success: false,
      message: "request_number is required.",
    });
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "files must be a non-empty array.",
    });
  }

  const duplicateRecords: string[] = [];
  const successfulRecords: { 
    org_file_name: string; 
    sr_no: number; 
    attachment_sr_no: number 
  }[] = [];

  try {
    for (const file of files) {
      const { org_file_name, sr_no } = file;

      // Check for duplicates (now checking with SR_NO too)
      const duplicateCheckResult = await oracleDb.query(
        `SELECT COUNT(*) AS COUNT 
         FROM UPLOADED_FILES_DLTS_VENDOR 
         WHERE request_number = :request_number 
           AND org_file_name = :org_file_name
           AND (sr_no = :sr_no OR (:sr_no IS NULL AND sr_no = 0))`,
        {
          request_number: { val: request_number },
          org_file_name: { val: org_file_name },
          sr_no: { val: sr_no || null },
        }
      );

      const count = duplicateCheckResult.rows?.[0]?.COUNT || 0;

      if (count > 0) {
        duplicateRecords.push(org_file_name);
        continue;
      }

      const {
        company_code,
        file_name,
        extensions,
        aws_file_locn,
        flow_level,
        modules,
        updated_by,
        created_by,
        user_file_name,
        type,
        file_transfer,
      } = file;

      // INSERT with all columns including the new ones
      await oracleDb.query(
        `INSERT INTO UPLOADED_FILES_DLTS_VENDOR (
          company_code, request_number, sr_no, file_name, extensions, 
          org_file_name, aws_file_locn, flow_level, modules, updated_by, 
          created_by, user_file_name, created_at, updated_at,
          type, file_transfer
        ) VALUES (
          :company_code, :request_number, :sr_no, :file_name, :extensions, 
          :org_file_name, :aws_file_locn, :flow_level, :modules, :updated_by, 
          :created_by, :user_file_name, SYSDATE, SYSDATE,
          :type, :file_transfer
        )`,
        {
          company_code: { val: company_code || null },
          request_number: { val: request_number },
          sr_no: { val: sr_no || null },  
          file_name: { val: file_name || null },
          extensions: { val: extensions || null },
          org_file_name: { val: org_file_name || null },
          aws_file_locn: { val: aws_file_locn || null },
          flow_level: { val: flow_level || null },
          modules: { val: modules || null },
          updated_by: { val: updated_by || null },
          created_by: { val: created_by || null },
          user_file_name: { val: user_file_name || null },
          type: { val: type || null },
          file_transfer: { val: file_transfer || null }
        }
      );

      // Fetch both SR_NO and ATTACHMENT_SR_NO
      const result = await oracleDb.query(
        `SELECT SR_NO, ATTACHMENT_SR_NO 
         FROM UPLOADED_FILES_DLTS_VENDOR 
         WHERE request_number = :request_number 
           AND org_file_name = :org_file_name 
           AND (sr_no = :sr_no OR (:sr_no IS NULL AND sr_no = 0))
         ORDER BY created_at DESC 
         FETCH FIRST 1 ROW ONLY`,
        {
          request_number: { val: request_number },
          org_file_name: { val: org_file_name },
          sr_no: { val: sr_no || null },
        }
      );

      const sr_no_result = result.rows?.[0]?.SR_NO;
      const attachment_sr_no = result.rows?.[0]?.ATTACHMENT_SR_NO;
      
      if (sr_no_result !== undefined) {
        successfulRecords.push({ 
          org_file_name, 
          sr_no: sr_no_result, 
          attachment_sr_no 
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "File data processed successfully.",
      data: {
        successfulRecords,
        duplicateRecords,
      },
    });
  } catch (error) {
    console.error("Error storing file data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while storing file data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getInvoiceStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { company_code, ac_code, po_date_from, po_date_to } =
    req.query as Record<string, string>;

  try {
    const data = await VendorService.getInvoiceStatus(
      company_code,
      ac_code,
      po_date_from,
      po_date_to
    );
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Error in getInvoiceStatusHandler:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export async function processSubmittedRecords(
  companyCode?: string,
  docNo?: string
) {
  try {
    let records: any[];
    if (companyCode && docNo) {
      records = [{ COMPANY_CODE: companyCode, DOC_NO: docNo }];
    } else {
      // Fetch all submitted records
      records = await oracleDb.query(
        `SELECT COMPANY_CODE, DOC_NO 
         FROM TR_AC_LPO_HEADER 
         WHERE FINAL_APPROVED = 'YES' AND DATA_TRANSFER != 'Y'
         FETCH FIRST 1 ROWS ONLY`
      );
    }

    for (const record of records) {
      const { COMPANY_CODE, DOC_NO } = record;
      try {
        await sendDataToDotNetAPI(COMPANY_CODE, DOC_NO);
      } catch (error) {
        console.error(`Error processing record ${DOC_NO}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching submitted records:", error);
  }
}

export const getTmpAcHeaderWithErpDocNoHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { loginid } = req.query as { loginid: string };

  if (!loginid) {
    res.status(400).json({ success: false, message: "loginid is required" });
    return;
  }

  try {
    const data = await VendorService.getTmpAcHeaderWithErpDocNo(loginid);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Error in getTmpAcHeaderWithErpDocNoHandler:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const updateLpoStatusHandler = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { doc_no, company_code, flow_level, remarks, action } = req.body;

//   console.log("Updating LPO status:", {
//     doc_no,
//     company_code,
//     flow_level,
//     remarks,
//     action,
//   });

//   if (
//     !doc_no ||
//     !company_code ||
//     typeof flow_level !== "number" ||
//     !remarks ||
//     !action
//   ) {
//     res.status(400).json({
//       success: false,
//       message:
//         "Missing required parameters: doc_no, company_code, flow_level, remarks, action",
//     });
//     return;
//   }

//   if (action !== "SENTBACK" && action !== "REJECTED") {
//     res.status(400).json({
//       success: false,
//       message: "Invalid action (must be SENTBACK or REJECTED)",
//     });
//     return;
//   }

//   try {
//     // Check if record exists
//     const existingResult = await oracleDb.query(
//       "SELECT DOC_NO FROM TR_AC_LPO_HEADER WHERE DOC_NO = :doc_no AND COMPANY_CODE = :company_code",
//       {
//         doc_no: { val: doc_no },
//         company_code: { val: company_code },
//       }
//     );

//     const existing = existingResult.rows?.[0] || existingResult[0];

//     if (!existing) {
//       res.status(404).json({
//         success: false,
//         message: "LPO not found with the provided DOC_NO and COMPANY_CODE",
//       });
//       return;
//     }

//     const historyField =
//       action === "SENTBACK" ? "SENDBACK_HISTORY" : "REJECT_HISTORY";

//     const query = `
//       UPDATE TR_AC_LPO_HEADER
//       SET
//         FLOW_LEVEL = :flow_level,
//         ${historyField} = COALESCE(${historyField}, '') || ' | ' || :remarks,
//         LAST_ACTION = :action
//       WHERE DOC_NO = :doc_no AND COMPANY_CODE = :company_code
//     `;

//     const updateResult = await oracleDb.query(query, {
//       flow_level: { val: flow_level },
//       remarks: { val: remarks },
//       action: { val: action },
//       doc_no: { val: doc_no },
//       company_code: { val: company_code },
//     });

//     const affectedRows = updateResult.rowsAffected || 0;

//     res.json({
//       success: true,
//       message: `LPO marked as ${action.toLowerCase()}`,
//       affectedRows: affectedRows,
//     });
//   } catch (err: any) {
//     console.error("Error in updateLpoStatusHandler:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message ?? "Internal Server Error",
//     });
//   }
// };

export const updateLpoStatusHandler = async (req: Request, res: Response): Promise<void> => {
  const { doc_no, company_code, flow_level, remarks, action } = req.body;

  if (!doc_no || !company_code || typeof flow_level !== "number" || !remarks || !action) {
    res.status(400).json({
      success: false,
      message: "Missing required parameters: doc_no, company_code, flow_level, remarks, action",
    });
    return;
  }

  if (action !== "SENTBACK" && action !== "REJECTED") {
    res.status(400).json({ success: false, message: "Invalid action (must be SENTBACK or REJECTED)" });
    return;
  }

  try {
    const existingResult = await oracleDb.query(
      "SELECT DOC_NO FROM TR_AC_LPO_HEADER WHERE DOC_NO = :doc_no AND COMPANY_CODE = :company_code",
      { doc_no: { val: doc_no }, company_code: { val: company_code } }
    );
    const existing = existingResult.rows?.[0] || existingResult[0];
    if (!existing) {
      res.status(404).json({ success: false, message: "LPO not found with the provided DOC_NO and COMPANY_CODE" });
      return;
    }

    const historyField = action === "SENTBACK" ? "SENDBACK_HISTORY" : "REJECT_HISTORY";

    // Optional: add separator only when existing value is non-empty
    const query = `
      UPDATE TR_AC_LPO_HEADER
         SET FLOW_LEVEL = :flow_level,
             ${historyField} = CASE
               WHEN NVL(TRIM(${historyField}), '') = '' THEN :remarks
               ELSE ${historyField} || ' | ' || :remarks
             END,
             LAST_ACTION = :action
       WHERE DOC_NO = :doc_no AND COMPANY_CODE = :company_code
    `;

    const updateResult = await oracleDb.query(query, {
      flow_level: { val: flow_level },
      remarks: { val: remarks },   
      action: { val: action },
      doc_no: { val: doc_no },
      company_code: { val: company_code },
    });

    // ✅ Send emails now
    await sendVendorLposendbackNotification(
      {
        action,
        docNo: doc_no,
        companyCode: company_code,
        flowLevel: flow_level,
      }
    );

    res.json({
      success: true,
      message: `LPO marked as ${action.toLowerCase()}`,
      affectedRows: updateResult.rowsAffected || 0,
    });
  } catch (err: any) {
    console.error("Error in updateLpoStatusHandler:", err);
    res.status(500).json({
      success: false,
      message: err.message ?? "Internal Server Error",
    });
  }
};

export const executeRawSqlbody = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query_parameter, query_where, query_updatevalues } = req.body;

    if (!query_parameter || !query_where) {
      res.status(400).json({
        error: "Missing query_parameter or query_where",
      });
      return;
    }

    const cleanWhere = query_where.replace(/`/g, "").trim();
    const cleanUpdate = (query_updatevalues || "").replace(/`/g, "").trim();

    console.log("Final WHERE string:", cleanWhere);
    console.log("Final UPDATE values string:", cleanUpdate);

    const procResult = await oracleDb.query(
      `BEGIN SP_CREATE_SQL_change(:query_parameter, :query_where, :query_updatevalues, :out_sql); END;`,
      {
        query_parameter,
        query_where: cleanWhere,
        query_updatevalues: cleanUpdate,
        out_sql: {
          dir: require("oracledb").BIND_OUT,
          type: require("oracledb").STRING,
          maxSize: 4000,
        },
      }
    );

    let rawSql: string = procResult.outBinds?.out_sql || procResult.out_sql;
    if (!rawSql) {
      res.status(500).json({ error: "Procedure did not return SQL" });
      return;
    }

    rawSql = rawSql.trim().replace(/;$/, "");
    console.log("Generated rawSql:", rawSql);

    const result = await oracleDb.query(rawSql);
    const rows = result.rows || result;

    res.json({
      success: true,
      data: rows,
      totalCount: rows.length,
    });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    res.status(500).json({
      error: "Failed to execute SQL",
      details: error.message,
    });
  }
};


export const proc_build_dynamic_sql = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      parameter,
      code1,
      code2,
      code3,
      number1,
      number2,
      number3,
      number4,
      date1,
      date2,
      date3,
      date4,
    } = req.body;

    if (!parameter) {
      res.status(400).json({ error: "Missing required parameter 'parameter'" });
      return;
    }

    // 1️⃣ Build PL/SQL block (uses a RETURNED OUT bind through your wrapper)
    const plsql = `
      DECLARE
        v_raw_sql VARCHAR2(4000);
      BEGIN
        PROC_BUILD_DYNAMIC_SQL(
          :parameter,
          :code1,
          :code2,
          :code3,
          :number1,
          :number2,
          :number3,
          :number4,
          :date1,
          :date2,
          :date3,
          :date4,
          v_raw_sql
        );
        :out_sql := v_raw_sql;
      END;
    `;

    // 2️⃣ Execute the stored procedure using your wrapper
    const procResult = await oracleDb.query(plsql, {
      parameter,
      code1,
      code2,
      code3,
      number1,
      number2,
      number3,
      number4,
      date1,
      date2,
      date3,
      date4,
      out_sql: { dir: "OUT", type: "STRING", maxSize: 4000 }, // <- works because your wrapper handles this
    });

    const rawSql =
      procResult?.outBinds?.out_sql ||
      procResult?.rows?.out_sql ||
      procResult?.out_sql;

    if (!rawSql) {
      res.status(500).json({ error: "Procedure did not return SQL" });
      return;
    }

    console.log("Generated SQL:", rawSql);

    // 3️⃣ Execute the returned dynamic SQL
    const execResult = await oracleDb.query(rawSql);

    const rows = execResult.rows || execResult;

    // 4️⃣ Format dates (same logic used in executeRawSql)
    const formattedRows = Array.isArray(rows)
      ? rows.map((row) => formatResultDates(row))
      : rows;

    res.json({
      success: true,
      data: formattedRows,
      totalCount: Array.isArray(formattedRows) ? formattedRows.length : 0,
    });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    res.status(500).json({
      error: "Failed to execute SQL",
      details: error.message,
    });
  }
};

export const executeVendorInvoicePrintHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { COMPANY_CODE, DOC_NO, LOGIN_USER } =
      req.body && Object.keys(req.body).length
        ? req.body
        : (req.query as Record<string, string>);

    if (!COMPANY_CODE || !DOC_NO || !LOGIN_USER) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters: COMPANY_CODE, DOC_NO, LOGIN_USER",
      });
      return;
    }

    const plsql = `
      BEGIN
        PROC_VENDOR_INVOICE_PRINT(:companyCode, :docNo, :loginUser);
      END;
    `;

    await oracleDb.query(
      plsql,
      {
        companyCode: { val: COMPANY_CODE },
        docNo: { val: DOC_NO },
        loginUser: { val: LOGIN_USER },
      }
    );

    res.status(200).json({
      success: true,
      message: `Procedure executed successfully for ${COMPANY_CODE}/${DOC_NO}`,
    });
  } catch (error: any) {
    console.error("Error executing PROC_VENDOR_INVOICE_PRINT:", error);
    res.status(500).json({
      success: false,
      message: "Failed to execute procedure",
      details: error?.message || String(error),
    });
  }
};
