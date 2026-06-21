import oracledb from "oracledb";

/**
 * Convert Oracle rows → lowercase keys
 */
const mapKeysToLowerCase = (rows: Record<string, any>[] | undefined): Record<string, any>[] => {
  if (!rows || rows.length === 0) return [];
  return rows.map((row) => {
    const newRow: Record<string, any> = {};
    for (const key in row) newRow[key.toLowerCase()] = row[key];
    return newRow;
  });
};

/**
 * Convert snake_case → camelCase
 */
const toCamel = (obj: any) => {
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (m) => m[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

const mapArrayToCamel = (arr: any[] | undefined): any[] => {
  if (!arr || arr.length === 0) return [];
  return arr.map((x) => toCamel(x));
};

/**
 * MAIN FUNCTION
 */
export const getBudgetData = async (
  connection: oracledb.Connection,
  request_number: string,
  cost_code?: string
): Promise<any> => {
  try {
    let costbudgetdata: any[] = [];
    let headerdata: any[] = [];
    let itemsdata: any[] = [];
    let projectbudgetdata: any[] = [];
    let tmonthcostwiseinfodata: any[] = [];
    let tmonthprojectwiseinfodata: any[] = [];

    if (!cost_code) cost_code = "DUMMY";

    /***************************************************
     * CASE 1 — cost_code = null/undefined/DUMMY
     ***************************************************/
    if (cost_code === "DUMMY") {
      const query1 = `
        SELECT company_code,
               cost_code,
               project_code,
               month_budget,
               budget_year,
               requested_amt,
               approved_amt,
               0 AS po_amount,
               0 AS pr_amount,
               0 AS prev_appr_amt
        FROM MS_PROJ_COST_MONTHWISE_BUDGET
        WHERE request_number = :request_number
      `;

      const result = await connection.execute<Record<string, any>>(
        query1,
        { request_number },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      costbudgetdata = mapKeysToLowerCase(result.rows);
    }

    /***************************************************
     * CASE 2 — cost_code provided
     ***************************************************/
    if (cost_code !== "DUMMY") {
      await connection.execute(
        `BEGIN CREATE_GT_COST_MONTHWISE_BUDGET(:request_number, :cost_code); END;`,
        { request_number, cost_code }
      );

      const costBudgetQuery = `
        SELECT company_code, project_code, month_budget, budget_year,
               requested_amt, approved_amt, po_amount, pr_amount, prev_appr_amt
        FROM GT_COST_MONTHWISE_BUDGET
        WHERE request_number = :request_number
          AND cost_code = :cost_code
      `;

      const costBudgetResult = await connection.execute<Record<string, any>>(
        costBudgetQuery,
        { request_number, cost_code },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      costbudgetdata = mapKeysToLowerCase(costBudgetResult.rows);
    }

    /***************************************************
     * HEADER
     ***************************************************/
    const headerResult = await connection.execute<Record<string, any>>(
      `
      SELECT request_number, company_code, request_date, description, remarks, last_action, 
             project_code, updated_by, created_by, total_project_cost, proj_budget_alloc, 
             tot_proj_po, tot_proj_pr, tot_proj_cost_po, total_proj_cost_pr
      FROM VW_BUDGET_HEADER_ENTRY
      WHERE request_number = :request_number
      `,
      { request_number },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    headerdata = mapKeysToLowerCase(headerResult.rows);

    /***************************************************
     * ITEMS
     ***************************************************/
    const itemsResult = await connection.execute<Record<string, any>>(
      `SELECT company_code, request_number, cost_code, cost_name, month_budget, budget_year, request_amt, req_appr_amt
      FROM VW_BUDGET_REQUEST_ENTRY
      WHERE request_number = :request_number
      `,
      { request_number },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    itemsdata = mapKeysToLowerCase(itemsResult.rows);

    /***************************************************
     * STATIC PROJECT BUDGET
     ***************************************************/
    const projectBudgetResult = await connection.execute<Record<string, any>>(
      `
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
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    projectbudgetdata = mapKeysToLowerCase(projectBudgetResult.rows);

    /***************************************************
     * COST-WISE INFO
     ***************************************************/
    await connection.execute(`BEGIN PRO_UPDATEANDINSERTBUDGET_NEW(:request_number); END;`, {
      request_number,
    });

    const TMonthCostWiseInfoResult = await connection.execute<Record<string, any>>(
      `
      SELECT DISTINCT * 
      FROM GT_MONTH_COST_WISE_INFO 
      WHERE COST_CODE IS NOT NULL 
      ORDER BY COST_CODE, BUDGET_YEAR, MONTH_BUDGET
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    tmonthcostwiseinfodata = mapKeysToLowerCase(TMonthCostWiseInfoResult.rows);

    /***************************************************
     * PROJECT-WISE INFO
     ***************************************************/
    await connection.execute(`BEGIN PRO_GT_MONTH_PROJECT_WISE_INFO(:request_number); END;`, {
      request_number,
    });

    const TMonthProjectWiseInfoResult = await connection.execute<Record<string, any>>(
      `
      SELECT DISTINCT * 
      FROM GT_MONTH_PROJECT_WISE_INFO 
      WHERE PROJECT_CODE IS NOT NULL 
      ORDER BY PROJECT_CODE, BUDGET_YEAR, MONTH_BUDGET
      `,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    tmonthprojectwiseinfodata = mapKeysToLowerCase(TMonthProjectWiseInfoResult.rows);

    /***************************************************
     * FINAL RESPONSE (NO SUCCESS WRAPPING HERE)
     ***************************************************/
    return {
      headerData: mapArrayToCamel(headerdata),
      itemsData: mapArrayToCamel(itemsdata),
      projectBudgetData: mapArrayToCamel(projectbudgetdata),
      TMonthCostWiseInfodata: mapArrayToCamel(tmonthcostwiseinfodata),
      TMonthProjectWiseInfodata: mapArrayToCamel(tmonthprojectwiseinfodata),

      ...(cost_code !== "DUMMY" && {
        costBudgetData: mapArrayToCamel(costbudgetdata),
      }),
    };

  } catch (error) {
    console.error("Error fetching budget data:", error);
    throw new Error("Failed to fetch budget data.");
  }
};
