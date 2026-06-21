import { sequelize } from "../../database/connection";
import {
  TBasicBrequest,
  TCostbudget,
} from "../../interfaces/Purchaseflow/Budgetflow.interface";

export async function upsertBudgetRequest(data: TBasicBrequest) {
  const transaction = await sequelize.transaction();

  try {
    console.log("Starting upsertBudgetRequest.30012025..");

    // Log input data for debugging
    console.log("Request number:", data.request_number);
    console.log("Request Date:", data.request_date);
    console.log("Description:", data.description);
    console.log("Project Code:", data.project_code);
    console.log("Company Code:", data.company_code);
    console.log("Created By:", data.created_by);
    if (data.last_action === "SUBMITTED") {
      console.log("Updating existing request with SUBMITTED action.");

      // Update existing record in PURCHASE_REQUEST_HEADER
      await sequelize.query(
        `
        UPDATE PURCHASE_REQUEST_HEADER
        SET
          LAST_ACTION = :lastAction,
          updated_by = :updatedBy,
          LAST_UPDATED = NOW(), -- Corrected this line
          HISTORY_SERIAL = 1
        WHERE request_number = :requestNumber AND company_code = :companycode;
        `,
        {
          replacements: {
            lastAction: data.last_action,
            updatedBy: data.updated_by,
            requestNumber: data.request_number,
            companycode: data.company_code,
          },
          transaction,
        }
      );

      await transaction.commit();
      console.log("Update committed successfully.");
      return;
    }
    // Parse and validate request

    const requestDate =
      data.request_date && !isNaN(new Date(data.request_date).getTime())
        ? data.request_date
        : new Date().toISOString().split("T")[0]; // Default to current date

    // Define the SQL INSERT statement
    console.log("before insert");
    const insertQuery = `
    INSERT INTO PURCHASE_REQUEST_HEADER (
      company_code,
      request_date,
      description,
      remarks,
      last_action,
      project_code,
      updated_by,
      created_by,
      flow_type,
      flow_code,
      flow_level_running,
      flow_level_initial,
      flow_level_final
    ) VALUES (
      :companyCode,
      :requestDate,
      :description,
      :remarks,
      :lastaction,
      :projectCode,
      :updatedBy,
      :createdBy,
      :flowType,
      '003', -- Flow Code
      1,     -- Flow Level Running
      1,     -- Flow Level Initial
      3      -- Flow Level Final
    )
`;
    const validRequestDate =
      data.request_date && !isNaN(new Date(data.request_date).getTime())
        ? data.request_date
        : new Date();
    // Execute the INSERT statement
    await sequelize.query(insertQuery, {
      replacements: {
        companyCode: data.company_code,
        requestDate: validRequestDate,
        description: data.description,
        remarks: data.remarks || null,
        lastaction: data.last_action, // Ensure this value is valid and within 20 characters
        projectCode: data.project_code,
        updatedBy: data.updated_by || null,
        createdBy: data.created_by,
        flowType: "BUDGET", // Assign the value for flow_type
      },
      transaction,
    });

    console.log("Data successfully inserted into PURCHASE_REQUEST_HEADER.");

    await transaction.commit();
    console.log("Transaction committed successfully.");
  } catch (error) {
    console.error("Error in upsertBudgetRequest:", error);
    await transaction.rollback();
    throw error; // Re-throw the error for upstream handling
  }
}

export const insertBudgetCost = async (
  value: TCostbudget,
  transaction: any
): Promise<void> => {
  try {
    if (value.requested_amt === 0) {
      return;
    }
    const sql = `
      INSERT INTO MS_PROJ_COST_MONTHWISE_BUDGET (
        PROJECT_CODE, COST_CODE, COMPANY_CODE, USER_DT, USER_ID,
        MONTH_BUDGET, BUDGET_YEAR, REQUEST_NUMBER, REQUESTED_AMT,
        APPROVED_AMT, FINAL_APPROVED, REQUESTED_DATE
      ) VALUES (
        ?, ?, ?, CURDATE(), ?,
        ?, ?, ?, ?, ?, NULL, CURDATE()
      );
    `;

    const params = [
      value.project_code,
      value.cost_code,
      value.company_code,
      null, // Adjusted user ID retrieval
      value.month_budget,
      value.budget_year ?? "", // Ensure budget_year exists
      value.request_number,
      value.requested_amt,
      value.approved_amt,
    ];

    await sequelize.query(sql, {
      replacements: params,
      transaction,
    });

    console.log("Budget cost inserted successfully:", value);
  } catch (error: any) {
    console.error(
      "Error inserting budget cost, transaction rolled back:",
      error.message
    );
    throw new Error("Failed to insert budget cost");
  }
};
