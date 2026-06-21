export interface IBasicMrRequest {
   description?: string;
  remarks?: string;
  amount?: number;
  department_code?: string;
  flow_code?: string;
  flow_level_initial?: number;
  flow_level_running?: number;
  flow_level_final?: number;
  
  currency_rate?: number;
  user_dt?: Date;
  user_id?: string;
  fa_uploaded?: string;
  final_approved?: string;
  remarks_histry?: string;
  curr_code?: string;
  create_user?: string;
  create_date?: Date;
  last_updated?: string;
  last_action?: string;
  history_serial?: number; // You mentioned defaulting it to 1
  attach_file_name?: string;
  attach_file_name1?: string;
  attach_file_name2?: string;
  reject_histry?: string;
  sendback_histry?: string;
  req_doc_no?: number;
  req_div_code?: string;
  cost_code?: string;
  po_amount?: number;
  doc_date?: Date;
  projectCode?: string;
  need_by_date?: Date;
  status?: string;
  project_pr_no?: number;
  div_code?: string;
  final_approved_date?: Date;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
  flow_type?: string;
  project_code_from?: string;
  project_code_to?: string;
}



export interface IItemMrRequest {
  request_number?: string;
    item_code?: string;
    item_rate?: number;
    p_uom?: string;
    item_p_qty?: number | null; // Allow null
    item_l_qty?: number | null; // Allow null
    l_uom?: string;
    from_cost_code?: string;
    to_cost_code?: string;
    from_project_code?: string;
    to_project_code?: string;
    item_sequence_no?: number | null; // Allow null
}




// Material Request Interface
export interface IMaterialRequestPf extends IBasicMrRequest {
    request_number?: string;
  request_date?: Date;
   description?: string;
   last_action?: string;
   created_by?: string;
   updated_by: string;
   requestor_name : string;
need_by_date?: Date
   flow_level_running?: number,
company_code?: string; 
    items?: IItemMrRequest[];

}
