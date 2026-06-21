/**
 * @fileoverview Oracle-based upsert logic for TT_BATCH table (Putaway Manual)
 */
import oracledb from "oracledb";
import { oracleDb } from "../../../../database/connection";

import { Request, Response } from "express";
import constants from "../../../../helpers/constants";

import { TPutawaymanual } from "../../../../../src/interfaces/wms/transaction/inbound/manualputaway.interface";
import { TtBatchService } from "../../../../services/WMS/transaction/inbound/ttBatch.service";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Utility: Convert JS Date or dd-mm-yyyy string to Oracle TO_DATE format
 */
function toOracleDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;

  const parts = dateInput.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // yyyy-mm-dd
      return new Date(dateInput);
    } else {
      // dd-mm-yyyy
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}`);
    }
  }
  return null;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry logic for transient Oracle errors
 */
async function retryOnError<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const message = error.message || "";
    if (retries > 0 && /ORA-00060/.test(message)) {
      // ORA-00060: deadlock detected
      console.warn("Deadlock detected. Retrying...");
      await sleep(RETRY_DELAY);
      return retryOnError(operation, retries - 1);
    }
    throw error;
  }
}

/**
 * === Main Upsert Function ===
 */
export async function upsertPutawaymanualOracle(
  data: TPutawaymanual
): Promise<string> {
  return retryOnError(async () => {
    let connection: oracledb.Connection | null = null;
    try {
      connection = await oracleDb.getConnection();

      await connection.execute("BEGIN NULL; END;"); // keepalive

      await connection.execute("SAVEPOINT before_upsert");

      const exists = await recordExists(
        data.COMPANY_CODE,
        data.PRIN_CODE,
        data.JOB_NO,
        data.TXN_TYPE,
        data.KEY_NUMBER ?? "",
        connection,
        data.PACKDET_NO || 0
      );

      if (exists) {
        await updatePutawaymanual(data, connection);
      } else {
        await insertPutawaymanual(data, connection);
      }

      // Update all records with the same JOB_NO
      await connection.execute(
        `UPDATE TT_BATCH 
         SET CONFIRMED = 'N', 
             SELECTED = 'Y', 
             ALLOCATED = 'Y' 
         WHERE JOB_NO = :jobNo`,
        { jobNo: data.JOB_NO }
      );

      await connection.commit();
      return data.JOB_NO;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (e) {
          console.error("Error closing Oracle connection:", e);
        }
      }
    }
  });
}

/**
 * === Check if record exists ===
 */
async function recordExists(
  companyCode: string,
  prinCode: string,
  jobNo: string,
  txnType: string,
  keyNumber: string,
  connection: oracledb.Connection,
  packdetNo: any
): Promise<boolean> {
  const result = await connection.execute(
    `SELECT 1 
       FROM TT_BATCH 
      WHERE COMPANY_CODE = :companyCode 
        AND PRIN_CODE = :prinCode 
        AND JOB_NO = :jobNo 
        AND TXN_TYPE = :txnType
        AND KEY_NUMBER = :keyNumber
      FETCH FIRST 1 ROWS ONLY`,
    {
      companyCode,
      prinCode,
      jobNo,
      txnType,
      keyNumber,
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  // ✅ Always return a boolean
  return (result.rows?.length ?? 0) > 0;
}

/**
 * === Update TT_BATCH ===
 */
async function updatePutawaymanual(
  data: TPutawaymanual,
  connection: oracledb.Connection
) {
  const sql = `
    UPDATE TT_BATCH SET
      TXN_DATE = :TXN_DATE, PACKDET_NO = :PACKDET_NO, KEY_NUMBER = :KEY_NUMBER, PROD_CODE = :PROD_CODE, SITE_CODE = :SITE_CODE,
      LOCATION_CODE = :LOCATION_CODE, QUANTITY = :QUANTITY, QTY_PUOM = :QTY_PUOM, QTY_LUOM = :QTY_LUOM,
      P_UOM = :P_UOM, L_UOM = :L_UOM, QTY_CONFIRMED = :QTY_CONFIRMED, PQTY_CONFIRMED = :PQTY_CONFIRMED,
      LQTY_CONFIRMED = :LQTY_CONFIRMED, PUOM_CONFIRMED = :PUOM_CONFIRMED, LUOM_CONFIRMED = :LUOM_CONFIRMED,
      UPPP = :UPPP, PACK_KEY = :PACK_KEY, UPP = :UPP, CONFIRM_DATE = :CONFIRM_DATE,
      CUST_CODE = :CUST_CODE, ORDER_NO = :ORDER_NO, ORDER_SRNO = :ORDER_SRNO, VESSEL_NAME = :VESSEL_NAME,
      CONTAINER_NO = :CONTAINER_NO, SEAL_NO = :SEAL_NO, PO_NO = :PO_NO, BL_NO = :BL_NO,
      DOC_REF = :DOC_REF, LOT_NO = :LOT_NO, PALLET_ID = :PALLET_ID, PALLET_SERIAL_NO = :PALLET_SERIAL_NO,
      MANU_CODE = :MANU_CODE, MFG_DATE = :MFG_DATE, EXP_DATE = :EXP_DATE, CURR_CODE = :CURR_CODE,
      EX_RATE = :EX_RATE, UNIT_PRICE = :UNIT_PRICE, SELECTED = 'N', ALLOCATED = 'Y', CONFIRMED = 'N',
      USER_ID = :USER_ID, USER_DT = :USER_DT, APPLIED_KEYNO = :APPLIED_KEYNO, RECEIPT_TYPE = :RECEIPT_TYPE,
      RECEIPT_DATE = :RECEIPT_DATE, CONTAINER_SIZE = :CONTAINER_SIZE, MOC1 = :MOC1, MOC2 = :MOC2,
      ORIGIN_COUNTRY = :ORIGIN_COUNTRY, SHELF_LIFE_DAYS = :SHELF_LIFE_DAYS, SHELF_LIFE_DATE = :SHELF_LIFE_DATE,
      TASK_ORDER = :TASK_ORDER, PROD_ATTRIB_CODE = :PROD_ATTRIB_CODE, PROD_GRADE1 = :PROD_GRADE1, PROD_GRADE2 = :PROD_GRADE2,
      TX_IDENTITY_NUMBER = :TX_IDENTITY_NUMBER, ASSIGNED_PDA_USER = :ASSIGNED_PDA_USER, PDA_VERIFIED = :PDA_VERIFIED,
      SUPP_CODE = :SUPP_CODE, PUTAWAY_DT = :PUTAWAY_DT, MASTER_CTN = :MASTER_CTN, LOOSE_CTN = :LOOSE_CTN,
      HS_CODE = :HS_CODE, NET_WT = :NET_WT, NET_VOLUME = :NET_VOLUME, LC_PO_VALUE = :LC_PO_VALUE, GROSS_WT = :GROSS_WT,
      DA_NO = :DA_NO, BATCH_NO = :BATCH_NO, EDIT_USER = :EDIT_USER, CARTON_NO = :CARTON_NO,
      UPDATED_AT = SYSDATE, UPDATED_BY = :updated_by
    WHERE COMPANY_CODE = :COMPANY_CODE AND PRIN_CODE = :PRIN_CODE AND JOB_NO = :JOB_NO AND TXN_TYPE = :TXN_TYPE AND KEY_NUMBER = :KEY_NUMBER
  `;

  await connection.execute(sql, {
    COMPANY_CODE: data.COMPANY_CODE,
    PRIN_CODE: data.PRIN_CODE,
    JOB_NO: data.JOB_NO,
    TXN_TYPE: data.TXN_TYPE,
    TXN_DATE: toOracleDate(data.TXN_DATE),
    PACKDET_NO: data.PACKDET_NO || 0,
    KEY_NUMBER: data.KEY_NUMBER || null,
    PROD_CODE: data.PROD_CODE,
    SITE_CODE: data.SITE_CODE,
    LOCATION_CODE: data.LOCATION_CODE || null,
    QUANTITY: data.QUANTITY,
    QTY_PUOM: data.QTY_PUOM,
    QTY_LUOM: data.QTY_LUOM,
    P_UOM: data.P_UOM,
    L_UOM: data.L_UOM || null,
    QTY_CONFIRMED: data.QTY_CONFIRMED || null,
    PQTY_CONFIRMED: data.PQTY_CONFIRMED || null,
    LQTY_CONFIRMED: data.LQTY_CONFIRMED || null,
    PUOM_CONFIRMED: data.PUOM_CONFIRMED || null,
    LUOM_CONFIRMED: data.LUOM_CONFIRMED || null,
    UPPP: data.UPPP || null,
    PACK_KEY: data.PACK_KEY || null,
    UPP: data.UPP || null,
    CONFIRM_DATE: toOracleDate(data.CONFIRM_DATE),
    CUST_CODE: data.CUST_CODE || null,
    ORDER_NO: data.ORDER_NO || null,
    ORDER_SRNO: data.ORDER_SRNO || null,
    VESSEL_NAME: data.VESSEL_NAME || null,
    CONTAINER_NO: data.CONTAINER_NO || null,
    SEAL_NO: data.SEAL_NO || null,
    PO_NO: data.PO_NO || null,
    BL_NO: data.BL_NO || null,
    DOC_REF: data.DOC_REF || null,
    LOT_NO: data.LOT_NO || null,
    PALLET_ID: data.PALLET_ID || null,
    PALLET_SERIAL_NO: data.PALLET_SERIAL_NO || null,
    MANU_CODE: data.MANU_CODE || null,
    MFG_DATE: toOracleDate(data.MFG_DATE),
    EXP_DATE: toOracleDate(data.EXP_DATE),
    CURR_CODE: data.CURR_CODE || null,
    EX_RATE: data.EX_RATE || null,
    UNIT_PRICE: data.UNIT_PRICE || null,
    USER_ID: data.USER_ID || null,
    USER_DT: toOracleDate(data.USER_DT),
    APPLIED_KEYNO: data.APPLIED_KEYNO || null,
    RECEIPT_TYPE: data.RECEIPT_TYPE || null,
    RECEIPT_DATE: toOracleDate(data.RECEIPT_DATE),
    CONTAINER_SIZE: data.CONTAINER_SIZE || null,
    MOC1: data.MOC1 || null,
    MOC2: data.MOC2 || null,
    ORIGIN_COUNTRY: data.ORIGIN_COUNTRY || null,
    SHELF_LIFE_DAYS: data.SHELF_LIFE_DAYS || null,
    SHELF_LIFE_DATE: toOracleDate(data.SHELF_LIFE_DATE),
    TASK_ORDER: data.TASK_ORDER || null,
    PROD_ATTRIB_CODE: data.PROD_ATTRIB_CODE || null,
    PROD_GRADE1: data.PROD_GRADE1 || null,
    PROD_GRADE2: data.PROD_GRADE2 || null,
    TX_IDENTITY_NUMBER: data.TX_IDENTITY_NUMBER || null,
    ASSIGNED_PDA_USER: data.ASSIGNED_PDA_USER || null,
    PDA_VERIFIED: data.PDA_VERIFIED || null,
    SUPP_CODE: data.SUPP_CODE || null,
    PUTAWAY_DT: toOracleDate(data.PUTAWAY_DT),
    MASTER_CTN: data.MASTER_CTN || null,
    LOOSE_CTN: data.LOOSE_CTN || null,
    HS_CODE: data.HS_CODE || null,
    NET_WT: data.NET_WT || null,
    NET_VOLUME: data.NET_VOLUME || null,
    LC_PO_VALUE: data.LC_PO_VALUE || null,
    GROSS_WT: data.GROSS_WT || null,
    DA_NO: data.DA_NO || null,
    BATCH_NO: data.BATCH_NO || null,
    EDIT_USER: data.EDIT_USER || null,
    CARTON_NO: data.CARTON_NO || null,
    updated_by: data.updated_by || null,
  });
}

/**
 * === Insert TT_BATCH ===
 */
async function insertPutawaymanual(
  data: TPutawaymanual,
  connection: oracledb.Connection
) {
  const sql = `
    INSERT INTO TT_BATCH (
      COMPANY_CODE, PRIN_CODE, JOB_NO, TXN_TYPE, TXN_DATE, PACKDET_NO, KEY_NUMBER, PROD_CODE, SITE_CODE, LOCATION_CODE,
      QUANTITY, QTY_PUOM, QTY_LUOM, P_UOM, L_UOM, QTY_CONFIRMED, PQTY_CONFIRMED, LQTY_CONFIRMED,
      PUOM_CONFIRMED, LUOM_CONFIRMED, UPPP, PACK_KEY, UPP, CONFIRM_DATE, CUST_CODE, ORDER_NO,
      ORDER_SRNO, VESSEL_NAME, CONTAINER_NO, SEAL_NO, PO_NO, BL_NO, DOC_REF, LOT_NO, PALLET_ID,
      PALLET_SERIAL_NO, MANU_CODE, MFG_DATE, EXP_DATE, CURR_CODE, EX_RATE, UNIT_PRICE,
      SELECTED, ALLOCATED, CONFIRMED, IDENTITY_NUMBER, USER_ID, USER_DT, APPLIED_KEYNO,
      RECEIPT_TYPE, RECEIPT_DATE, CONTAINER_SIZE, MOC1, MOC2, ORIGIN_COUNTRY, SHELF_LIFE_DAYS,
      SHELF_LIFE_DATE, TASK_ORDER, PROD_ATTRIB_CODE, PROD_GRADE1, PROD_GRADE2, TX_IDENTITY_NUMBER,
      ASSIGNED_PDA_USER, PDA_VERIFIED, SUPP_CODE, PUTAWAY_DT, MASTER_CTN, LOOSE_CTN, HS_CODE,
      NET_WT, NET_VOLUME, LC_PO_VALUE, GROSS_WT, DA_NO, BATCH_NO, EDIT_USER, CARTON_NO,
      CREATED_BY, UPDATED_BY, CREATED_AT, UPDATED_AT
    ) VALUES (
      :COMPANY_CODE, :PRIN_CODE, :JOB_NO, :TXN_TYPE, :TXN_DATE, :PACKDET_NO, :KEY_NUMBER, :PROD_CODE, :SITE_CODE, :LOCATION_CODE,
      :QUANTITY, :QTY_PUOM, :QTY_LUOM, :P_UOM, :L_UOM, :QTY_CONFIRMED, :PQTY_CONFIRMED, :LQTY_CONFIRMED,
      :PUOM_CONFIRMED, :LUOM_CONFIRMED, :UPPP, :PACK_KEY, :UPP, :CONFIRM_DATE, :CUST_CODE, :ORDER_NO,
      :ORDER_SRNO, :VESSEL_NAME, :CONTAINER_NO, :SEAL_NO, :PO_NO, :BL_NO, :DOC_REF, :LOT_NO, :PALLET_ID,
      :PALLET_SERIAL_NO, :MANU_CODE, :MFG_DATE, :EXP_DATE, :CURR_CODE, :EX_RATE, :UNIT_PRICE,
      'N', 'Y', 'N', :IDENTITY_NUMBER, :USER_ID, :USER_DT, :APPLIED_KEYNO,
      :RECEIPT_TYPE, :RECEIPT_DATE, :CONTAINER_SIZE, :MOC1, :MOC2, :ORIGIN_COUNTRY, :SHELF_LIFE_DAYS,
      :SHELF_LIFE_DATE, :TASK_ORDER, :PROD_ATTRIB_CODE, :PROD_GRADE1, :PROD_GRADE2, :TX_IDENTITY_NUMBER,
      :ASSIGNED_PDA_USER, :PDA_VERIFIED, :SUPP_CODE, :PUTAWAY_DT, :MASTER_CTN, :LOOSE_CTN, :HS_CODE,
      :NET_WT, :NET_VOLUME, :LC_PO_VALUE, :GROSS_WT, :DA_NO, :BATCH_NO, :EDIT_USER, :CARTON_NO,
      :created_by, :updated_by, SYSDATE, SYSDATE
    )
  `;

  await connection.execute(sql, {
    COMPANY_CODE: data.COMPANY_CODE,
    PRIN_CODE: data.PRIN_CODE,
    JOB_NO: data.JOB_NO,
    TXN_TYPE: data.TXN_TYPE,
    TXN_DATE: toOracleDate(data.TXN_DATE),
    PACKDET_NO: data.PACKDET_NO,
    KEY_NUMBER: data.KEY_NUMBER || null,
    PROD_CODE: data.PROD_CODE,
    SITE_CODE: data.SITE_CODE,
    LOCATION_CODE: data.LOCATION_CODE || null,
    QUANTITY: data.QUANTITY,
    QTY_PUOM: data.QTY_PUOM,
    QTY_LUOM: data.QTY_LUOM,
    P_UOM: data.P_UOM,
    L_UOM: data.L_UOM || null,
    QTY_CONFIRMED: data.QTY_CONFIRMED || null,
    PQTY_CONFIRMED: data.PQTY_CONFIRMED || null,
    LQTY_CONFIRMED: data.LQTY_CONFIRMED || null,
    PUOM_CONFIRMED: data.PUOM_CONFIRMED || null,
    LUOM_CONFIRMED: data.LUOM_CONFIRMED || null,
    UPPP: data.UPPP || null,
    PACK_KEY: data.PACK_KEY || null,
    UPP: data.UPP || null,
    CONFIRM_DATE: toOracleDate(data.CONFIRM_DATE),
    CUST_CODE: data.CUST_CODE || null,
    ORDER_NO: data.ORDER_NO || null,
    ORDER_SRNO: data.ORDER_SRNO || null,
    VESSEL_NAME: data.VESSEL_NAME || null,
    CONTAINER_NO: data.CONTAINER_NO || null,
    SEAL_NO: data.SEAL_NO || null,
    PO_NO: data.PO_NO || null,
    BL_NO: data.BL_NO || null,
    DOC_REF: data.DOC_REF || null,
    LOT_NO: data.LOT_NO || null,
    PALLET_ID: data.PALLET_ID || null,
    PALLET_SERIAL_NO: data.PALLET_SERIAL_NO || null,
    MANU_CODE: data.MANU_CODE || null,
    MFG_DATE: toOracleDate(data.MFG_DATE),
    EXP_DATE: toOracleDate(data.EXP_DATE),
    CURR_CODE: data.CURR_CODE || null,
    EX_RATE: data.EX_RATE || null,
    UNIT_PRICE: data.UNIT_PRICE || null,
    IDENTITY_NUMBER: data.IDENTITY_NUMBER,
    USER_ID: data.USER_ID || null,
    USER_DT: toOracleDate(data.USER_DT),
    APPLIED_KEYNO: data.APPLIED_KEYNO || null,
    RECEIPT_TYPE: data.RECEIPT_TYPE || null,
    RECEIPT_DATE: toOracleDate(data.RECEIPT_DATE),
    CONTAINER_SIZE: data.CONTAINER_SIZE || null,
    MOC1: data.MOC1 || null,
    MOC2: data.MOC2 || null,
    ORIGIN_COUNTRY: data.ORIGIN_COUNTRY || null,
    SHELF_LIFE_DAYS: data.SHELF_LIFE_DAYS || null,
    SHELF_LIFE_DATE: toOracleDate(data.SHELF_LIFE_DATE),
    TASK_ORDER: data.TASK_ORDER || null,
    PROD_ATTRIB_CODE: data.PROD_ATTRIB_CODE || null,
    PROD_GRADE1: data.PROD_GRADE1 || null,
    PROD_GRADE2: data.PROD_GRADE2 || null,
    TX_IDENTITY_NUMBER: data.TX_IDENTITY_NUMBER || null,
    ASSIGNED_PDA_USER: data.ASSIGNED_PDA_USER || null,
    PDA_VERIFIED: data.PDA_VERIFIED || null,
    SUPP_CODE: data.SUPP_CODE || null,
    PUTAWAY_DT: toOracleDate(data.PUTAWAY_DT),
    MASTER_CTN: data.MASTER_CTN || null,
    LOOSE_CTN: data.LOOSE_CTN || null,
    HS_CODE: data.HS_CODE || null,
    NET_WT: data.NET_WT || null,
    NET_VOLUME: data.NET_VOLUME || null,
    LC_PO_VALUE: data.LC_PO_VALUE || null,
    GROSS_WT: data.GROSS_WT || null,
    DA_NO: data.DA_NO || null,
    BATCH_NO: data.BATCH_NO || null,
    EDIT_USER: data.EDIT_USER || null,
    CARTON_NO: data.CARTON_NO || null,
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  });
}

/**
 * === Express API Handler (Oracle Raw SQL) ===
 */
export const upsertPutawaymanualHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: TPutawaymanual = req.body;

    const requiredFields: (keyof TPutawaymanual)[] = [
      "COMPANY_CODE",
      "PRIN_CODE",
      "JOB_NO",
      "TXN_TYPE",
      "PROD_CODE",
      "SITE_CODE",
      "P_UOM",
      "updated_by",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
      return;
    }

    const jobNo = await upsertPutawaymanualOracle(data);
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "TT_BATCH record upserted successfully.",
      job_no: jobNo,
    });
  } catch (error: any) {
    console.error("Upsert TT_BATCH Error:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to upsert TT_BATCH.",
    });
  }
};

/**
 * === Express API Handler (TypeORM) ===
 * Uses TypeORM instead of raw Oracle SQL
 */
export const upsertPutawaymanualHandlerTypeORM = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: TPutawaymanual = req.body;

    const requiredFields: (keyof TPutawaymanual)[] = [
      "COMPANY_CODE",
      "PRIN_CODE",
      "JOB_NO",
      "TXN_TYPE",
      "PROD_CODE",
      "SITE_CODE",
      "P_UOM",
      "IDENTITY_NUMBER",
      "updated_by",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
      return;
    }

    const result = await TtBatchService.upsertPutawaymanual(data);
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "TT_BATCH record upserted successfully (TypeORM).",
      job_no: result.JOB_NO,
      packdet_no: result.PACKDET_NO,
    });
  } catch (error: any) {
    console.error("Upsert TT_BATCH Error (TypeORM):", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to upsert TT_BATCH.",
    });
  }
};
