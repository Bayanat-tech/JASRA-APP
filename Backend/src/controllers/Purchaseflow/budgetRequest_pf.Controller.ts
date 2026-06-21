import { Request, Response } from "express";
import { parse, format } from "date-fns";
import constants from "../../helpers/constants";

import { NextFunction } from "express";
import cors from "cors";
import mysql, { RowDataPacket } from "mysql2";
import { Sequelize, QueryTypes } from "sequelize";

import { getBudgetData } from "./getBudgetData";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"

import { insertBudgetCost } from "./budgetRequestdbupdate_pf.Controller";
import { upsertBudgetRequestOracle } from "./budgetRequestdbupdate_pf.Controller";
import { TCostbudget } from "../../interfaces/Purchaseflow/Budgetflow.interface";

// Define interfaces for Purchase Request Header and Detail
import { RequestWithUser } from "../../interfaces/common.interface";
import { TBasicBrequest } from "../../interfaces/Purchaseflow/Budgetflow.interface";
interface Row {
  PROJECT_CODE: string;
  COST_CODE: string;
  EQUAL_AMOUNT: number;
  TOTAL_AMOUNT: number;
  FROM_DATE: number | string; // Adjust based on your data type
  TO_DATE: number | string; // Adjust based on your data type
}


interface RequestWithBody extends Request {
  body: {
    request_number: string;
    data: Array<{
      budget_year: string;
      company_code: string;
      cost_code: string;
      month_budget: number;
      requested_amt: number;
    }>;
  };
}
// Define a schema for validation
// Define a schema for validation
// Geting excel data fro temp_data table

