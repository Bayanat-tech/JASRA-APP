export interface ICostmaster {
  cost_code: string;
  cost_name: string;
  company_code: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISupplier {
  company_code: string;
  prin_code: string;
  supp_code: string;
  curr_code?: string;
  country_code?: string;
  supp_name?: string;
  supp_addr1?: string;
  supp_addr2?: string;
  supp_addr3?: string;
  supp_addr4?: string;
  supp_city?: string;
  supp_contact1?: string;
  supp_telno1?: string;
  supp_faxno1?: string;
  supp_email1?: string;
  supp_contact2?: string;
  supp_telno2?: string;
  supp_faxno2?: string;
  supp_email2?: string;
  supp_contact3?: string;
  supp_telno3?: string;
  supp_faxno3?: string;
  supp_ref1?: string;
  supp_ref2?: string;
  supp_ref3?: string;
  service_date?: Date;
  supp_acref?: string;
  supp_credit?: string;
  supp_stat?: string;
  supp_imp_code?: string;
  supp_lic_no?: string;
  supp_lic_type?: string;
  price_check?: string;
  supp_email3?: string;
  payment_terms?: string;
  importer_code?: string;

  old_supplier_code?: string;
  mobile?: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
}

export interface ISuppliermaster {
  supp_code: string; // Unique code, max length: 5
  supp_name: string; // Supplier name, max length: 50
  company_code: string; // Associated company code, max length: 10
  created_at?: Date; // Auto-generated creation timestamp
  created_by?: string; // User who created the record
  updated_at?: Date; // Auto-generated update timestamp
  updated_by?: string; // User who last updated the record
}

export interface IUommaster {
  uom_code: string;
  uom_name: string;
  company_code: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IProdmaster {
  prod_code: string;
  prod_name: string;
  prin_code: string;
  company_code: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IProjectmaster {
  project_code?: string; // varchar(15): Unique identifier for the project (optional)
  project_name?: string; // varchar(200): Name of the project (optional)
  company_code?: string; // varchar(5): Company code (optional)
  updated_at?: Date; // datetime: Timestamp for the last update (optional)
  updated_by?: string; // varchar(50): User who last updated the record (optional)
  created_by?: string; // varchar(20): User who created the record (optional)
  created_at?: Date; // datetime: Timestamp for when the record was created (optional)
  div_code: string; // Required field for division code
  prno_pre_fix?: string; // Prefix for project number (optional)
  flag_proj_department?: string; // Required field indicating project/department flag
  project_type: string; // Field to indicate the type of project
  total_project_cost: number; // Field for total project cost (up to 10 digits, 2 decimal places)
  facility_mgr_name: string; // varchar(100): Name of the facility manager
  facility_mgr_email: string; // Email address of the facility manager
  facility_mgr_phone: string; // Phone number of the facility manager
  project_date_from?: Date; // Start date of the project (optional)
  project_date_to?: Date; // End date of the project (optional)
}

export interface IVProjectmaster {
  project_code?: string; // Project code (optional)
  project_name?: string; // Project name (optional)
  company_code?: string; // Company code (optional)
  div_code: string; // Division code (required)
  div_name: string; // Division name (required)
  prno_pre_fix?: string; // Prefix for project number (optional)
  flag_proj_department?: string; // Flag for project/department
  project_date_from?: string; // Start date in ISO format (optional)
  project_date_to?: string; // End date in ISO format (optional)
  total_project_cost: number; // Total project cost (required, number)
  project_type: string; // Project type (required)
  facility_mgr_name: string; // Facility manager's name (required)
  facility_mgr_email: string; // Facility manager's email (required)
  facility_mgr_phone?: string; // Facility manager's phone (optional)
  updated_at?: string; // Last updated timestamp in ISO format (optional)
  updated_by?: string; // Last updated by user (optional)
  created_at?: string; // Creation timestamp in ISO format (optional)
  created_by?: string; // Created by user (optional)
}

export interface IItemtmaster {
  item_code: string;
  item_desp: string;
  company_code?: string;
  updated_at?: Date;
  updated_by?: string;
  created_at?: Date;
  created_by?: string;
}
export interface IDivisionmaster {
  div_code: string; // required
  div_name: string; // required
  company_code?: string; // optional
  updated_at?: Date; // optional
  updated_by?: string; // optional
  created_at?: Date; // optional
  created_by?: string; // optional
}

export interface IItemtmaster {
  item_code: string;
  item_desp: string;
  company_code?: string;
  updated_at?: Date;
  updated_by?: string;
  created_at?: Date;
  created_by?: string;
}

export interface IdropdownProjectmaster {
  project_code: string;
  project_name: string;
  company_code?: string;
}

// Basic Purchase Request Interface
// Basic Purchase Request Interface
export interface IBasicPrRequest {
  request_date: Date; // Date of the request (consider Date type if needed)
  ac_name: string; // Account name of the supplier
  supplier: string; // Supplier code
  description: string; // Description of the request
  remarks: string; // Additional remarks
  amount: number; // Total amount
  department_code: string; // Department code
  flow_code: string; // Flow code
  flow_level_initial: number; // Initial flow level
  flow_level_running: number; // Running flow level
  flow_level_final: number; // Final flow level
  company_code: string; // Company identifier
  user_dt: string; // User date (consider Date type if needed)
  user_id: string; // User identifier
  currency_rate: number; // Currency exchange rate
  fa_uploaded: boolean; // Flag indicating if FA is uploaded
  final_approved: boolean; // Flag indicating final approval
  remarks_histry: string; // History of remarks
  cancel_flag: boolean; // Flag indicating if the request is canceled
  tx_cat_code: string; // Tax category code
  tx_compntcat_code_1: string; // Tax component category code 1
  tx_compntcat_code_2: string; // Tax component category code 2
  tx_compntcat_code_3: string; // Tax component category code 3
  tx_compntcat_code_4: string; // Tax component category code 4
  tx_compnt_1_expmnt: string; // Tax component 1 experiment data
  create_user: string; // User who created the request
  create_date: Date; // Creation date (consider Date type if needed)
  tx_cat_name: string; // Tax category name
  tx_compntcat_name: string; // Tax component category name
  curr_code: string; // Currency code
  po_amount: number; // Purchase order amount
  curr_name: string; // Currency name
  flow_description: string; // Flow description
  last_updated: Date; // Last updated timestamp (consider Date type if needed)
  last_action: string; // Last action performed
  history_serial: number; // History serial number
  cost_code: string; // Cost code
  request_hod_user: string; // HOD user handling the request
}

// Item Purchase Request Interface

// Dandekar
export interface IItemPrRequest {
  item_code: string; // Unique identifier for the item
  item_desp: string; // Item description
  item_group_desc: string; // Item group description
  item_group_code: string; // Item group code
  item_rate: number; // Item rate
  item_qty: number; // Item quantity
  currency_rate: number; // Currency exchange rate
  amount: number; // Total amount
  company_code: string; // Company identifier
  user_dt: string; // User date (consider Date type if needed)
  user_id: string; // User identifier
  request_number: string; // Purchase request number
  curr_code: string; // Currency code
  tx_cat_code: string; // Tax category code
  tx_compntcat_code_1: string; // Tax component category code 1
  tx_compnt_perc_1: number; // Tax component percentage
  tx_compnt_amt_1: number; // Tax component amount
  tx_compnt_lcuramt_1: number; // Tax component local currency amount
  tx_compnt_1_expmt: string; // Tax component exemption
  lcurr_amt: number; // Local currency amount
  allocated_approved_quantity: number; // Approved quantity allocation
  selected_item: boolean; // Selected item flag
  last_action: string; // Last action performed
  history_serial: number; // History serial number
  curr_name: string; // Currency name
  item_srno: string; // Item serial number
  supplier_part_code: string; // Supplier part code
  rate_methode: string; // Rate method
  item_canel: boolean; // Item cancel flag
  tax_name: string; // Tax category name
  cost_code: string; // Cost code
  capex: boolean; // Capital expenditure flag
}

// Purchase Request Term and Conditions Interface
export interface IPrtermnscondition {
  tsupplier: string; // Supplier code for the term condition (required)
  remarks: string; // Remarks about the term (required)
  dlvr_term: string; // Delivery term (required)
  payment_terms: string; // Payment terms (required)
  quotation_reference: string; // Quotation reference (required)
  delivery_address: string;
}

// Purchase Request Interface
export interface IPurchaseRequestPf extends IBasicPrRequest {
  companyCode: string; // Company code making the request (required)
  request_number: string; // Unique identifier for the purchase request (required)
  items: IItemPrRequest[]; // Array of items in the purchase request (required)
  termconditions: IPrtermnscondition[]; // Array of terms and conditions (required)
}

export interface IBasicPurchaseOrder {
  doc_no: string; // Date of the request (required)
  doc_date: Date;
  supplier: string;
  request_number: string;
  div_code: string;
  po_confirm: string;
  po_cancel: string;
  cancel_type: string;
  supp_name: string;
  delvr_term: string;
  supp_addr1: string;
  supp_addr2: string;
  supp_addr3: string;
  supp_addr4: string;
  supp_telno1: string;
  supp_faxno1: string;
  supp_email1: string;
  project_code: string;
  project_name: string;
  wo_number: string;
  remarks: string;
  payment_terms: string;
  last_action: string;
}

// Item Purchase Request Interface
export interface IItemPurcharseOrder {
  cost_code: string;
  item_code: string;
  final_rate: number;
  allocated_approved_quantity: number;
  item_p_qty: number;
  item_l_qty: number;
  p_uom: string;
  upp: number;
  appr_item_l_qty: number;
  appr_item_p_qty: number;
  currency_rate: number;
  amount: number;
  curr_code: string;
  lcurr_amt: number;
  item_cancel: string;
  supplier: string;
  service_rm_flag: string;
  addl_item_desc: string;
  div_code: string;
  ref_doc_no: string;
  sr_no: number;
  po_mod_appr_qty: number;
  po_mod_final_rate: number;
  po_confirm: string;
  po_cancel: string;
  po_mod_amount: number;
}

// Purchase Request Interface
export interface IPurchaseOrder extends IBasicPurchaseOrder {
  companyCode: string; // Company code making the request (required)
  ref_doc_no: string; // Unique identifier for the purchase request (required)
  items: IItemPurcharseOrder[]; // Array of items in the purchase request (required)
}
