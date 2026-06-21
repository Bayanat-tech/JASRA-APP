import { Request, Response } from "express";
import { oracleDb } from "./../../../src/database/connection";
import constants from "../../../src/helpers/constants";
import { RequestWithUser } from "../../../src/interfaces/common.interface";
import { IUser } from "../../../src/interfaces/user.interface";

function formatOracleDate(date: any): string | null {
  if (!date) return null;
  if (typeof date === "string") {
    return date;
  }
  // Convert Oracle date to DD-MM-YYYY format
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export const getVendorrequest = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    console.log("inside getVendorrequest");

    const { doc_no } = req.params;
    console.log("doc_no (raw):", doc_no);

    if (typeof doc_no !== "string") {
      console.error("Error: doc_no is not a string.", doc_no);
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid document number",
      });
      return;
    }

    // Split doc_no into new_doc_no and ac_code
    const [new_doc_no, ac_code] = doc_no.split("$$$");
    console.log("new_doc_no:", new_doc_no, "ac_code:", ac_code);

    if (!new_doc_no || !ac_code) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid doc_no format. Expected 'DOCNO$$ACCODE'",
      });
      return;
    }

    const queryHeader = `
      SELECT 
        COMPANY_CODE,
        DOC_TYPE,
        DOC_NO,
        TO_CHAR(DOC_DATE, 'DD-MM-YYYY') as DOC_DATE,
        TO_CHAR(INVOICE_DATE, 'DD-MM-YYYY') as INVOICE_DATE,
        TO_CHAR(CREATE_DATE, 'DD-MM-YYYY') as CREATE_DATE,
        TO_CHAR(EDIT_DATE, 'DD-MM-YYYY') as EDIT_DATE,
        TO_CHAR(REF_DATE, 'DD-MM-YYYY') as REF_DATE,
        TO_CHAR(DUE_DATE, 'DD-MM-YYYY') as DUE_DATE,
        TO_CHAR(ACCOUNT_DATE, 'DD-MM-YYYY') as ACCOUNT_DATE,
        AC_CODE,
        REF_NO,
        REMARKS,
        CURR_CODE,
        EX_RATE,
        CANCELED,
        CREATE_USER,
        EDIT_USER,
        LAST_SERIAL_NO,
        PAYMENT_TERMS,
        CREDIT_PERIOD,
        REF_DOC_NO,
        REF_DOC_TYPE,
        PARTY_NAME,
        PARTY_ADDRESS,
        PARTY_PHONE,
        PARTY_FAX,
        INV_GENERATED,
        DELIVERY_TO,
        DLVR_CONTACT,
        DLVR_EMAIL,
        DLVR_MOBILE,
        DLVR_TERM,
        DIV_CODE,
        CASH_IND,
        APP_REF_NO,
        LAST_ACTION,
        INVOICE_NUMBER,
        PDO_TYPE,
        REF_DOC1,
        REF_DOC2,
        REF_DOC3
      FROM TR_AC_LPO_HEADER
      WHERE COMPANY_CODE = 'BSG' 
        AND DOC_NO = :new_doc_no
              AND ROWNUM = 1
    `;

    const queryDetail = `
      SELECT 
      ITEM_REMARK,
        COMPANY_CODE,
        DOC_TYPE,
        DOC_NO,
        SERIAL_NO,
        DOC_DATE,
        AC_CODE,
        HEADER_AC_CODE,
        REMARKS,
        AMOUNT,
        SIGN_IND,
        CURR_CODE,
        EX_RATE,
        LCUR_AMOUNT,
        CANCELLED,
        JOB_NO,
        DEPT_CODE,
        QTY,
        PRICE,
        UOM,
        REF_DOC_TYPE,
        REF_DOC_NO,
        PROD_CODE,
        PDO_TYPE,
        QTY_RCV,
        OTHER_REMARKS,
        AMOUNT_RCV,
        DIV_CODE,
        TX_CAT_CODE,
        TX_COMPNTCAT_CODE_1
      FROM VW_TR_AC_LPO_DETAIL
      WHERE COMPANY_CODE = 'BSG'
        AND DOC_NO = :new_doc_no
           ORDER BY SERIAL_NO
    `;

    // Execute header query
    const headerResult = await oracleDb.query(queryHeader, {
      new_doc_no
 
    });

    console.log("Header query result:", headerResult);

    const VendorHeaderData = headerResult.rows?.[0] || headerResult[0];

    // Execute details query
    const detailResult = await oracleDb.query(queryDetail, {
      new_doc_no

    });
    const VendorDetailData = detailResult.rows || detailResult;

    if (!VendorHeaderData) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Vendor request " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }

    // Modify response to ensure dates are in correct format
    if (VendorHeaderData) {
      const dateFields = [
        "DOC_DATE",
        "INVOICE_DATE",
        "CREATE_DATE",
        "EDIT_DATE",
        "REF_DATE",
        "DUE_DATE",
        "ACCOUNT_DATE", 
      ];
      dateFields.forEach((field) => {
        if (VendorHeaderData[field]) {
          VendorHeaderData[field] = VendorHeaderData[field];
        }
      });
    }

    if (VendorDetailData) {
      VendorDetailData.forEach((detail: any) => {
        if (detail.DOC_DATE) {
          detail.DOC_DATE = detail.DOC_DATE;
        }
      });
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        ...VendorHeaderData,
        items: VendorDetailData,
      },
    });
    return;
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};