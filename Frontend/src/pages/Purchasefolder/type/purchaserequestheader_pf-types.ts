
import { TFile } from 'types/types.file'; // Add this import statement

export type MessageBoxItem = {
  messagebox: string;
  type: string;
};

export type TVPurchaserequestheader = {
  div_code: string;
  request_number: string; // Equivalent to `REQUEST_NUMBER` varchar(25) DEFAULT NULL
  request_date: Date; // Equivalent to `REQUEST_DATE` datetime DEFAULT NULL
  document_number?: string;

  description?: string;
  company_code: string;
  supplier?: string;
  remarks: string;
  amount?: number;
  department_code?: string;
  flow_code?: string;
  role_name?: string;
  project_name?: string;
  create_user?: string;
  create_date?: Date;
  last_action?: string;
  last_updated?: Date;
  flow_level_running: string;
  document_type?: string;
  status?: string;
  company_name?: string;
  reference_doc_no?: string;
  sendback_histry?: string;
};

export type TVPRejectrequest = {
  request_number: string;
  request_date: Date;
  document_number: string;
  description?: string;
  company_code: string;
  supplier?: string;
  remarks: string;
  amount?: number;
  department_code?: string;
  flow_code?: string;
  role_name?: string;
  project_name?: string;
  create_user?: string;
  create_date?: Date;
  last_action?: string;
  last_updated?: Date;
  flow_level_running: string;
  document_type?: string;
  status?: string;
};

export type TItemdetails = {
  item_code: string; // Unique identifier for the item
  item_rate: number; // Rate for the item
  amount: number; // Quantity of the item being requested
  service_rm_flag: string; // Indicates if the item is a service or raw material (e.g., 'Service', 'RM')
  item_p_qty: number | null; // Processed quantity (null if not applicable)
  p_uom: string; // Unit of measure for processed quantity
  item_l_qty: number; // Local quantity
  allocated_approved_quantity: number; // Approved allocated quantity
  l_uom: string; // Unit of measure for local quantity
  cost_code: string; // Cost accounting code
  upp: number; // Unit price per item
  item_desp: string; // Description of the item
  item_group_code: string; // Group code for the item
  appr_upp: number; // Approved unit price per item
  appr_item_l_qty: number; // Approved local quantity
  appr_item_p_qty: number; // Approved processed quantity
  currency_rate: number; // Exchange rate for currency
  updated_at: Date; // Last updated timestamp
  updated_by: string; // User who last updated the record
  curr_code: string; // Currency code
  lcurr_amt: number; // Local currency amount
  selected_item?: string; // Flag or code indicating a selected item
  last_action?: string; // Last action performed on the item
  history_serial: number; // Serial number in the history
  curr_name: string; // Currency name
  item_srno: number; // Serial number for the item
  supplier_part_code: string; // Supplier's part code for the item
  rate_method: string; // Method used to determine the rate
  supplier: string; // Supplier name
  select_item?: string; // Another selection flag (confirm purpose and necessity)
  discount_amount: number; // Discount applied to the item
  final_rate: number; // Final rate after discount
  item_cancel: string; // Cancellation status for the item
  mail_attach?: string; // Email attachment status or path
  cash_ind: string; // Cash indicator
  addl_item_desc?: string; // Additional description for the item
  pr_amount: number; // Purchase request amount
  po_amount: number; // Purchase order amount
  month_budget: number; // Monthly budget
  ac_name: string; // Account name
};

export type TPrrequest = {
  header: {
    request_number?: string;
    request_date?: Date;
    description?: string;
    project_code?: string;
    company_code?: string;
    created_by?: string;
    updated_by?: string;
  };
  details: TItemdetails[]; // Always an array of item details
};

