import { Request, Response } from "express";
import cors from "cors";
import mysql, { RowDataPacket } from "mysql2";
import { Sequelize, QueryTypes } from "sequelize";

import { getBudgetData } from "./getBudgetData";
import { sequelize } from "../../database/connection";

//import { insertBudgetCost } from "./budgetRequestdbupdate_pf.Controller";
//import { upsertBudgetRequest } from "./budgetRequestdbupdate_pf.Controller";
import { TCostbudget } from "../../interfaces/Purchaseflow/Budgetflow.interface";
import { parse } from "date-fns";
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

import constants from "../../helpers/constants";
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
  const transaction = await sequelize.transaction(); // Start a transaction
  try {
    console.log("inside backend getBudgetexcel");
    const { request_number } = req.params;

    if (!request_number || typeof request_number !== "string") {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid or missing request_number.",
      });
      return;
    }
    console.log("inside backend getBudgetexcel1");
    // Replace $$ with /
    const ls_request_number = request_number.replace(/\$\$/g, "/");
    console.log("Sanitized request_number:", ls_request_number);

    // Update request_number in TEMP_DATA
    const updateQuery = `
      UPDATE TEMP_LOAD
      SET REQUEST_NUMBER = :ls_request_number
     ; -- Adjust condition if needed
    `;

    await sequelize.query(updateQuery, {
      replacements: { ls_request_number },
      type: QueryTypes.UPDATE,
      transaction,
    });

    console.log("Updated TEMP_DATA with request_number:", ls_request_number);

    // Retrieve specific columns from TEMP_DATA
    const selectQuery = `
   SELECT 
  PROJECT_CODE AS project_code,
  COST_CODE AS cost_code,
  MONTH_BUDGET AS month_budget,
  BUDGET_YEAR AS budget_year,
  REQUESTED_AMT AS requested_amt,
  APPROVED_AMT AS approved_amt
FROM TEMP_LOAD order by COST_CODE,BUDGET_YEAR,MONTH_BUDGET;
    `;

    const excelData = await sequelize.query(selectQuery, {
      replacements: { ls_request_number },
      type: QueryTypes.SELECT,
      transaction,
    });

    if (!excelData || excelData.length === 0) {
      await transaction.rollback(); // Rollback transaction in case of no data
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "No data found in TEMP_DATA for the given request_number.",
      });
      return;
    }

    await transaction.commit(); // Commit the transaction

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: excelData, // Send the retrieved data
    });
  } catch (error: unknown) {
    await transaction.rollback(); // Rollback the transaction on error
    console.error("Error in getBudgetexcel:", error);

    const knownError = error as { message: string };
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: knownError.message || "An unexpected error occurred.",
    });
  }
};
// end Geting excel data fro temp_data table

export const budgetexcelupload = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  console.log("Before assigning values");

  const { values, request_number } = req.body;

  console.log("Inside budgetexcelupload2", { values, request_number });

  const insertQuery = `
    INSERT INTO GT_LOAD_BUDGET_DATA 
    (PROJECT_CODE, COST_CODE, EQUAL_AMOUNT, TOTAL_AMOUNT, FROM_DATE, TO_DATE) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    for (const row of values) {
      const {
        project_code: PROJECT_CODE,
        cost_code: COST_CODE,
        equal_amount: EQUAL_AMOUNT,
        total_amount: TOTAL_AMOUNT,
        from_date,
        to_date,
      } = row;

      // Parse dates
      const l_FROM_DATE = parse(from_date, "dd-MM-yyyy", new Date());
      const l_TO_DATE = parse(to_date, "dd-MM-yyyy", new Date());

      // Check if dates are valid
      if (isNaN(l_FROM_DATE.getTime()) || isNaN(l_TO_DATE.getTime())) {
        throw new Error("Invalid date format in input data");
      }

      console.log("Inserting row:", {
        PROJECT_CODE,
        COST_CODE,
        EQUAL_AMOUNT,
        TOTAL_AMOUNT,
        l_FROM_DATE,
        l_TO_DATE,
      });

      // Execute the insert query
      await sequelize.query(insertQuery, {
        replacements: [
          PROJECT_CODE,
          COST_CODE,
          EQUAL_AMOUNT,
          TOTAL_AMOUNT,
          l_FROM_DATE,
          l_TO_DATE,
        ],
        transaction,
      });
    }

    console.log("Inside budgetexcelupload3", { values, request_number });

    // Execute the stored procedure
    const procedureQuery = `CALL PRO_load_DATA(:request_number)`;
    await sequelize.query(procedureQuery, {
      replacements: { request_number },
      transaction,
    });

    console.log("Inside budgetexcelupload4", { values, request_number });

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Data uploaded successfully, and procedure executed for request_number: ${request_number}!`,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    if (transaction) await transaction.rollback();

    console.error(
      "Error inserting data or executing procedure:",
      error instanceof Error ? error.message : JSON.stringify(error)
    );
    res.status(500).json({
      success: false,
      message: "Failed to upload data or execute procedure",
    });
  }
};

