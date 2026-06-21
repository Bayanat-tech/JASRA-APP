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

export interface IPrtermnscondition {
  tsupplier: string; // Supplier code for the term condition (required)
  remarks: string; // Remarks about the term (required)
  dlvr_term: string; // Delivery term (required)
  payment_terms: string; // Payment terms (required)
  quotation_reference: string; // Quotation reference (required)
  delivery_address: string;
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

export interface IPurchaseOrder extends IBasicPurchaseOrder {
  companyCode: string; // Company code making the request (required)
  ref_doc_no: string; // Unique identifier for the purchase request (required)
  items: IItemPurcharseOrder[]; // Array of items in the purchase request (required)
}
