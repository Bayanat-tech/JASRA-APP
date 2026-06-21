import { oracleDb } from "../../database/connection";

interface Filter {
  sort?: {
    field_name: string;
    desc?: boolean;
  };
}

export const getRequestCloseData = async (
  loginid: string,
  company_code: string,
  filter?: Filter,
  page = 1,
  limit = 4000
) => {
  let conn: any = null;

  try {
    if (!loginid || !company_code) {
      return {
        success: false,
        tableData: [],
        totalCount: 0,
        message: "Both loginid and company_code are required.",
      };
    }

    conn = await oracleDb.getConnection();

    console.log("Calling close request procedure with:", company_code, loginid);

    // ✅ CALL CLOSE REQUEST PROCEDURE
    await conn.execute(
      `BEGIN
         PROC_POPULATE_GT_CLOSE(:p_company, :p_user);
       END;`,
      {
        p_company: company_code,
        p_user: loginid,
      }
    );

    console.log("Close request procedure executed successfully");

    // Sorting
    let orderBy = "";
    if (filter?.sort?.field_name) {
      orderBy = ` ORDER BY "${filter.sort.field_name.toUpperCase()}" ${
        filter.sort.desc ? "DESC" : "ASC"
      } `;
    }

    const offset = (page - 1) * limit;

    // ✅ FETCH FROM GT_CLOSE
    const dataResult = await conn.execute(
      `
      SELECT t.*, COUNT(*) OVER() AS total_count
      FROM GT_CLOSE t
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { offset, limit }
    );

    // Map rows to lowercase keys
    const tableData =
      dataResult.rows?.map((row: any[]) => {
        const obj: any = {};
        dataResult.metaData.forEach((col: any, i: number) => {
          obj[col.name.toLowerCase()] = row[i];
        });
        return obj;
      }) || [];

    // Extract total count
    const totalCount = tableData.length > 0 ? tableData[0].total_count : 0;

    console.log("Close Requests Result:", { tableData, totalCount });

    return {
      success: true,
      tableData,
      totalCount,
      message: "Close requests fetched successfully.",
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : JSON.stringify(err);

    console.error("❌ Error in getRequestCloseData:", message);

    return {
      success: false,
      tableData: [],
      totalCount: 0,
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
