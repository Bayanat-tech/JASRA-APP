import oracledb from "oracledb";

/**
 * Fetches budget data without a cost_code or for DUMMY
 */
export const getBudgetDataWithoutCostCode = async (
  connection: oracledb.Connection,
  request_number: string
): Promise<any> => {
  try {
    console.log('inside withoutcostcode');
    // Header data
    const headerQuery = `
      SELECT 
        request_number AS request_number,
        company_code AS company_code,
        request_date AS request_date,
        description AS description,
        remarks AS remarks,
        last_action AS last_action,
        project_code AS project_code,
        updated_by AS updated_by,
        created_by AS created_by,
        total_project_cost AS total_project_cost,
        proj_budget_alloc AS proj_budget_alloc,
        tot_proj_po AS tot_proj_po,
        tot_proj_pr AS tot_proj_pr,
        tot_proj_cost_po AS tot_proj_cost_po,
        total_proj_cost_pr AS total_proj_cost_pr
      FROM VW_BUDGET_HEADER_ENTRY
      WHERE request_number = :request_number
    `;
    const headerResult = await connection.execute(headerQuery, { request_number }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
console.log('inside withoutcostcode');
    // Items data
    const itemsQuery = `
      SELECT 
        company_code AS company_code,
        request_number AS request_number,
        cost_code AS cost_code,
        requested_amt AS requested_amt,
        req_appr_amt AS req_appr_amt,
        pr_amount AS pr_amount,
        po_amount AS po_amount,
        cost_name AS cost_name,
        prev_appr_amt AS prev_appr_amt
      FROM VW_BUDGET_REQUEST_ENTRY
      WHERE request_number = :request_number
    `;
    const itemsResult = await connection.execute(itemsQuery, { request_number }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    // Project budget (dummy/static)
    const projectBudgetQuery = `
      SELECT 
        'COMP001' AS company_code,
        'PROJ001' AS project_code,
        10000.00 AS month_budget,
        2025 AS budget_year,
        8000.00 AS requested_amt,
        7500.00 AS approved_amt,
        7200.00 AS po_amount,
        7600.00 AS pr_amount,
        5000.00 AS prev_appr_amt
      FROM dual
    `;
    const projectBudgetResult = await connection.execute(projectBudgetQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
console.log('inside withoutcostcode');
    // Call procedure for update/insert
    await connection.execute(`BEGIN PRO_UPDATEANDINSERTBUDGET_NEW(:request_number); END;`, { request_number });
console.log('inside withoutcostcode');
    // Month cost-wise
    const TMonthCostWiseInfoResult = await connection.execute(
      `SELECT DISTINCT 
          cost_code AS cost_code,
          company_code AS company_code,
          project_code AS project_code,
          month_budget AS month_budget,
          budget_year AS budget_year,
          requested_amt AS requested_amt,
          approved_amt AS approved_amt,
          po_amount AS po_amount,
          pr_amount AS pr_amount,
          prev_appr_amt AS prev_appr_amt
       FROM GT_MONTH_COST_WISE_INFO 
       WHERE COST_CODE IS NOT NULL 
       ORDER BY COST_CODE, BUDGET_YEAR, MONTH_BUDGET`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
console.log('inside withoutcostcode');
    // Month project-wise
    await connection.execute(`BEGIN PRO_GT_MONTH_PROJECT_WISE_INFO(:request_number); END;`, { request_number });
    const TMonthProjectWiseInfoResult = await connection.execute(
      `SELECT DISTINCT 
          project_code AS project_code,
          company_code AS company_code,
          month_budget AS month_budget,
          budget_year AS budget_year,
          requested_amt AS requested_amt,
          approved_amt AS approved_amt,
          po_amount AS po_amount,
          pr_amount AS pr_amount,
          prev_appr_amt AS prev_appr_amt
       FROM GT_MONTH_PROJECT_WISE_INFO 
       WHERE PROJECT_CODE IS NOT NULL 
       ORDER BY PROJECT_CODE, BUDGET_YEAR, MONTH_BUDGET`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
console.log('inside withoutcostcode');
    return {
      headerData: headerResult.rows || [],
      itemsData: itemsResult.rows || [],
      projectBudgetData: projectBudgetResult.rows || [],
      TMonthCostWiseInfodata: TMonthCostWiseInfoResult.rows || [],
      TMonthProjectWiseInfodata: TMonthProjectWiseInfoResult.rows || []
    };
  } catch (error) {
    console.error("Error fetching budget data without cost code:", error);
    throw error;
  }
};
