import oracledb, { Connection, Result } from "oracledb";
import { oracleDb } from "../../database/connection";

interface Filter {
  sort?: {
    field_name: string;
    desc?: boolean;
  };
}

interface MyHistoryRow {
  [key: string]: any;
  total_count?: number;
}

export const getMyHistory = async (
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

    console.log("Calling procedure PROC_CREATE_MY_HISTORY with:", company_code, loginid);

    // Call procedure to populate GT_MY_HISTORY
    await conn.execute(
      `BEGIN PROC_CREATE_MY_HISTORY(:p_company, :p_user); END;`,
      { p_company: company_code, p_user: loginid }
    );

    let orderBy = "";
    if (filter?.sort?.field_name) {
      orderBy = ` ORDER BY "${filter.sort.field_name.toUpperCase()}" ${
        filter.sort.desc ? "DESC" : "ASC"
      } `;
    }

    const offset = (page - 1) * limit;

    const dataResult: Result<MyHistoryRow> = await conn.execute(
      `
      SELECT t.*, COUNT(*) OVER() AS TOTAL_COUNT
      FROM GT_MY_HISTORY t
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (dataResult.rows as MyHistoryRow[]) || [];

    // Convert uppercase column names → lowercase
    const data = rows.map((row) => {
      const newObj: MyHistoryRow = {};
      Object.keys(row).forEach((key) => {
        newObj[key.toLowerCase()] = row[key];
      });
      return newObj;
    });

    const count = data.length > 0 ? data[0].total_count || 0 : 0;

    console.log("My History Result:", { data, count });

    return {
      success: true,
      data,   // frontend expects response.data.data
      count,  // frontend expects response.data.count
      message: "Data fetched successfully.",
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err);

    console.error("❌ Error in getMyHistory:", message);

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