export const createOrUpdateBudgetRequestSequential = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      request_number, // ✅ Match exactly with frontend's key name
      company_code,
      request_date,
      description,
      remarks,
      last_action,
      project_code,
      updated_by,
      created_by,
    } = req.body;

    console.log("Incoming request data30012025:", req.body);

    // Validate and convert request_date to a Date object or undefined
    const parsedRequestDate =
      request_date && !isNaN(new Date(request_date).getTime())
        ? new Date(request_date)
        : undefined;

    // Construct the budget request object
    const budgetRequest: TBasicBrequest = {
      request_number, // ✅ Ensure correct mapping
      company_code,
      request_date: parsedRequestDate,
      description,
      remarks,
      last_action,
      project_code,
      created_by,
      updated_by,
    };

    console.log("Constructed budgetRequest:", budgetRequest);

    // Call the upsert function
    console.log("log 30012025");
    //   await upsertBudgetRequest(budgetRequest);
    console.log("After upsertBudgetRequest");

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Budget request processed successfully.",
    });
  } catch (error) {
    console.error("Error saving/updating budget request:", error);

    // Send an error response
    res.status(500).json({
      success: false,
      message: "Error saving/updating budget request.",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
};

// Controller to handle fetching the budget request details

export const getBudgetRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { request_number, cost_code } = req.params;
    const ls_request_number = request_number.replace(/\$\$/g, "/");

    // Call the service function to fetch data from the database
    const result = await getBudgetData(ls_request_number, cost_code);

    // If result is empty or null, return a not found response
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No data found for the given request number and cost code.",
      });
    }

    // Return the response with the fetched data
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching budget request:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the budget request.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleInsertBudgetCosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const values: TCostbudget[] = req.body;

  // Validate input
  if (!Array.isArray(values) || values.length === 0) {
    // return res.status(400).json({ error: "Invalid input data. Array expected." });
  }

  const firstRecord = values[0];
  const { cost_code } = firstRecord;
  const { request_number } = firstRecord;

  if (!cost_code) {
    //  return res.status(400).json({ error: "First record is missing cost_code." });
  }

  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Delete existing records for the cost_code within the transaction
    await sequelize.query(
      `DELETE FROM MS_PROJ_COST_MONTHWISE_BUDGET 
       WHERE cost_code = :cost_code AND request_number = :request_number`,
      {
        replacements: { cost_code, request_number },
        transaction,
        type: QueryTypes.DELETE,
      }
    );
    console.log(`Deleted existing records for cost_code: ${cost_code}`);

    // Insert new records inside the same transaction using Promise.all
    /*await Promise.all(
      values.map((costBudget) => insertBudgetCost(costBudget, transaction))
    );*/

    // Commit the transaction
    await transaction.commit();

    // Send success response
    res.status(200).json({ message: "Records processed successfully" });
  } catch (error: any) {
    // If there's an error, roll back the transaction
    await transaction.rollback();
    console.error("Error inserting budget costs:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred", details: error.message });
  }
};

//Save data to MS_PROJ_COST_MONTHWISE_BUDGET after user viewing data of excel and pressing save button
export const saveexcelbudgetdata = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { request_number, data: transformedRows } = req.body;

  // Check for missing or invalid data
  if (!request_number || !transformedRows || transformedRows.length === 0) {
    res.status(400).json({ success: false, message: "Invalid data" });
    return; // Exit the function without returning a response object
  }
  console.log("log 1");
  let transaction;

  try {
    transaction = await sequelize.transaction(); // Start a transaction

    // Query to get project_code and request_date based on the request_number
    const ls_query = `SELECT project_code, request_date FROM PURCHASE_REQUEST_HEADER WHERE request_number = :request_number`;
    console.log("log 2");
    // Explicitly type the result as an array of objects with project_code and request_date
    const headerResults = (await sequelize.query(ls_query, {
      replacements: { request_number },
      type: QueryTypes.SELECT,
      transaction,
    })) as { project_code: string; request_date: Date }[]; // Type assertion here

    // Log the headerResults to verify the structure
    console.log("headerResults:", headerResults);
    console.log("log 3");
    // Check if results exist and the first item contains project_code and request_date
    if (
      !headerResults ||
      headerResults.length === 0 ||
      !headerResults[0].project_code ||
      !headerResults[0].request_date
    ) {
      res.status(404).json({
        success: false,
        message: "Request not found or missing required data",
      });
      return;
    }
    console.log("log 4");
    // Destructure project_code and request_date from the first result
    const { project_code, request_date } = headerResults[0];
    console.log("Fetched project_code and request_date:", {
      project_code,
      request_date,
    });
    console.log("log 5");
    // Format the request_date as dd/mm/yyyy
    const formattedRequestedDate = new Date(request_date);
    const dd = String(formattedRequestedDate.getDate()).padStart(2, "0");
    const mm = String(formattedRequestedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = formattedRequestedDate.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;
    await sequelize.query(
      `DELETE FROM MS_PROJ_COST_MONTHWISE_BUDGET 
       WHERE  request_number = :request_number`,
      {
        replacements: { request_number },
        transaction,
        type: QueryTypes.DELETE,
      }
    );
    console.log("log 6");
    // Loop through transformedRows to insert data into MS_PROJ_COST_MONTHWISE_BUDGET
    for (const row of transformedRows) {
      const {
        budget_year,
        company_code,
        cost_code,
        month_budget,
        requested_amt,
        approved_amt
      } = row;

      const monthDate = `${budget_year}-${
        month_budget < 10 ? "0" : ""
      }${month_budget}-01`; // Format the date

      const insertQuery = `
        INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET (
          PROJECT_CODE, COST_CODE, COMPANY_CODE, MONTH_DATE, 
          MONTH_BUDGET, BUDGET_YEAR, REQUEST_NUMBER, 
          REQUESTED_AMT, APPROVED_AMT, REQUESTED_DATE
        ) VALUES (
          :project_code, :cost_code, :company_code, :monthDate,
          :month_budget, :budget_year, :request_number,
          :requested_amt, :approved_amt, :requested_date
        )
      `;

      await sequelize.query(insertQuery, {
        replacements: {
          project_code,
          cost_code,
          company_code,
          monthDate,
          month_budget,
          budget_year,
          request_number,
          requested_amt,
          approved_amt,
          requested_date: formattedDate, // Use the formatted date
        },
        type: QueryTypes.INSERT,
        transaction, // Pass the transaction to ensure consistency
      });
    }
    console.log("log 7");
    await transaction.commit(); // Commit the transaction

    res.json({
      success: true,
      message: `Excel Data for Request Number ${request_number} saved successfully!`,
    });
  } catch (error) {
    console.error("Error during transaction:", error);
    if (transaction) await transaction.rollback(); // Rollback the transaction on error

    res.status(500).json({
      success: false,
      message: "An error occurred while saving data.",
    });
  }
};

