import oracledb, { Connection, Result } from "oracledb";
import { oracleDb } from "../../database/connection";

interface Filter {
  sort?: {
    field_name: string;
    desc?: boolean;
  };
}

interface PoModifyRow {
  [key: string]: any;
  total_count?: number;
}
export const getPoModifyRatechangeData = async (
  loginid: string,
  company_code: string,
  filter?: Filter,
  page = 1,
  limit = 4000
) => {
  let conn: Connection | null = null;

  try {
    if (!loginid || !company_code) {
      return {
        success: false,
        data: [],
        count: 0,
        message: "Both loginid and company_code are required.",
      };
    }

    conn = await oracleDb.getConnection();

    console.log("Calling procedure with:", company_code, loginid);

    // Execute procedure
    await conn.execute(
      `BEGIN PROC_POPULATE_GT_CLOSE(:p_user, :p_company); END;`,
      { p_company: company_code, p_user: loginid }
    );

    console.log("Procedure executed successfully");

    // Sorting
    let orderBy = "";
    if (filter?.sort?.field_name) {
      orderBy = ` ORDER BY "${filter.sort.field_name.toUpperCase()}" ${
        filter.sort.desc ? "DESC" : "ASC"
      } `;
    }

    const offset = (page - 1) * limit;

    // Fetch ONLY required columns + filter request_number LIKE '%PO%'
    const dataResult: Result<PoModifyRow> = await conn.execute(
      `
      SELECT 
        request_number,
        document_number,
        request_date,
        description,
        document_type,
        project_name,
        supplier,
        amount,
        status,
        company_name,
        reference_doc_no,
        COUNT(*) OVER() AS total_count
      FROM GT_CLOSE
      WHERE request_number LIKE '%PO%'
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (dataResult.rows as PoModifyRow[]) || [];

    // Convert keys to lowercase
    const tableData = rows.map((row) => {
      const newObj: PoModifyRow = {};
      Object.keys(row).forEach((key) => {
        newObj[key.toLowerCase()] = row[key];
      });
      return newObj;
    });

    const totalCount = tableData.length > 0 ? tableData[0].total_count || 0 : 0;

    return {
      success: true,
      data: tableData,
      count: totalCount,
      message: "Data fetched successfully.",
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err);

    console.error("❌ Error in getPoModifyRatechangeData:", message);

    return {
      success: false,
      data: [],
      count: 0,
      message,
    };
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error("❌ Error closing connection:", closeErr);
      }
    }
  }
};
