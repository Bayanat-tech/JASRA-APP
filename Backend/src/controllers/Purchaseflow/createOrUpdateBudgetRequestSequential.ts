import { Request, Response } from "express";

import { TBasicBrequest } from "../../interfaces/Purchaseflow/Budgetflow.interface";
import { upsertBudgetRequest } from "./upsertBudgetRequest";

export const createOrUpdateBudgetRequestSequential = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const budgetRequest: TBasicBrequest = req.body;
    console.log('inside fore createorUpdateBudgetRequestSequential')
    // Call your function
    const { requestNumber } = await upsertBudgetRequest(budgetRequest);
console.log('inside fore createorUpdateBudgetRequestSequential')
    res.status(200).json({
      success: true,
      message: "Budget request processed successfully.",
      requestNumber,
    });
  } catch (error) {
    console.error("Error saving/updating budget request:", error);
    res.status(500).json({
      success: false,
      message: "Error saving/updating budget request.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
