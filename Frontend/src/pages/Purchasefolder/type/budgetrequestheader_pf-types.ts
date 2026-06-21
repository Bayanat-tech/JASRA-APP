export type TVBudgetrequestheader = {
  request_number: string; // Equivalent to `REQUEST_NUMBER` varchar(25) DEFAULT NULL
  flow_type: string;
  request_date: Date; // Equivalent to `REQUEST_DATE` datetime DEFAULT NULL
  description?: string;
  remarks?: string;
  amount?: number;
  department_code?: string;
  flow_code?: string;
  flow_level_running?: 0;
  company_code: string;
  fa_uploaded: string;
  final_approved: string;
  remarks_history: string;
  create_user: string;
  create_date: Date;
  last_updated: string;
  last_action: string;
  history_serial: Number;
  cost_code: string;
  flow_description: string;
  budgeted_no: Number;
  div_code: string;
  div_name: string;
  status: string;
  project_name: string;
  total_project_cost: number;
  cost_name: string;
  proj_budget_alloc: string;
  facility_manager: string;
  tot_proj_po: number;
  tot_proj_pr: number;
  tot_proj_cost_po: number;
  tot_proj_cost_pr: number;
};

export type Tbudgetdetails = {
  project_code: string;
  cost_code: string;
  requested_amt: number;
  req_appr_amt: number;
  pr_amount: number;
  po_amount: number;
  cost_name: string;
  prev_appr_amt: number;
};

export type TBudgetrequest = {
  header: {
    request_number: string; // Equivalent to `REQUEST_NUMBER` varchar(25) DEFAULT NULL
    flow_type: string;
    request_date: Date; // Equivalent to `REQUEST_DATE` datetime DEFAULT NULL
    description?: string;
    remarks?: string;
    amount?: number;
    department_code?: string;
    flow_code?: string;
    flow_level_running?: 0;
    company_code: string;
    fa_uploaded: string;
    final_approved: string;
    remarks_history: string;
    create_user: string;
    create_date: Date;
    last_updated: string;
    last_action: string;
    history_serial: Number;
    cost_code: string;
    flow_description: string;
    budgeted_no: Number;
    div_code: string;
    div_name: string;
    status: string;
    project_name: string;
    total_project_cost: number;
    cost_name: string;
    proj_budget_alloc: string;
    facility_manager: string;
    tot_proj_po: number;
    tot_proj_pr: number;
    tot_proj_cost_po: number;
    tot_proj_cost_pr: number;
  };
  details: Tbudgetdetails[]; // Always an array of item details
};
// Base Type for shared fields
export type BaseRequest = {
  request_number: string; // Common field for all requests
  company_code: string; // Common field for all requests
};

// Basic Budget Request
export type TBasicBrequest = BaseRequest & {
  request_number?: string;
  requestNumber?: string;
  request_date?: Date;
  description?: string;
  remarks?: string;
  last_action: string;
  project_code?: string; 
  projectCode?: string;
  updated_by: string;
  created_by: string;
  total_project_cost: number;
  proj_budget_alloc: number;
  tot_proj_po: number;
  tot_proj_pr: number;
  tot_proj_cost_po: number;
  total_proj_cost_pr: number;
  flow_level_running: number;
  companyCode?: string;
  requestDate?: Date;
  lastAction?: string;
  updatedBy?: string;
  createdBy?: string;
  totalProjectCost?: number;
  projBudgetAlloc?: number;
  totProjPo?: number;
  totProjPr?: number;
  totProjCostPo?: number;
  totalProjCostPr?: number;
};

// Item Budget Request
export type Titembudgetrequest = BaseRequest & {
  cost_code: string;
  requested_amt: number;
  req_appr_amt: number;
  pr_amount: number;
  po_amount: number;
  cost_name: string;
  prev_appr_amt: number;
};

// Additional Budget Tab 3DD
export type Addbudgettab3dd = BaseRequest & {
  project_code: string;
  month_budget: number;
  budget_year: string;
  requested_amt: number;
  approved_amt: number;
  po_amount: number;
  pr_amount: number;
  prev_appr_amt: number;
};

// Cost Budget
export type TCostbudget = BaseRequest & {
  cost_code: string;
  project_code: string;
  month_budget: number;
  budget_year: string;
  requested_amt: number;
  approved_amt: number;
  po_amount: number;
  pr_amount: number;
  prev_appr_amt: number;
  updated_by: string;
};

export type TexcelBudgetupload = {
  project_code: string;
  cost_code: string;
  equal_amount: string; // ✅ Should remain string
  total_amount: string; // ✅ Should remain string
  from_date: string; // ✅ Should be formatted as "DD/MM/YYYY"
  to_date: string; // ✅ Should be formatted as "DD/MM/YYYY"
};

export type TProjectBudgetUpload = {
  project_code: string;
  cost_code: string;
  month_budget: string;
  budget_year: string;
  requested_amt: string;
  approved_amt: string;
};

export type Tbudgetupdatedata = {
  cost_code: string;
  month_budget: number;
  budget_year: string;
  requested_amt: string;
};

export type TMonthCostWiseInfo = {
  project_name: string;
  project_code: string;
  cost_code: string;
  company_code: string;
  requested_amt: number; // Fixed value of 0
  req_appr_amt: number; // Fixed value of 0
  req_approved_amt: number; // Fixed value of 0 (assuming it's a separate field)
  month_budget: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
  budget_year: string;
  approved_amt: number;
  po_amount: number; // PO_AMOUNT Calculation
  pr_amount: number; // PR_AMOUNT Calculation
  remarks: '' | 'EXCESS' | 'SAVING'; // Based on your conditions
};

export type TMonthProjectWiseInfo = {
  project_name: string;
  project_code: string;
  company_code: string;
  requested_amt: number; // Sum of requested amounts
  req_appr_amt: number; // Sum of required approved amounts
  req_approved_amt: number; // Sum of approved amounts
  month_budget: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
  budget_year: string; // Budget year as a string
  approved_amt: number; // Total approved amount
  po_amount: number; // Total PO amount
  pr_amount: number; // Total PR amount
  remarks: '' | 'EXCESS' | 'SAVINGS'; // Remarks based on logic
};