export const getBudgetexcel = async (req: Request, res: Response) => {
  let connection: oracledb.Connection | undefined;
  try {
    console.log("Inside backend getBudgetexcel");
    const { request_number } = req.params;

    if (!request_number || typeof request_number !== "string") {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid or missing request_number.",
      });
      return;
    }

    // Replace $$ with /
    const ls_request_number = request_number.replace(/\$\$/g, "/");
    console.log("Sanitized request_number:", ls_request_number);

    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Start a transaction
    await connection.execute(`BEGIN NULL; END;`);

    // Update TEMP_LOAD
    const updateQuery = `
      UPDATE TEMP_LOAD
      SET REQUEST_NUMBER = :ls_request_number
      -- Add WHERE clause if needed, e.g. WHERE REQUEST_NUMBER IS NULL
    `;

    const updateResult = await connection.execute(updateQuery, {
      ls_request_number,
    });

    console.log(`Updated TEMP_LOAD rows: ${updateResult.rowsAffected}`);

    // Select data from TEMP_LOAD
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

    const excelData = result.rows || [];

    if (excelData.length === 0) {
      await connection.rollback();
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "No data found in TEMP_LOAD for the given request_number.",
      });
      return;
    }

    // Commit the transaction
    await connection.commit();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: excelData,
    });

  } catch (error: any) {
    console.error("Error in getBudgetexcel:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
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

// end Geting excel data fro temp_data table


export const budgetexcelupload = async (req: Request, res: Response) => {
  let connection: oracledb.Connection | undefined;

  try {
    console.log("Before assigning values");

    const { values, request_number } = req.body;
    console.log("Inside budgetexcelupload2", { values, request_number });

    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Start a manual transaction
    await connection.execute(`BEGIN NULL; END;`);

    // Call procedure to initialize GT tables
    console.log("Calling PRO_MANAGE_BUDGET_GT_TABLES...");
    await connection.execute(`BEGIN PRO_MANAGE_BUDGET_GT_TABLES(); END;`);
    console.log("Procedure PRO_MANAGE_BUDGET_GT_TABLES executed successfully.");

    // Insert into GT_LOAD_BUDGET_DATA
    const insertQuery = `
      INSERT INTO GT_LOAD_BUDGET_DATA 
        (PROJECT_CODE, COST_CODE, EQUAL_AMOUNT, TOTAL_AMOUNT, FROM_DATE, TO_DATE)
      VALUES (:PROJECT_CODE, :COST_CODE, :EQUAL_AMOUNT, :TOTAL_AMOUNT, TO_DATE(:FROM_DATE, 'YYYY-MM-DD'), TO_DATE(:TO_DATE, 'YYYY-MM-DD'))
    `;

    for (const row of values) {
      const {
        project_code: PROJECT_CODE,
        cost_code: COST_CODE,
        equal_amount: EQUAL_AMOUNT,
        total_amount: TOTAL_AMOUNT,
        from_date,
        to_date,
      } = row;

      // Parse and format the dates
      const l_FROM_DATE = parse(from_date, "dd/MM/yyyy", new Date());
      const l_TO_DATE = parse(to_date, "dd/MM/yyyy", new Date());

      if (isNaN(l_FROM_DATE.getTime()) || isNaN(l_TO_DATE.getTime())) {
        throw new Error(
          `Invalid date format: from_date=${from_date}, to_date=${to_date}`
        );
      }

      const formatted_FROM_DATE = format(l_FROM_DATE, "yyyy-MM-dd");
      const formatted_TO_DATE = format(l_TO_DATE, "yyyy-MM-dd");

      console.log("Inserting row:", {
        PROJECT_CODE,
        COST_CODE,
        EQUAL_AMOUNT,
        TOTAL_AMOUNT,
        formatted_FROM_DATE,
        formatted_TO_DATE,
      });

      await connection.execute(insertQuery, {
        PROJECT_CODE,
        COST_CODE,
        EQUAL_AMOUNT,
        TOTAL_AMOUNT,
        FROM_DATE: formatted_FROM_DATE,
        TO_DATE: formatted_TO_DATE,
      });
    }

    console.log("Inside budgetexcelupload3", { values, request_number });

    // Execute stored procedure PRO_LOAD_DATA
    console.log("Calling PRO_LOAD_DATA with request_number:", request_number);
    await connection.execute(`BEGIN PRO_LOAD_DATA(:request_number); END;`, {
      request_number,
    });

    console.log("Inside budgetexcelupload4", { values, request_number });

    // Commit the transaction
    await connection.commit();
    console.log("✅ Data uploaded successfully!");

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: `Data uploaded successfully and procedure executed for request_number: ${request_number}`,
    });
  } catch (error: any) {
    // Rollback in case of error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }

    console.error("❌ Error inserting data or executing procedure:", error.message);

    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to upload data or execute procedure.",
      error: error.message,
    });
  } finally {
    // Close connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};





export const createOrUpdateBudgetRequestSequential = async (
  req: Request,
  res: Response,
  next?: NextFunction
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const {
      request_number,
      company_code,
      request_date,
      description,
      remarks,
      last_action,
      project_code,
      updated_by,
      created_by,
    } = req.body;

    console.log("Incoming request data:", req.body);

    const parsedRequestDate =
      request_date && !isNaN(new Date(request_date).getTime())
        ? new Date(request_date)
        : null;

    const budgetRequest: TBasicBrequest = {
      request_number,
      company_code,
      request_date: parsedRequestDate || undefined,
      description,
      remarks,
      last_action,
      project_code,
      created_by,
      updated_by,
    };

    console.log("Constructed budgetRequest:", budgetRequest);

    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Start dummy transaction (ensures transactional mode)
    await connection.execute(`BEGIN NULL; END;`);

    // ✅ MERGE (UPSERT) statement with RETURNING clause
    const mergeQuery = `
      MERGE INTO BUDGET_REQUEST tgt
      USING (
        SELECT 
          :request_number AS request_number,
          :company_code AS company_code,
          :request_date AS request_date,
          :description AS description,
          :remarks AS remarks,
          :last_action AS last_action,
          :project_code AS project_code,
          :created_by AS created_by,
          :updated_by AS updated_by
        FROM dual
      ) src
      ON (tgt.REQUEST_NUMBER = src.request_number)
      WHEN MATCHED THEN
        UPDATE SET
          tgt.COMPANY_CODE = src.company_code,
          tgt.REQUEST_DATE = src.request_date,
          tgt.DESCRIPTION = src.description,
          tgt.REMARKS = src.remarks,
          tgt.LAST_ACTION = src.last_action,
          tgt.PROJECT_CODE = src.project_code,
          tgt.UPDATED_BY = src.updated_by,
          tgt.UPDATED_AT = SYSDATE
      WHEN NOT MATCHED THEN
        INSERT (
          REQUEST_NUMBER,
          COMPANY_CODE,
          REQUEST_DATE,
          DESCRIPTION,
          REMARKS,
          LAST_ACTION,
          PROJECT_CODE,
          CREATED_BY,
          CREATED_AT
        ) VALUES (
          NVL(:request_number, 'REQ' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS')),
          :company_code,
          :request_date,
          :description,
          :remarks,
          :last_action,
          :project_code,
          :created_by,
          SYSDATE
        )
      RETURNING REQUEST_NUMBER INTO :out_request_number
    `;

    const binds = {
      request_number: budgetRequest.request_number || null,
      company_code: budgetRequest.company_code,
      request_date: budgetRequest.request_date ? new Date(budgetRequest.request_date) : null,
      description: budgetRequest.description,
      remarks: budgetRequest.remarks,
      last_action: budgetRequest.last_action,
      project_code: budgetRequest.project_code,
      created_by: budgetRequest.created_by,
      updated_by: budgetRequest.updated_by,
      out_request_number: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
    };

    // 👇 Tell TypeScript what we expect back
    const result = (await connection.execute(mergeQuery, binds)) as unknown as {
      outBinds: { out_request_number: string };
    };

    // Extract returned request number
    const requestNumber =
      result.outBinds.out_request_number || request_number;

    await connection.commit();
    console.log("✅ Budget request upserted successfully:", requestNumber);

    if (!res.headersSent) {
      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: "Budget request processed successfully.",
        requestNumber,
      });
    }
  } catch (error: any) {
    console.error("❌ Error saving/updating budget request:", error.message);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }

    if (!res.headersSent) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error saving/updating budget request.",
        error: error.message || "An unknown error occurred",
      });
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};



