export type TBasicPuraseOrder = {
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
};

export type TItemPurchaseOrder = {
  cost_code: string;
  item_code: string;
  final_rate: number;
  allocated_approved_quantity: number;
  item_p_qty: number;
  item_l_qty: number;
  p_uom: string;
  l_uom: string;
  item_rate: number;
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
  type?: string; // Add optional type property
  addl_item_desc: string;
  div_code: string;
  ref_doc_no: string;
  sr_no: number;
  po_mod_appr_qty: number;
  po_mod_final_rate: number;
  po_confirm: string;
  po_cancel: string;
  project_code: string;
  po_mod_amount: number;
  discount_amount: number;
  prev_revised_rate: number; // Add this line
  item_desp: string;
};

export type TPurchaseOrder = TBasicPuraseOrder & {
  companyCode: string; // Company code making the request (required)
  ref_doc_no: string; // Unique identifier for the purchase request (required)
  items: TItemPurchaseOrder[]; // Array of item requests
};
