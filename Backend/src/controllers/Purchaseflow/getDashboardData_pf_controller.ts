import { Request, Response, NextFunction } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"; 
export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { level, user, from_date, to_date } = req.query;

    if (!level || !user || !from_date || !to_date) {
      res.status(400).json({
        success: false,
        message:
          "Parameters 'level', 'user', 'from_date', and 'to_date' are required.",
      });
      return;
    }

    const parsedLevel = parseInt(level as string, 10);
    if (isNaN(parsedLevel)) {
      res.status(400).json({
        success: false,
        message: "'level' must be a valid number.",
      });
      return;
    }

    const formattedFromDate = from_date.toString().slice(0, 10);
    const formattedToDate = to_date.toString().slice(0, 10);

    connection = await oracleDb.getConnection();
    await connection.execute("BEGIN NULL; END;"); // start a dummy block for transaction
    await connection.execute("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD'");

    // Helper to call a procedure
    const callProc = async (procName: string, binds: Record<string, any>) => {
      const bindParams = Object.entries(binds)
        .map(([key]) => `:${key}`)
        .join(", ");
      const sql = `BEGIN ${procName}(${bindParams}); END;`;
      await connection!.execute(sql, binds);
    };

    // Execute procedures sequentially
    await callProc("PROC_PR_DIV_COUNT", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const VW_DB_PR_DIV_COUNTdata = await connection.execute(
      "SELECT * FROM GT_PR_DIV_COUNT",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PO_DIV_COUNT", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const VW_DB_PO_DIV_COUNTdata = await connection.execute(
      "SELECT * FROM GT_PO_DIV_COUNT",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PO_COST_CENTRE", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const PO_COST_CENTREdata = await connection.execute(
      "SELECT * FROM GT_PO_COST_CENTRE",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PR_SERVICE_TYPE_COUNT", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const VW_DB_PRSERVICE_TYPEdata = await connection.execute(
      "SELECT * FROM GT_PR_SERVICE_TYPE_COUNT",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PO_SERVICE_TYPE_COUNT", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const VW_DB_POSERVICE_TYPEdata = await connection.execute(
      "SELECT * FROM GT_PO_SERVICE_TYPE_COUNT",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PR_STATUS", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const PR_STATUS_COUNTdata = await connection.execute(
      "SELECT * FROM GT_PR_STATUS",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PO_STATUS", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const PO_STATUS_COUNTdata = await connection.execute(
      "SELECT * FROM GT_PO_STATUS",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PR_SERVICE_RM_FLAG", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const PR_SERVICE_RMdata = await connection.execute(
      "SELECT * FROM GT_PR_SERVICE_RM_FLAG",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await callProc("PROC_PO_SERVICE_RM_FLAG", {
      user,
      from_date: formattedFromDate,
      to_date: formattedToDate,
    });
    const PO_SERVICE_RMdata = await connection.execute(
      "SELECT * FROM GT_PO_SERVICE_RM_FLAG",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.execute(
  `
  BEGIN
    PROC_CREATE_DASHBOARD_SUMMARY(:level, :user, :from_date, :to_date);
  END;
  `,
  {
    level: { val: parsedLevel, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
    user: { val: user, dir: oracledb.BIND_IN, type: oracledb.STRING },
    from_date: { val: formattedFromDate, dir: oracledb.BIND_IN, type: oracledb.STRING },
    to_date: { val: formattedToDate, dir: oracledb.BIND_IN, type: oracledb.STRING },
  }
);

    const Dashboardbasicdata = await connection.execute(
      "SELECT * FROM GT_DASH_BOARD",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const VW_MONTHWISE_POdata = await connection.execute(
      `
      SELECT PO_YEAR, PO_MONTH, SUM(PO_AMOUNT) AS PO_AMOUNT
      FROM VW_MONTHWISE_PO
      GROUP BY PO_YEAR, PO_MONTH
      `,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      data: {
        Dashboardbasicdata: Dashboardbasicdata.rows,
        VW_DB_PR_DIV_COUNTdata: VW_DB_PR_DIV_COUNTdata.rows,
        VW_DB_PO_DIV_COUNTdata: VW_DB_PO_DIV_COUNTdata.rows,
        PO_COST_CENTREdata: PO_COST_CENTREdata.rows,
        VW_DB_PRSERVICE_TYPEdata: VW_DB_PRSERVICE_TYPEdata.rows,
        VW_DB_POSERVICE_TYPEdata: VW_DB_POSERVICE_TYPEdata.rows,
        PR_STATUS_COUNTdata: PR_STATUS_COUNTdata.rows,
        PO_STATUS_COUNTdata: PO_STATUS_COUNTdata.rows,
        PR_SERVICE_RMdata: PR_SERVICE_RMdata.rows,
        PO_SERVICE_RMdata: PO_SERVICE_RMdata.rows,
        VW_MONTHWISE_POdata: VW_MONTHWISE_POdata.rows,
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error fetching dashboard data:", error);
    next(error);
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * Calls MySQL procedure PROC_CREATE_GT_EXPENSE_ADJ
 * and returns GT_EXPENSE_ADJ data as JSON.
 */
export const handleGenerateExpenseAdj = async (
  req: Request,
  res: Response
): Promise<void> => {
};





export const handleSaveExpSamt = async (req: Request, res: Response): Promise<void> => {
};