// Controller to handle fetching the budget request details

export const getBudgetRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { request_number, cost_code } = req.params;

    if (!request_number || !cost_code) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Missing required parameters: request_number or cost_code.",
      });
    }

    // Replace $$ with / to match your system format
    const ls_request_number = request_number.replace(/\$\$/g, "/");

    console.log("Fetching data for:", {
      request_number: ls_request_number,
      cost_code,
    });

    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Define your query — adjust table/columns as per your schema
    const query = `
      SELECT 
        br.REQUEST_NUMBER,
        br.COMPANY_CODE,
        br.REQUEST_DATE,
        br.DESCRIPTION,
        br.REMARKS,
        br.LAST_ACTION,
        br.PROJECT_CODE,
        br.CREATED_BY,
        br.UPDATED_BY,
        bd.COST_CODE,
        bd.BUDGET_YEAR,
        bd.MONTH_BUDGET,
        bd.REQUESTED_AMT,
        bd.APPROVED_AMT
      FROM BUDGET_REQUEST br
      LEFT JOIN BUDGET_DETAILS bd 
        ON br.REQUEST_NUMBER = bd.REQUEST_NUMBER
      WHERE br.REQUEST_NUMBER = :ls_request_number
        AND bd.COST_CODE = :cost_code
      ORDER BY bd.BUDGET_YEAR, bd.MONTH_BUDGET
    `;

    const result = await connection.execute(query, {
      ls_request_number,
      cost_code,
    }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const data = result.rows || [];

    if (data.length === 0) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "No data found for the given request number and cost code.",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error("❌ Error fetching budget request:", error);

    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while fetching the budget request.",
      error: error.message || "Unknown error",
    });

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};




