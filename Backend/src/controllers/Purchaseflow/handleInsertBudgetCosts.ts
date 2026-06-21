import { Request, Response } from "express";
import oracledb from "oracledb";
import { TCostbudget } from "../../interfaces/Purchaseflow/Budgetflow.interface";
import { insertBudgetCost } from "./insertBudgetCost";
import { oracleDb } from "../../database/connection"; // Use your existing DB wrapper

export const handleInsertBudgetCosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const values: TCostbudget[] = req.body;

  console.log("inside handleInsertBudgetCosts");

  // Validate input
  if (!Array.isArray(values) || values.length === 0) {
    res.status(400).json({ error: "Invalid input data. Array expected." });
    return;
  }

  const firstRecord = values[0];
  const { cost_code, request_number, updated_by } = firstRecord;

  const user = req.user as { loginid: string; company_code?: string };
  console.log("loginid:", user.loginid);

  if (!cost_code) {
    res.status(400).json({ error: "First record is missing cost_code." });
    return;
  }

  let connection: oracledb.Connection | undefined;

  try {
    // Use existing connection from oracleDb wrapper
    connection = await oracleDb.getConnection();

    // Delete existing records for the request_number
    await connection.execute(
      `
      DELETE FROM MS_PROJ_COST_MONTHWISE_BUDGET
      WHERE request_number = :request_number
      `,
      { request_number },
      { autoCommit: false }
    );

    console.log(`Deleted existing records for request_number: ${request_number}`);

    // Insert new records sequentially
    for (const costBudget of values) {
      await insertBudgetCost(costBudget, connection);
    }

    // Call success message procedure
    await connection.execute(
      `BEGIN
         PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, ''); 
       END;`,
      {
        screen: "BudetAllocation",
        type: "success",
        document_number: "",
        userId: updated_by,
      }
    );

    // Commit transaction
    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Records updated successfully",
    });
  } catch (error: any) {
    console.error("Error in handleInsertBudgetCosts:", error.message);

    if (connection) {
      try {
        // Call error message procedure
        await connection.execute(
          `BEGIN
             PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId, ''); 
           END;`,
          {
            screen: "BudetAllocation",
            type: "error",
            document_number: "",
            userId: user.loginid,
          }
        );
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Update unsuccessfully",
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
