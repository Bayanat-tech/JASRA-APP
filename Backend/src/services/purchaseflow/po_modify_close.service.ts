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


export const getPoModifyData = async (
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

    console.log("Calling procedure with:", company_code, loginid);

    // Execute correct stored procedure based on master flag
    if (master === "po_modify") {
      await conn.execute(
        `BEGIN PROC_POPULATE_GT_CLOSE(:p_user, :p_company); END;`,
        { p_user: loginid, p_company: company_code } 
      );

      console.log("Inside po_modify if block.........");
      
    } else {
      await conn.execute(
        `BEGIN PROC_POPULATE_GT_CLOSE_HISTORY(:p_user, :p_company); END;`,
        { p_user: loginid, p_company: company_code }
      );

          console.log("Inside po_modify else block........");
    }

    console.log("Procedure executed successfully");

    // Sorting
    let orderBy = "";
    if (filter?.sort?.field_name) {
      orderBy = ` ORDER BY "${filter.sort.field_name.toUpperCase()}" ${
        filter.sort.desc ? "DESC" : "ASC"
      } `;
    }

    const offset = (page - 1) * limit;

    // Fetch data
    const dataResult: Result<PoModifyRow> = await conn.execute(
      `
      SELECT t.*, COUNT(*) OVER() AS TOTAL_COUNT
      FROM GT_CLOSE t
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

    const totalCount =
      tableData.length > 0 ? tableData[0].total_count || 0 : 0;

    return {
      success: true,
      data: tableData,
      count: totalCount,
      message: "Data fetched successfully.",
    };
  } 
  catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err);

    console.error("❌ Error in getPoModifyData:", message);

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