// ✅ Converted Oracle Version
export const handleInsertBudgetCosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const values: TCostbudget[] = req.body;

  console.log("inside handleInsertBudgetCosts");

  if (!Array.isArray(values) || values.length === 0) {
    res.status(400).json({ error: "Invalid input data. Array expected." });
    return;
  }

  const firstRecord = values[0];
  const { request_number, cost_code, updated_by } = firstRecord;
  const user = req.user as { loginid: string; company_code?: string };

  console.log("loginid:", user?.loginid);

  let connection: oracledb.Connection | undefined;

  try {
    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Start manual transaction
    await connection.execute(`BEGIN NULL; END;`);

    // 1️⃣ Delete existing records
    await connection.execute(
      `DELETE FROM MS_PROJ_COST_MONTHWISE_BUDGET WHERE REQUEST_NUMBER = :request_number`,
      { request_number }
    );

    console.log(`Deleted existing records for request_number: ${request_number}`);

    // 2️⃣ Insert new records (using executemany for performance)
    const insertQuery = `
      INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET 
        (REQUEST_NUMBER, COST_CODE, BUDGET_YEAR, MONTH_BUDGET, REQUESTED_AMT, APPROVED_AMT, CREATED_AT, UPDATED_BY)
      VALUES 
        (:REQUEST_NUMBER, :COST_CODE, :BUDGET_YEAR, :MONTH_BUDGET, :REQUESTED_AMT, :APPROVED_AMT, SYSDATE, :UPDATED_BY)
    `;

    const binds = values.map((v) => ({
      REQUEST_NUMBER: v.request_number,
      COST_CODE: v.cost_code,
      BUDGET_YEAR: v.budget_year,
      MONTH_BUDGET: v.month_budget,
      REQUESTED_AMT: v.requested_amt,
      APPROVED_AMT: v.approved_amt || 0,
      UPDATED_BY: v.updated_by,
    }));

    await connection.executeMany(insertQuery, binds, { autoCommit: false });

    console.log("Inserted new budget cost records successfully.");

    // 3️⃣ Call success message procedure
    console.log("Calling PROC_LOADMESSAGEBOX success for user:", updated_by);

    await connection.execute(
      `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, ''); END;`,
      {
        screen: "BudetAllocation",
        type: "success",
        document_number: "",
        userId: updated_by,
      }
    );

    // 4️⃣ Commit transaction
    await connection.commit();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Records " + constants.MESSAGES.UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    console.error("❌ Error in handleInsertBudgetCosts:", error.message);

    if (connection) {
      try {
        console.log("Calling PROC_LOADMESSAGEBOX error...");
        await connection.execute(
          `BEGIN PROC_LOADMESSAGEBOX(:screen, :type, '', :userId, ''); END;`,
          {
            screen: "BudetAllocation",
            type: "error",
            userId: user?.loginid || "SYSTEM",
          }
        );
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback or message box failed:", rollbackErr);
      }
    }

    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "UPDATE UNSUCCESSFULLLY",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};

//Save data to MS_PROJ_COST_MONTHWISE_BUDGET after user viewing data of excel and pressing save button

