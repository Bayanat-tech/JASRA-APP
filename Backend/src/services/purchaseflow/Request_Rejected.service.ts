import { oracleDb } from "../../database/connection";

interface PRRejectedFilter {
  sort?: {
    field_name: string;
    desc?: boolean;
  };
}

export const getPRRejectedData = async (
  company_code: string,
  loginid: string,
  filter?: PRRejectedFilter,
  page = 1,
  limit = 20
) => {
  let conn: any = null;

  try {
    if (!company_code || !loginid) {
      return {
        success: false,
        tableData: [],
        totalCount: 0,
        message: "company_code and loginid are required.",
      };
    }

    conn = await oracleDb.getConnection();

    console.log("Calling PROC_POPULATE_GT_REJECTED with:", company_code, loginid);

    // Call procedure (assuming it needs company_code and loginid)
    await conn.execute(
      `
      BEGIN
        PROC_POPULATE_GT_REJECTED(:p_user, :p_company);
      END;
      `,
      {
        p_company: company_code,
        p_user: loginid,
      }
    );

    console.log("Procedure executed successfully");

    // Sorting
    let orderBy = "";
    if (filter?.sort?.field_name) {
      orderBy = ` ORDER BY ${filter.sort.field_name} ${
        filter.sort.desc ? "DESC" : "ASC"
      } `;
    }

    const offset = (page - 1) * limit;

    // Fetch paginated data
    const dataResult = await conn.execute(
      `
      SELECT *
      FROM GT_REJECTED
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `,
      { offset, limit }
    );

    // Fetch total count
    const countResult = await conn.execute(`SELECT COUNT(*) FROM GT_REJECTED`);

    // Map rows to objects
    const tableData =
      dataResult.rows?.map((row: any[]) => {
        const obj: any = {};
        dataResult.metaData.forEach((col: any, index: number) => {
          obj[col.name] = row[index];
        });
        return obj;
      }) || [];

    const totalCount =
      countResult.rows && countResult.rows.length > 0
        ? countResult.rows[0][0]
        : 0;

    return {
      success: true,
      tableData,
      totalCount,
      message: "Data fetched successfully.",
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);

    console.error("❌ Error in getPRRejectedData:", message);

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
