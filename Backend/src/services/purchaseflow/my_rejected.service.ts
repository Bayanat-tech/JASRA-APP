import oracledb, { Connection, Result } from "oracledb";
import { oracleDb } from "../../database/connection";

interface Filter {
  sort?: {
    field_name: string;
    desc?: boolean;
  };
}

interface RequestRejectedRow {
  [key: string]: any;
  total_count?: number;
}

export const getRequestRejectedData = async (
  loginid: string,
  company_code: string,
  filter?: Filter,
  page = 1,
  limit = 4000,
  master?: string          
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

    console.log("Calling rejected request procedure:", { company_code, loginid, master });

    if (master === "Request_Rejected") {
      await conn.execute(
        `BEGIN PROC_POPULATE_GT_REJECTED(:p_user, :p_company); END;`,
        { p_user: loginid, p_company: company_code }
      );

      console.log("Executed → PROC_POPULATE_GT_REJECTED");

    } else if (master === "Request_Rejected_history") {
      await conn.execute(
        `BEGIN PROC_POPULATE_GT_REJECTED_HISTORY(:p_user, :p_company); END;`,
        { p_user: loginid, p_company: company_code }
      );

      console.log("Executed → PROC_POPULATE_GT_REJECTED_HISTORY");

    } else {
      throw new Error(`Invalid master: ${master}`);
    }

    let orderBy = "";
    if (filter?.sort?.field_name) {
      orderBy = ` ORDER BY "${filter.sort.field_name.toUpperCase()}" ${
        filter.sort.desc ? "DESC" : "ASC"
      } `;
    }

    const offset = (page - 1) * limit;

    const tableName = 'GT_REJECTED';
     // master === "Request_Rejected" ? "GT_REJECTED" : "GT_REJECTED_HIST";

    const dataResult: Result<RequestRejectedRow> = await conn.execute(
      `
      SELECT t.*, COUNT(*) OVER() AS TOTAL_COUNT
      FROM ${tableName} t
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const rows = (dataResult.rows as RequestRejectedRow[]) || [];
    const tableData = rows.map((row) => {
      const newObj: RequestRejectedRow = {};
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
      message: "Rejected requests fetched successfully.",
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err);

    console.error("❌ Error in getRequestRejectedData:", message);

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