export const saveexcelbudgetdata = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { request_number, data: transformedRows } = req.body;

  // Input validation
  if (!request_number || !Array.isArray(transformedRows) || transformedRows.length === 0) {
    res.status(400).json({ success: false, message: "Invalid data" });
    return;
  }

  let connection: oracledb.Connection | undefined;

  try {
    console.log("log 1 - Connecting to Oracle");

    // Connect to Oracle
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Start transaction
    await connection.execute(`BEGIN NULL; END;`);
    console.log("log 2 - Connection established, transaction started");

    // Step 1️⃣: Fetch project_code and request_date
    const headerQuery = `
      SELECT PROJECT_CODE, REQUEST_DATE 
      FROM PURCHASE_REQUEST_HEADER 
      WHERE REQUEST_NUMBER = :request_number
    `;

    const headerResult = await connection.execute<{
      PROJECT_CODE: string;
      REQUEST_DATE: Date;
    }>(headerQuery, { request_number }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    console.log("headerResults:", headerResult.rows);
    console.log("log 3");

    if (!headerResult.rows || headerResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Request not found or missing required data",
      });
      return;
    }

    const { PROJECT_CODE: project_code, REQUEST_DATE: request_date } =
      headerResult.rows[0];

    console.log("Fetched project_code and request_date:", {
      project_code,
      request_date,
    });
    console.log("log 4");

    // Format request_date to dd/mm/yyyy
    const formattedRequestedDate = new Date(request_date);
    const dd = String(formattedRequestedDate.getDate()).padStart(2, "0");
    const mm = String(formattedRequestedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = formattedRequestedDate.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;

    // Step 2️⃣: Delete existing rows for request_number
    await connection.execute(
      `DELETE FROM MS_PROJ_COST_MONTHWISE_BUDGET WHERE REQUEST_NUMBER = :request_number`,
      { request_number }
    );

    console.log("log 5 - Deleted existing budget rows for request:", request_number);

    // Step 3️⃣: Insert new rows (use executemany for efficiency)
    const insertQuery = `
      INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET (
        PROJECT_CODE, COST_CODE, COMPANY_CODE, MONTH_DATE,
        MONTH_BUDGET, BUDGET_YEAR, REQUEST_NUMBER,
        REQUESTED_AMT, APPROVED_AMT, REQUESTED_DATE
      ) VALUES (
        :PROJECT_CODE, :COST_CODE, :COMPANY_CODE, TO_DATE(:MONTH_DATE, 'YYYY-MM-DD'),
        :MONTH_BUDGET, :BUDGET_YEAR, :REQUEST_NUMBER,
        :REQUESTED_AMT, :APPROVED_AMT, TO_DATE(:REQUESTED_DATE, 'DD/MM/YYYY')
      )
    `;

    const insertBinds = transformedRows.map((row: any) => {
      const monthDate = `${row.budget_year}-${row.month_budget.toString().padStart(2, "0")}-01`;
      return {
        PROJECT_CODE: project_code,
        COST_CODE: row.cost_code,
        COMPANY_CODE: row.company_code,
        MONTH_DATE: monthDate,
        MONTH_BUDGET: row.month_budget,
        BUDGET_YEAR: row.budget_year,
        REQUEST_NUMBER: request_number,
        REQUESTED_AMT: row.requested_amt,
        APPROVED_AMT: row.requested_amt, // same as requested_amt
        REQUESTED_DATE: formattedDate,
      };
    });

    await connection.executeMany(insertQuery, insertBinds, { autoCommit: false });

    console.log("log 6 - Inserted new Excel budget data");

    // Step 4️⃣: Commit transaction
    await connection.commit();

    console.log("log 7 - Transaction committed successfully");

    res.json({
      success: true,
      message: `Excel Data for Request Number ${request_number} saved successfully!`,
    });
  } catch (error: any) {
    console.error("❌ Error during Oracle transaction:", error);

    if (connection) {
      try {
        await connection.rollback();
        console.log("Transaction rolled back.");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    res.status(500).json({
      success: false,
      message: "An error occurred while saving data.",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Oracle connection closed.");
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};


// Checking Budget Status

export const CheckBudgetStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    console.log("inside CheckBudgetStatus1");

    const { request_number, company_code } = req.body;

    if (!company_code || !request_number) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters: company_code or request_number",
      });
      return;
    }

    const request_number1 = request_number.replace(/\//g, "$");

    console.log("Calling Oracle function FUN_CHECK_PR_EXCEED with:", {
      company_code,
      request_number1,
    });

    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    const query = `BEGIN :result := FUN_CHECK_PR_EXCEED(:company_code, :request_number1); END;`;

    const binds = {
      result: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      company_code,
      request_number1,
    };

    // 👇 Explicitly type the result to include your outBinds
    const result = (await connection.execute(query, binds)) as unknown as {
      outBinds: { result: string };
    };

    console.log("inside CheckBudgetStatus2");

    const resultString = result.outBinds.result || "No result found";

    console.log("inside CheckBudgetStatus3", resultString);

    res.status(200).json({
      success: true,
      result: resultString,
    });
  } catch (err: any) {
    console.error("❌ Error calling Oracle function:", err);

    res.status(500).json({
      success: false,
      message: "Failed to execute function",
      error: err.message || "Internal Server Error",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};



