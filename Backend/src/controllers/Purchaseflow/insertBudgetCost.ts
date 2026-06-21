import oracledb from "oracledb";
import { TCostbudget } from "../../interfaces/Purchaseflow/Budgetflow.interface";

export const insertBudgetCost = async (
  value: TCostbudget,
  connection: oracledb.Connection
): Promise<void> => {
  try {
   
    if (value.requested_amt === 0) return;

    const sql = `
      INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET (
        PROJECT_CODE,
        COST_CODE,
        COMPANY_CODE,
        USER_DT,
        MONTH_BUDGET,
        BUDGET_YEAR,
        REQUEST_NUMBER,
        REQUESTED_AMT,
        APPROVED_AMT,
        FINAL_APPROVED,
        REQUESTED_DATE
      )
      VALUES (
        :project_code,
        :cost_code,
        :company_code,
        SYSDATE,
        :month_budget,
        :budget_year,
        :request_number,
        :requested_amt,
        :approved_amt,
        NULL,
        SYSDATE
      )
    `;

    const params = {
      project_code: value.project_code,
      cost_code: value.cost_code,
      company_code: value.company_code,
      month_budget: value.month_budget,
      budget_year: value.budget_year ?? "",
      request_number: value.request_number,
      requested_amt: value.requested_amt,
      approved_amt: value.approved_amt,
    };

    await connection.execute(sql, params, { autoCommit: false });
 console.log("month_budget")
    console.log("budget year")
    console.log("Budget cost inserted successfully:", value);
  } catch (error: any) {
    console.error("Error inserting budget cost:", error.message);
    throw new Error("Failed to insert budget cost");
  }
};
