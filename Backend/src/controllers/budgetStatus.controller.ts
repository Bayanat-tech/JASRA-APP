// controllers/budgetStatus.controller.ts
import { Request, Response } from 'express';
import oracledb from 'oracledb';
import { oracleDb } from '../database/connection';

export const getBudgetStatusSummary = async (req: Request, res: Response) => {
  const {
    divCode,
    companyCode,
    projectName,
    monthNumber,
    costCode,
  } = req.query as Record<string, string | undefined>;

  let connection;

  try {
    connection = await oracleDb.getConnection();

    const result = await connection.execute(
      `BEGIN
         QAJAS.PROC_BUDGET_STATUS_SUMMARY(
           :divCode,
           :companyCode,
           :projectName,
           :monthNumber,
           :costCode,
           :cursor
         );
       END;`,
      {
        divCode: divCode || null,
        companyCode: companyCode || null,
        projectName: projectName || null,
        monthNumber: monthNumber || null,
        costCode: costCode || null,
        cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(0);
    await resultSet.close();

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error('PROC_BUDGET_STATUS_SUMMARY error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch budget status summary',
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