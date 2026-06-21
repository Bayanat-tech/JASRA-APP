import { extend } from "joi";

export interface BaseRequest {
  request_number: string;
  company_code: string;
}
export interface TBasicBrequest extends BaseRequest {
  request_date?: Date;
  description?: string;
  remarks?: string;
  last_action: string;
  project_code: string;
  updated_by: string;
  created_by: string;
}

export interface Titembudgetrequest extends BaseRequest {
  cost_code: string;
  requested_amt: number;
  req_appr_amt: number;
  pr_amount: number;
  po_amount: number;
  cost_name: string;
  prev_appr_amt: number;
}

export interface Addbudgettab3dd extends BaseRequest {
  project_code: string;
  month_budget: number;
  budget_year: string;
  requested_amt: number;
  approved_amt: number;
  po_amount: number;
  pr_amount: number;
  prev_appr_amt: number;
}

export interface TBudgetrequestPf extends TBasicBrequest {
  items: Titembudgetrequest[];
  project_budgets: Addbudgettab3dd[];
}

export interface TCostbudget extends BaseRequest {
  company_code: string;
  cost_code: string;
  project_code: string;
  month_budget: number;
  budget_year: string;
  requested_amt: number;
  approved_amt: number;
  po_amount: number;
  pr_amount: number;
  prev_appr_amt: number;
  updated_by:string;
}
