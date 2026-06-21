import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../src/database/connection";

/**
 * Fetch budget Excel data from TEMP_LOAD table
 */
export const getBudgetexcel = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    console.log("✅ inside backend getBudgetexcel");

    const { request_number } = req.params;

    if (!request_number || typeof request_number !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid or missing request_number.",
      });
      return;
    }

    const ls_request_number = request_number.replace(/\$\$/g, "/");
    console.log("Sanitized request_number:", ls_request_number);

    connection = await oracleDb.getConnection();
    if (!connection) throw new Error("Failed to get Oracle connection");

    // Start transaction
    await connection.execute("BEGIN NULL; END;"); // Dummy block to ensure transaction context

    // Update TEMP_LOAD table
    const updateQuery = `
      UPDATE TEMP_LOAD
      SET REQUEST_NUMBER = :ls_request_number
    `;
    await connection.execute(updateQuery, { ls_request_number }, { autoCommit: false });
    console.log("Updated TEMP_LOAD with request_number:", ls_request_number);

    // Select data for Excel
    const selectQuery = `
      SELECT 
        PROJECT_CODE AS project_code,
        COST_CODE AS cost_code,
        MONTH_BUDGET AS month_budget,
        BUDGET_YEAR AS budget_year,
        REQUESTED_AMT AS requested_amt,
        APPROVED_AMT AS approved_amt
      FROM TEMP_LOAD
      ORDER BY COST_CODE, BUDGET_YEAR, MONTH_BUDGET
    `;
    const result = await connection.execute(selectQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (!result.rows || result.rows.length === 0) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        message: "No data found in TEMP_LOAD for the given request_number.",
      });
      return;
    }

    // ✅ Convert all column names to lowercase
    const lowercaseRows = result.rows.map((row: any) => {
      const newRow: any = {};
      Object.keys(row).forEach((key) => {
        newRow[key.toLowerCase()] = row[key];
      });
      return newRow;
    });

    await connection.commit();

    // Return rows with lowercase keys
    res.status(200).json({ success: true, data: lowercaseRows });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in getBudgetexcel:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
};

/**
 * Upload budget Excel data to GT_LOAD_BUDGET_DATA and execute procedure
 */
export const budgetexcelupload = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | null = null;

  try {
    const { values, request_number } = req.body;
    if (!values || !Array.isArray(values) || !request_number) {
      res.status(400).json({ success: false, message: "Values array and request_number are required." });
      return;
    }

    connection = await oracleDb.getConnection();
    if (!connection) throw new Error("Failed to get Oracle connection");

    // Start transaction
    await connection.execute("BEGIN NULL; END;");

    // Execute budget management procedure
    await connection.execute(`BEGIN PRO_MANAGE_BUDGET_GT_TABLES(); END;`);

    // Insert budget data rows
    for (const row of values) {
      const {
        project_code,
        cost_code,
        equal_amount,
        total_amount,
        from_date,
        to_date,
      } = row;

      // Convert "dd/MM/yyyy" string to Oracle DATE
      const l_FROM_DATE = `TO_DATE('${from_date}', 'DD/MM/YYYY')`;
      const l_TO_DATE = `TO_DATE('${to_date}', 'DD/MM/YYYY')`;

      const insertQuery = `
        INSERT INTO GT_LOAD_BUDGET_DATA 
        (PROJECT_CODE, COST_CODE, EQUAL_AMOUNT, TOTAL_AMOUNT, FROM_DATE, TO_DATE)
        VALUES (:project_code, :cost_code, :equal_amount, :total_amount, ${l_FROM_DATE}, ${l_TO_DATE})
      `;

      await connection.execute(insertQuery, { project_code, cost_code, equal_amount, total_amount });
    }

    // Call procedure to process uploaded data
    await connection.execute(`BEGIN PRO_load_DATA(:request_number); END;`, { request_number });

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `Data uploaded successfully, and procedure executed for request_number: ${request_number}!`,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in budgetexcelupload:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload data or execute procedure",
      error: error instanceof Error ? error.message : error,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
};