// Checking Budget Status

export const CheckBudgetStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract company_code and request_number from the request body
    const { request_number, company_code } = req.body;
    console.log("inside CheckBudgetStatus1");
    // Validate required parameters
    if (!company_code || !request_number) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters: company_code or request_number",
      });
      return;
    }

    // Query to call the MySQL function
    const query = `SELECT FUN_CHECK_PR_EXCEED(:company_code, :request_number1) AS result;`;
    let request_number1 = request_number.replace(/\//g, "$");
    // Execute the function and get the result
    const results: any = await sequelize.query(query, {
      replacements: { company_code, request_number1 },
      type: QueryTypes.SELECT,
    });
    console.log("inside CheckBudgetStatus2");
    // Extract the function result
    const resultString = results[0]?.result || "No result found";
    console.log("inside CheckBudgetStatus3", resultString);
    // Send the result to the frontend
    res.status(200).json({
      success: true,
      result: resultString,
    });
  } catch (err: any) {
    console.error("Error calling function:", err);

    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to execute function",
      error: err.message || "Internal Server Error",
    });
  }
};

export const fetchPRregisterdata = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("✅ fetchPRregisterdata called");
    console.log("✅ Query Params:", req.query);

    // Extract and sanitize query parameters
    const fromDate = String(req.query.fromDate || "").trim();
    const toDate = String(req.query.toDate || "").trim();
    const selectedProjectCode = String(
      req.query.selectedProjectCode || ""
    ).trim();
    const requestStatus = String(req.query.requestStatus || "").trim();
    const prType = String(req.query.prType || "").trim();
    const serviceRmFlag = String(req.query.serviceRmFlag || "").trim();

    // Ensure required parameters exist
    if (!fromDate || !toDate) {
      res.status(400).json({
        success: false,
        message: "❌ fromDate and toDate are required.",
      });
      return;
    }

    // Construct dynamic SQL query
    let query = `
      SELECT * FROM VW_PR_REGISTER
      WHERE REQUEST_DATE BETWEEN :fromDate AND :toDate
    `;

    // Prepare replacements object
    const replacements: Record<string, string> = { fromDate, toDate };

    if (selectedProjectCode) {
      query += " AND PROJECT_CODE = :selectedProjectCode";
      replacements.selectedProjectCode = selectedProjectCode;
    }
    if (requestStatus) {
      query += " AND status = :requestStatus";
      replacements.requestStatus = requestStatus;
    }
    if (prType) {
      query += " AND TYPE_OF_PR = :prType";
      replacements.prType = prType;
    }
    if (serviceRmFlag) {
      query += " AND SERVICE_RM_FLAG = :serviceRmFlag";
      replacements.serviceRmFlag = serviceRmFlag;
    }

    console.log("✅ Final Query:", query);
    console.log("✅ Query Replacements:", replacements);
    //query = "SELECT * FROM VW_PR_REGISTER";
    query = "SELECT * FROM VW_PR_REGISTER ORDER BY REQUEST_NUMBER";
    // Execute the query
    console.log;
    const rows = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    console.log(
      `✅ Query executed successfully. Retrieved ${rows.length} records.`
    );

    // Send response (ensure no return statement)
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching PR register data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching PR register data.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
