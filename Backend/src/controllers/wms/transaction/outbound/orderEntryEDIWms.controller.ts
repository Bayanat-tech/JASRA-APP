import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IEDIOrderDetail } from "../../../../interfaces/wms/transaction/outbound/orderEntryWms.interface";

// === Safe Utilities ===
function safeDate(val: any): string | null {
  if (!val) return null;
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function safeString(val: any): string {
  return typeof val === "string" ? val : "";
}

function safeNumber(val: any): number {
  return typeof val === "number" ? val : 0;
}

// === Insert Logic for TO_ORDER_EDI ===
export async function insertEDIOrderDetail(
  data: IEDIOrderDetail,
  connection: oracledb.Connection
): Promise<void> {
  const insertQuery = `
    INSERT INTO TO_ORDER_EDI (
      user_id, company_code, prin_code, job_no, product_code, site_code, puom, qty1, luom, qty2, lotno,
      location_from, location_to, salesman_code, expiry_date_from, expiry_date_to,
      batch_no, mfg_date_from, mfg_date_to, customer_store_name, order_no,
      cust_code, serial_no, serial_number
    ) VALUES (
      :user_id, :company_code, :prin_code, :job_no, :product_code, :site_code, :puom, :qty1, :luom, :qty2, :lotno,
      :location_from, :location_to, :salesman_code, :expiry_date_from, :expiry_date_to,
      :batch_no, :mfg_date_from, :mfg_date_to, :customer_store_name, :order_no,
      :cust_code, :serial_no, :serial_number
    )
  `;

  await connection.execute(
    insertQuery,
    {
      user_id: data.user_id,
      company_code: data.company_code || "JASRA",
      prin_code: data.prin_code,
      job_no: data.job_no,
      product_code: data.product_code,
      site_code: data.site_code ?? null,
      puom: data.puom ?? null,
      qty1: safeNumber(data.qty1),
      luom: data.luom ?? null,
      qty2: safeNumber(data.qty2),
      lotno: data.lotno ?? null,
      location_from: data.location_from ?? null,
      location_to: data.location_to ?? null,
      salesman_code: data.salesman_code ?? null,
      expiry_date_from: safeDate(data.expiry_date_from),
      expiry_date_to: safeDate(data.expiry_date_to),
      batch_no: data.batch_no ?? null,
      mfg_date_from: safeDate(data.mfg_date_from),
      mfg_date_to: safeDate(data.mfg_date_to),
      customer_store_name: data.customer_store_name ?? null,
      order_no: data.order_no,
      cust_code: data.cust_code,
      serial_no: data.serial_no,
      serial_number: data.serial_number ?? "-",
    },
    { autoCommit: false }
  );
}

// === API Handlers ===
export const upsertEDIOrderDetailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const records: IEDIOrderDetail[] = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Request body must be a non-empty array of EDI order details",
      });
      return;
    }

    const requiredFields: (keyof IEDIOrderDetail)[] = [
      "job_no",
      "prin_code",
      "company_code",
      "product_code",
      "order_no",
      "cust_code",
      "user_id",
    ];

    for (const [index, record] of records.entries()) {
      const missingFields = requiredFields.filter((field) => !record[field]);
      if (missingFields.length > 0) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: `Record at index ${index} is missing required field(s): ${missingFields.join(
            ", "
          )}`,
        });
        return;
      }
    }

    connection = await oracleDb.getConnection();

    await connection.execute(
      `DELETE FROM TO_ORDER_EDI WHERE user_id = :user_id`,
      { user_id: records[0].user_id },
      { autoCommit: false }
    );

    for (const record of records) {
      await insertEDIOrderDetail(record, connection);
    }

    await connection.commit();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "EDI Order details inserted successfully",
    });
  } catch (error: unknown) {
    if (connection) await connection.rollback();
    console.error("Insert EDI Order Detail Error:", error);

    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to insert EDI order details",
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const getEDIOrderDetailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user_id, company_code, prin_code, job_no } = req.query;
  let connection: oracledb.Connection | undefined;

  if (!user_id || !company_code || !prin_code || !job_no) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: "Missing required parameters: user_id, company_code, prin_code, job_no",
    });
    return;
  }

  try {
    connection = await oracleDb.getConnection();

   const result = await connection.execute(
  `SELECT *
   FROM TO_ORDER_EDI
   WHERE user_id = :user_id
     AND company_code = :company_code
     AND prin_code = :prin_code
     AND job_no = :job_no`,
  {
    user_id: String(user_id),
    company_code: String(company_code),
    prin_code: String(prin_code),
    job_no: String(job_no),
  },
  {
    outFormat: oracledb.OUT_FORMAT_OBJECT, // important for getting results as objects
  }
);


    const rows = result.rows || [];

    if (rows.length === 0) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "No matching EDI order detail found",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: rows,
    });
  } catch (error: unknown) {
    console.error("SQL Error:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch EDI order detail",
    });
  } finally {
    if (connection) await connection.close();
  }
};

export const copyEDIToOrderDetailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { login_id, job_no, prin_code, company_code } = req.body;
  let connection: oracledb.Connection | undefined;

  if (!login_id || !job_no || !prin_code || !company_code) {
    res.status(400).json({
      success: false,
      message: "login_id, job_no, prin_code, and company_code are required",
    });
    return;
  }

  try {
    connection = await oracleDb.getConnection();

    console.log("📞 Calling stored procedure PRO_COPY_OUTWARDEDI_TO_ORDRD_DET...");
    await connection.execute(
      `BEGIN PRO_COPY_OUTWARDEDI_TO_ORDRD_DET(:P_loginid, :P_jobno, :P_princode, :P_company_code); END;`,
      {
        P_loginid: login_id.toString(),
        P_jobno: job_no.toString(),
        P_princode: prin_code.toString(),
        P_company_code: company_code.toString(),
      },
      { autoCommit: true }
    );

    res.status(200).json({
      success: true,
      message: "EDI records copied to TO_ORDER_DET successfully",
    });
  } catch (error: unknown) {
    if (connection) await connection.rollback();
    console.error("Error in copyEDIToOrderDetailHandler:", error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (connection) await connection.close();
  }
};
