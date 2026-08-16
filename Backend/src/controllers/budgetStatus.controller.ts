// controllers/budgetStatus.controller.ts
import { Request, Response } from 'express';
import oracledb from 'oracledb';
import { oracleDb } from '../database/connection';

export const getBudgetStatusSummary = async (req: Request, res: Response): Promise<void> => {
  const {
    parameter,
    divCode,
    companyCode,
    projectName,
    monthNumber,
    costCode,
  } = req.query as Record<string, string | undefined>;

  // Convert empty / "All" / undefined → null (procedure treats NULL as no filter)
  const toNullIfAll = (v?: string) =>
    !v || v === 'All' || v === 'undefined' ? null : v;

  let connection;

  try {
    connection = await oracleDb.getConnection();

    const result = await connection.execute(
      `BEGIN
         QAJAS.PROC_BUDGET_STATUS_SUMMARY(
           :parameter,
           :divCode,
           :companyCode,
           :projectName,
           :monthNumber,
           :costCode,
           :cursor,
           :returnString
         );
       END;`,
      {
        parameter:    parameter || 'BUDGET_STATUS_SUMMARY',
        divCode:      toNullIfAll(divCode),
        companyCode:  toNullIfAll(companyCode),
        projectName:  toNullIfAll(projectName),
        monthNumber:  toNullIfAll(monthNumber),
        costCode:     toNullIfAll(costCode),
        cursor:       { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        returnString: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 4000 },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const outBinds = result.outBinds as {
      cursor: oracledb.ResultSet<any>;
      returnString: string;
    };

    const returnString = outBinds.returnString;

    // If procedure returned an error / invalid parameter
    if (returnString && returnString !== 'SUCCESS') {
      res.status(400).json({
        success: false,
        message: returnString,
        data: [],
      });
      return;
    }

    // Cursor may not be opened on invalid parameter
    if (!outBinds.cursor) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const rows = await outBinds.cursor.getRows(0); // 0 = all rows
    await outBinds.cursor.close();

    // Debug – remove in production
    console.log(
      `[PROC_BUDGET_STATUS_SUMMARY] parameter=${parameter || 'BUDGET_STATUS_SUMMARY'} → count=${rows?.length ?? 0}`
    );

    res.status(200).json({
      success: true,
      data: rows ?? [],
    });
  } catch (error: any) {
    console.error('PROC_BUDGET_STATUS_SUMMARY error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget status data',
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};