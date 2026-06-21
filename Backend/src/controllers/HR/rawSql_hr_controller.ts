import { oracleDb } from "../../database/connection";
import { Request, Response } from "express";

export const executeRawSql = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawSql: string = req.body?.raw_sql || req.query?.sql;

    if (!rawSql || typeof rawSql !== "string") {
      res.status(400).json({ error: "Missing or invalid raw SQL string" });
      return;
    }
    console.log("Executing rawSql:", rawSql);
    const result = await oracleDb.query(rawSql);
    const rows = result.rows || result;
    res.json({ success: true, data: rows, totalCount: rows.length });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    res
      .status(500)
      .json({ error: "Failed to execute SQL", details: error.message });
  }
};

export const executeRawSqlbody = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query_parameter, query_where, query_updatevalues } = req.body;

    if (!query_parameter || !query_where) {
      res.status(400).json({
        error: "Missing query_parameter or query_where",
      });
      return;
    }

    const cleanWhere = query_where.replace(/`/g, "").trim();
    const cleanUpdate = (query_updatevalues || "").replace(/`/g, "").trim();

    console.log("Final WHERE string:", cleanWhere);
    console.log("Final UPDATE values string:", cleanUpdate);

    const procResult = await oracleDb.query(
      `BEGIN SP_CREATE_SQL_change(:query_parameter, :query_where, :query_updatevalues, :out_sql); END;`,
      {
        query_parameter,
        query_where: cleanWhere,
        query_updatevalues: cleanUpdate,
        out_sql: {
          dir: require("oracledb").BIND_OUT,
          type: require("oracledb").STRING,
          maxSize: 4000,
        },
      }
    );

    let rawSql: string = procResult.outBinds?.out_sql || procResult.out_sql;
    if (!rawSql) {
      res.status(500).json({ error: "Procedure did not return SQL" });
      return;
    }

    rawSql = rawSql.trim().replace(/;$/, "");
    console.log("Generated rawSql:", rawSql);

    const result = await oracleDb.query(rawSql);
    const rows = result.rows || result;

    res.json({
      success: true,
      data: rows,
      totalCount: rows.length,
    });
  } catch (error: any) {
    console.error("SQL Execution Error:", error);
    res.status(500).json({
      error: "Failed to execute SQL",
      details: error.message,
    });
  }
};
