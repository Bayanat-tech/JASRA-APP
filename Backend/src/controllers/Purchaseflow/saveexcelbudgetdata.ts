// File: controllers/Purchaseflow/saveexcelbudgetdata.ts

import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"; // Oracle DB connection pool
import { Request, Response } from "express";

// Define TypeScript interface for the budget row
interface BudgetRow {
  budget_year: number;
  company_code: string;
  cost_code: string;
  month_budget: number;
  requested_amt: number;
}

export const saveExcelBudgetData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { request_number, data: transformedRows } = req.body as {
    request_number: string;
    data: BudgetRow[];
  };

  // Validate input
  if (!request_number || !transformedRows || transformedRows.length === 0) {
    res.status(400).json({ success: false, message: "Invalid data" });
    return;
  }

  let connection;

  try {
    connection = await oracleDb.getConnection();
    await connection.execute(
      "ALTER SESSION SET NLS_DATE_FORMAT = 'DD/MM/YYYY'"
    );

    // Fetch project_code and request_date
    const headerResults = await connection.execute<{
      PROJECT_CODE: string;
      REQUEST_DATE: Date;
    }>(
      `SELECT project_code, request_date 
       FROM PURCHASE_REQUEST_HEADER 
       WHERE request_number = :request_number`,
      { request_number },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!headerResults.rows || headerResults.rows.length === 0) {
      res.status(404).json({ success: false, message: "Request not found" });
      return;
    }

    const { PROJECT_CODE: project_code, REQUEST_DATE: request_date } =
      headerResults.rows[0];

    // Format request_date as DD/MM/YYYY
    const formattedDate = `${String(request_date.getDate()).padStart(2, "0")}/${String(
      request_date.getMonth() + 1
    ).padStart(2, "0")}/${request_date.getFullYear()}`;

    // Delete existing budget rows for this request_number
    await connection.execute(
      `DELETE FROM MS_PROJ_COST_MONTHWISE_BUDGET WHERE request_number = :request_number`,
      { request_number }
    );

    // Prepare insert query
    const insertQuery = `
      INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET (
        PROJECT_CODE, COST_CODE, COMPANY_CODE, MONTH_DATE,
        MONTH_BUDGET, BUDGET_YEAR, REQUEST_NUMBER,
        REQUESTED_AMT, APPROVED_AMT, REQUESTED_DATE
      ) VALUES (
        :project_code, :cost_code, :company_code, TO_DATE(:monthDate, 'YYYY-MM-DD'),
        :month_budget, :budget_year, :request_number,
        :requested_amt, :approved_amt, TO_DATE(:requested_date, 'DD/MM/YYYY')
      )
    `;

    // Prepare bind array for bulk insert
    const binds = transformedRows.map((row: BudgetRow) => ({
      project_code,
      cost_code: row.cost_code,
      company_code: row.company_code,
      monthDate: `${row.budget_year}-${row.month_budget
        .toString()
        .padStart(2, "0")}-01`,
      month_budget: row.month_budget,
      budget_year: row.budget_year,
      request_number,
      requested_amt: row.requested_amt,
      approved_amt: row.requested_amt, // approved = requested
      requested_date: formattedDate,
    }));

    // Execute bulk insert
    await connection.executeMany(insertQuery, binds);

    // Commit transaction
    await connection.commit();

    res.json({
      success: true,
      message: `Excel Data for Request Number ${request_number} saved successfully!`,
    });
  } catch (error) {
    console.error("Error during transaction:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while saving data.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
};
