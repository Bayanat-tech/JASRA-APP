import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";
import { getBudgetData } from "./getBudgetData"; // Oracle version

export const getBudgetRequest = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { request_number, cost_code } = req.params;
    const ls_request_number = request_number.replace(/\$\$/g, "/");

    // Use existing Oracle connection from wrapper
    connection = await oracleDb.getConnection();

    // Call service function
    const result = await getBudgetData(connection, ls_request_number, cost_code);
    console.log('result',result)

    if (!result || (Array.isArray(result) && result.length === 0)) {
      res.status(404).json({
        success: false,
        message: "No data found for the given request number and cost code.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error fetching budget request:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the budget request.",
      error: error instanceof Error ? error.message : "Unknown error",
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
