export interface ICostmaster {
  cost_code: string;
  cost_name: string;
  
}
export interface ITaxcategory {
  tx_cat_code: string;
  tx_cat_name: string;
  
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
  requestNumber: string; // Unique identifier for the purchase request (required)
  requestDate: Date; // Date of the request (required)
  description: string; // Description of the request (required)
  projectCode: string; // Project code associated with the request (required)
  wo_number?: string; // Work order number (optional)
  remarks?: string; // Additional remarks (optional)
  type_of_contract?: string; // Type of contract (optional)
  type_of_material_supply?: string; // Type of material supply (optional)
  contract_soft_hard?: string; // Type of contract (soft or hard) (optional)
  amc_service_status?: string; // AMC service status (optional)
  material_mechanical?: string; // Material for mechanical (optional)
  material_electrical?: string; // Material for electrical (optional)
  material_plumbing?: string; // Material for plumbing (optional)
  material_tools?: string; // Material for tools (optional)
  material_civil?: string; // Material for civil (optional)
  material_ac?: string; // Material for AC (optional)
  material_cleaning?: string; // Material for cleaning (optional)
  material_other?: string; // Other materials (optional)
  services_temp_staff?: string; // Temporary staff services (optional)
  services_rentals?: string; // Rentals services (optional)
  services_subcon_conslt?: string; // Subcontractor/consulting services (optional)
  services_other?: string; // Other services (optional)
  other_stationery?: string; // Other stationery (optional)
  other_it?: string; // Other IT services (optional)
  other_new_uniform_ppe?: string; // New uniform and PPE (optional)
  other_rplcmt_uniform?: string; // Replacement uniforms (optional)
  other_other?: string; // Other category (optional)
  good_material_request?: string; // Material request for goods (optional)
  service_request?: string; // Service request (optional)
  last_action?: string; // Last action taken (optional)
  created_by: string; // User who created the request (required)
  updated_by: string; // User who last updated the request (required)
  created_at: Date; // Timestamp when the request was created (required)
  updated_at: Date; // Timestamp when the request was last updated (required)
  flow_level_running: number; // Current flow level of the request (required)
  final_approved?: string; // Final approval status (optional)
  fa_uploaded?: string; // FA upload status (optional)
  need_by_date?: Date;
  service_type?: string;
  type_of_pr?: string;
  covered_by_contract_yes?: string;
  flag_sharing_cost?: string;
  budgeted_yes?: string;
  checked_store_yes?: string;
  amount?: string;
}

// Item Purchase Request Interface
export interface IItemPrRequest {
  item_code: string; // Unique identifier for the item (required)
  item_desp: string; // Description of the item (required)
  item_group_code: string; // Group code for the item (required)
  item_rate: number; // Rate for the item (required)
  p_uom: string; // Unit of measure for processed quantity (required)
  l_uom: string; // Unit of measure for local quantity (required)
  upp: number; // Unit price per item (required)
  item_l_qty: number; // Local quantity (required)
  item_p_qty: number; // Processed quantity (required)
  appr_upp: number | null; // Approved unit price per item (nullable)
  appr_item_l_qty: number | null; // Approved local quantity (nullable)
  appr_item_p_qty: number | null; // Approved processed quantity (nullable)
  currency_rate: number | null; // Currency exchange rate (nullable)
  amount: number; // Total amount for the item (required)
  company_code: string; // Company code for the item (required)
  updated_at: Date; // Last updated timestamp (required)
  updated_by: string | null; // User who last updated the item (nullable)
  request_number: string; // Purchase request number (required)
  curr_code: string | null; // Currency code (nullable)
  lcurr_amt: number | null; // Local currency amount (nullable)
  allocated_approved_quantity: number; // Approved allocated quantity (required)
  supplier: string; // Supplier code or name (required)
  service_rm_flag: string; // Flag for service or raw material (required)
  addl_item_desc: string; // Additional description for the item (optional)
  flow_level_running: number; // Running flow level (required)
  pr_amount: number | null; // Purchase request amount (nullable)
  po_amount: number | null; // Purchase order amount (nullable)
  month_budget: number | null; // Monthly budget (nullable)
  cost_code: string; // Cost code (required)
  cost_name: string; // Cost name (required)
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
  requestNumber: string; // Unique identifier for the purchase request (required)
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