export type TBasicPrrequest = {
  requestor_name?: string;
  project_name?: string;
  request_date?: Date;
  need_by_date?: Date;
  description?: string;
  project_code?: string;
  wo_number?: string;
  remarks?: string;
  type_of_contract: string;
  type_of_material_supply: string;
  contract_soft_hard: string;
  amc_service_status: string;
  amc_from?:Date;
  amc_to?: Date;
  material_mechanical?: string;
  material_electrical?: string;
  material_plumbing?: string;
  material_tools?: string;
  material_civil?: string;
  material_ac?: string;
  material_cleaning?: string;
  material_other?: string;
  services_temp_staff?: string;
  services_rentals?: string;
  services_subcon_conslt?: string;
  services_other?: string;
  other_stationery?: string;
  other_it?: string;
  other_new_uniform_ppe?: string;
  other_rplcmt_uniform?: string;
  other_other?: string;
  good_material_request?: string;
  service_request?: string;
  last_action?: string;
  created_by?: string;
  flow_level_running?: number;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  final_approved?: string;
  fa_uploaded?: string;
  service_type?: string;
  type_of_pr?: string;
  covered_by_contract_yes?: string;
  flag_sharing_cost?: string;
  budgeted_yes?: string;
  checked_store_yes?: string;
  amount: number;
  div_code: string; 

  //div_code = 10
  accommodation?: string;
  catering: string;
  laundry_housekeeping: string;
  medical: string;
  transportation: string;
  training: string;
  recruitment_hr: string;
  uniform : string;
  stationary: string;
  it_tech: string;
  furniture: string;
  entertainment: string;
  barber: string;
  others: string;
};



export type TItemPrrequest = {
  div_code: string; // Division code
  prod_name: string; // Name of the product
  item_code: string; // Unique identifier for the item
  item_desp: string; // Description of the item
  item_group_code: string; // Group code for the item
  item_rate: number; // Rate for the item
  p_uom: string; // Unit of measure for processed quantity
  l_uom: string; // Unit of measure for local quantity
  upp: number; // Unit price per item
  item_l_qty: number; // Local quantity
  flow_level_running: number;
  item_p_qty: number | null; // Processed quantity (null if not applicable)
  appr_upp: number; // Approved unit price per item
  appr_item_l_qty: number; // Approved local quantity
  appr_item_p_qty: number; // Approved processed quantity
  currency_rate: number; // Exchange rate for currency
  amount: number; // Quantity of the item being requested
  company_code: string;
  updated_at: Date; // Last updated timestamp
  updated_by: string; // User who last updated the record
  request_number: string;
  curr_code: string; // Currency code
  lcurr_amt: number; // Local currency amount
  allocated_approved_quantity: number; // Approved allocated quantity
  selected_item?: string; // Flag or code indicating a selected item
  last_action?: string; // Last action performed on the item
  history_serial: number; // Serial number in the history
  curr_name: string; // Currency name
  //item_sequence_no: number; // Sequence number for the item
  item_sequence_no?: number; // Sequence number for the item
  item_srno: number; // Serial number for the item
  supplier_part_code: string; // Supplier's part code for the item
  rate_method: string; // Method used to determine the rate
  supplier: string; // Supplier name
  select_item: string;
  discount_amount: number; // Discount applied to the item
  final_rate: number; // Final rate after discount
  item_cancel: string; // Cancellation status for the item
  mail_attach?: string; // Email attachment status or path
  cash_ind: string; // Cash indicator
  service_rm_flag: string; // Indicates if the item is a service or raw material (e.g., 'Service', 'RM')
  addl_item_desc?: string; // Additional description for the item
  pr_amount: number; // Purchase request amount
  po_amount: number; // Purchase order amount
  month_budget: number; // Monthly budget
  ac_name: string; // Account name
  cost_code: string | null; // Allow null
  cost_name: string;
  ref_doc_no?: string;
  doc_date: Date | null; // Allow doc_date to be either a Date or null
  originalIndex?: number;
};

export type TPrTermCondition = {
  tsupplier: string; // Supplier name
  remarks: string;
  dlvr_term: string;
  payment_terms: string;
  quatation_reference: string;
  delivery_address: string;
};

export type TPurchaserequestPf = TBasicPrrequest & {
  company_code: string;
  request_number?: string;
  items: TItemPrrequest[];
  Termscondition: TPrTermCondition[];
  files?: TFile[];
  exchange_rate?: number;
};
