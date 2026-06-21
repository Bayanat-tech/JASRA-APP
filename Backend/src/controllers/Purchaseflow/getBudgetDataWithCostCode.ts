import oracledb from "oracledb";

/**
 * Fetches budget data for a specific cost_code (excluding DUMMY)
 */
export const getBudgetDataWithCostCode = async (
  connection: oracledb.Connection,
  request_number: string,
  cost_code: string
): Promise<any> => {
  try {
    // Ensure cost_code is valid
    if (!cost_code || cost_code === "DUMMY") {
      return [];
    }

    // Call procedure to populate GT_COST_MONTHWISE_BUDGET
    await connection.execute(
      `BEGIN CREATE_GT_COST_MONTHWISE_BUDGET(:request_number, :cost_code); END;`,
      { request_number, cost_code }
    );

    // Fetch data
    const costBudgetQuery = `
      SELECT 
        company_code,
        project_code,
        month_budget,
        budget_year,
        requested_amt,
        approved_amt,
        po_amount,
        pr_amount,
        prev_appr_amt
      FROM GT_COST_MONTHWISE_BUDGET
      WHERE request_number = :request_number
        AND cost_code = :cost_code
    `;

    const result = await connection.execute(costBudgetQuery, { request_number, cost_code }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    return result.rows || [];
  } catch (error) {
    console.error("Error fetching budget data with cost code:", error);
    throw error;
  }
};
