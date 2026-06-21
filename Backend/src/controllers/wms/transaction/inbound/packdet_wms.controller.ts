import { Request, Response } from "express";
import oracledb from "oracledb";
import constants from "../../../../helpers/constants";
import { IPackDetailEDI } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";
import { oracleDb } from "../../../../database/connection";

// === Safe Utilities ===
function safeDate(val: any): Date | null {
  return val ? new Date(val) : null;
}

function safeString(val: any): string {
  return typeof val === "string" ? val : '';
}

function safeNumber(val: any): number {
  return typeof val === "number" ? val : 0;
}

// ==================== Insert Pack Detail EDI ====================
export async function insertPackDetailEDI(data: IPackDetailEDI, connection: oracledb.Connection): Promise<void> {
  const sql = `
    INSERT INTO TI_PACKDET_EDI (
      USER_ID, COMPANY_CODE, PRIN_CODE, JOB_NO, PACKDET_NO, CONTAINER_NO,
      VESSEL_NAME, VOYAGE_NO, PROD_CODE, P_UOM, QTY_PUOM,
      L_UOM, QTY_LUOM, UNIT_PRICE, CURR_CODE, LOT_NO,
      MFG_DATE, EXP_DATE, MANU_CODE, ORIGIN_COUNTRY,
      FROM_SITE, TO_SITE, LOCATION_FROM, LOCATION_TO,
      BATCH_NO, PO_NO, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY
    ) VALUES (
      :user_id, :company_code, :prin_code, :job_no, :packdet_no, :container_no,
      :vessel_name, :voyage_no, :prod_code, :puom, :qty_puom,
      :luom, :qty_luom, :unit_price, :curr_code, :lot_no,
      :mfg_date, :exp_date, :manu_code, :origin_country,
      :from_site, :to_site, :location_from, :location_to,
      :batch_no, :po_no, :created_at, :created_by, :updated_at, :updated_by
    )
  `;

  await connection.execute(
    sql,
    {
      user_id: safeString(data.user_id),
      company_code: safeString(data.company_code),
      prin_code: safeString(data.prin_code),
      job_no: safeString(data.job_no),
      packdet_no: safeString(data.packdet_no),
      container_no: safeString(data.container_no),
      vessel_name: safeString(data.vessel_name),
      voyage_no: safeString(data.voyage_no),
      prod_code: safeString(data.product_code),
      puom: safeString(data.puom),
      qty_puom: safeNumber(data.qty_puom),
      luom: safeString(data.luom),
      qty_luom: safeNumber(data.qty_luom),
      unit_price: safeNumber(data.unit_price),
      curr_code: safeString(data.curr_code),
      lot_no: safeString(data.lot_no),
      mfg_date: safeDate(data.mfg_date),
      exp_date: safeDate(data.exp_date),
      manu_code: safeString(data.manu_code),
      origin_country: safeString(data.origin_country),
      from_site: safeString(data.from_site),
      to_site: safeString(data.to_site),
      location_from: safeString(data.location_from),
      location_to: safeString(data.location_to),
      batch_no: safeString(data.batch_no),
      po_no: safeString(data.po_no),
      created_at: data.created_at ?? new Date(),
      created_by: safeString(data.created_by),
      updated_at: data.updated_at ?? new Date(),
      updated_by: safeString(data.updated_by)
    },
    { autoCommit: false }
  );
}

// ==================== Upsert Handler ====================
export const upsertPackDetailEDIHandler = async (req: Request, res: Response) => {
  let connection: oracledb.Connection | undefined;
  try {
    const records: IPackDetailEDI[] = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Request body must be a non-empty array of pack detail EDI records",
      });
      return;
    }

    const requiredFields: (keyof IPackDetailEDI)[] = ["job_no", "prin_code", "company_code", "user_id"];

    for (const [index, record] of records.entries()) {
      const missingFields = requiredFields.filter((field) => !record[field]);
      if (missingFields.length > 0) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: `Record at index ${index} is missing required field(s): ${missingFields.join(", ")}`,
        });
        return;
      }
    }

    connection = await oracleDb.getConnection();
    
    const bindParams: oracledb.BindParameters = { user_id: records[0].user_id };
    
    await connection.execute(
      `DELETE FROM TI_PACKDET_EDI WHERE USER_ID = :user_id`,
      bindParams,
      { autoCommit: false }
    );

    for (const record of records) {
      await insertPackDetailEDI(record, connection);
    }

    await connection.commit();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Pack detail EDI records inserted successfully",
    });
  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("Insert TI_PACKDET_EDI Error:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to insert TI_PACKDET_EDI records",
    });
  } finally {
    if (connection) await connection.close();
  }
};

// ==================== Copy EDI to Packdet ====================
export const copyEDIToPackdetHandler = async (req: Request, res: Response) => {
  let connection: oracledb.Connection | undefined;
  try {
    const { login_id, job_no, prin_code, company_code } = req.body;

    connection = await oracleDb.getConnection();

    const bindParams: oracledb.BindParameters = { 
      P_loginid: login_id, 
      P_jobno: job_no, 
      P_princode: prin_code, 
      P_company_code: company_code 
    };

    const sql = `BEGIN PRO_COPY_INWARDEDI_TO_PACKDET(:P_loginid, :P_jobno, :P_princode, :P_company_code); END;`;
    await connection.execute(
      sql,
      bindParams,
      { autoCommit: true }
    );

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "EDI records copied to TI_PACKDET_EDI successfully",
    });
  } catch (error: any) {
    console.error("❌ Error in copyEDIToPackdetHandler:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "An error occurred while copying EDI records",
    });
  } finally {
    if (connection) await connection.close();
  }
};

// ==================== Get EDI Packdet ====================
export const getEDIPackdetHandler = async (req: Request, res: Response) => {
  let connection: oracledb.Connection | undefined;
  try {
    const { user_id, company_code, prin_code, job_no } = req.query;

    if (!user_id || !company_code || !prin_code || !job_no) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: 'Missing required parameters: user_id, company_code, prin_code, job_no',
      });
      return;
    }

    connection = await oracleDb.getConnection();

    const bindParams: oracledb.BindParameters = { 
      user_id: String(user_id), 
      company_code: String(company_code), 
      prin_code: String(prin_code), 
      job_no: String(job_no) 
    };

    const result = await connection.execute(
      `SELECT *
       FROM TI_PACKDET_EDI
       WHERE user_id = :user_id
         AND company_code = :company_code
         AND prin_code = :prin_code
         AND job_no = :job_no`,
      bindParams,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: 'No matching EDI pack detail found',
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error('SQL Error:', error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to fetch EDI pack detail using Oracle SQL',
    });
  } finally {
    if (connection) await connection.close();
  }
};
