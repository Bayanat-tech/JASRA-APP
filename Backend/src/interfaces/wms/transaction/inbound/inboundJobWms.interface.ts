export interface IJobInbListingView {
  company_code: string;
  prin_code: string;
  prin_name: string;
  job_class: string;
  job_date: Date;
  order_type: string;
  confirm_date: Date;
  job_no: string;
  doc_ref: string;
  canceled: string;
  cancel_date: Date;
  invoiced: string;
  invoice_date: Date;
  created_at?: Date;
  created_by: string;
  updated_at?: Date;
  updated_by: string;
}
export interface IJobInboundWms {
  company_code: string; // varchar(10)
  prin_code: string; // varchar(5)
 // prin_name: string;
  job_no: string; // varchar(10)
  job_date: Date; // date
  job_type?: string; // varchar(3)
  job_class?: string; // varchar(3)
  dept_code?: string; // varchar(3)
  transport_mode?: string; // varchar(1)
  doc_ref?: string; // varchar(20)
  port_code?: string; // varchar(8)
  description1?: string; // varchar(80)
  description2?: string; // varchar(80)
  prin_ref1?: string; // varchar(80)
  prin_ref2?: string; // varchar(80)
  remarks?: string; // varchar(250)
  eta?: Date; // date
  ata?: Date; // date
  etd?: Date; // date
  schedule_date?: Date; // date
  payment_terms?: string; // varchar(3)
  curr_code?: string; // varchar(3)
  ex_rate?: number; // decimal(15,5)
  frieght_value?: number; // float
  insurance_value?: number; // float
  cust_code?: string; // varchar(20)
  container_flag?: string; // varchar(1)
  container?: string; // varchar(1)
  // container_date?: Date; // date
  packdet?: string; // varchar(1)
  //packdet_date?: Date; // date
  allocated?: string; // varchar(1)
  //allocate_date?: Date; // date
  canceled?: string; // varchar(1)
  //cancel_date?: Date; // date
  confirmed?: string; // varchar(1)
  //confirm_date?: Date; // date
  grn_no?: number; // int
  //grn_date?: Date; // date
  invoiced?: string; // varchar(1)
  //invoice_date?: Date; // date
  completed?: string; // varchar(1)
  //complete_date?: Date; // date
  exp_jobno?: string; // varchar(10)
  picked?: string; // varchar(1)
  //picked_date?: Date; // date
  //order_date?: Date; // date
  ordered?: string; // varchar(1)
  destination_port?: string; // varchar(8)
  vessel_name?: string; // varchar(50)
  voyage_no?: string; // varchar(20)
  payableat?: string; // varchar(20)
  place_receipt?: string; // varchar(50)
  place_delivery?: string; // varchar(50)
  no_of_original_bl?: number; // tinyint
  broker_code?: string; // varchar(5)
  quotation_ref?: string; // varchar(15)
  // be_no?: string; // varchar(20)
  //be_date?: Date; // date
  // be_dep_amount?: number; // decimal(18,6)
  // deposit_collected?: string; // char(1)
  // deposit_collected_dt?: Date; // date
  // deposit_collected_no?: number; // int
  //be_deposits?: string; // char(1)
  //ind_freight?: string; // varchar(1)
  country_origin?: string; // varchar(50)
  country_destination?: string; // varchar(50)
  //task_order?: number; // int
  custom_recno?: string; // varchar(20)
  doc_ref2?: string; // varchar(20)
  hawb?: string; // varchar(20)
  reexport?: string; // varchar(1)
  ref_jobno?: string; // varchar(200)
  combined_jobno?: string; // varchar(10)
  carrier?: string; // varchar(5)
  job_lock?: string; // varchar(1)
  courier_code?: string; // varchar(20)
  delivery_point?: string; // varchar(20)
  div_code?: string; // varchar(5)
  salesman_code?: string; // varchar(10)
  health_status?: string; // varchar(10)
  transit_time?: string; // varchar(60)
  document_check?: string; // char(1)
  delivery_remarks?: string; // varchar(250)
  cargo_received?: string; // varchar(1)
  delivered_by?: string; // varchar(50)
  canceled_by?: string; // varchar(25)
  cancel_remarks?: string; // varchar(250)
  send_mail?: string; // varchar(1)
  backlog_mail?: string; // varchar(1)
  dplan_flag?: string; // varchar(1)
  trans_batch_id?: string; // varchar(20)
  send_mail_dn?: string; // varchar(1)
  kpi_inc?: string; // varchar(1)
  kpi_exc_remark?: string; // varchar(100)
  job_category?: string; // varchar(200)
  edit_user?: string; // varchar(10)
  tx_cat_code?: string; // varchar(5)
  bcf_code?: string; // varchar(10)
  created_at?: Date; // date
  created_by: string; // varchar(20)
  updated_at?: Date; // date
  updated_by: string; // varchar(20)
  confirm_date?: Date;
  invoice_date?: Date;
}

export interface ITrInAllReports {
  company_code: string;
  module: string;
  submodule: string;
  reportname: string;
  reportobject: string;
  other: string;
  seq_number: number;
  reportorder: number;
  report_id: string;
}

export interface IGrnReport {
  company_code: string;
  company_name: string;
  prin_code: string;
  prin_name: string;
  job_no: string;
  txn_date: Date;
  prod_code: string;
  prod_name: string;
  uppp: number;
  site_code: string;
  qtypuom: number;
  qtyluom: number;
  p_uom: string;
  l_uom: string;
  vessel_name: string;
  container_no: string;
  seal_no: string;
  po_no: string;
  doc_ref: string;
  lot_no: string;
  mfg_date: Date;
  exp_date: Date;
  grn_no: number;
  grn_date: Date;
  user_id: string;
  volume: number;
  netwt: number;
  receipt_date: Date;
  container_size: number;
  origin_country: string;
  site_ind: string;
  batch_no: string;
  grosswt: number;
  unstuff_date: string;
  job_class: string;
  s_no: number;
  rcpt_type: string;
  seal_no1: string;
  cnt_lotno: number;
  prin_ref2: string;
  group_name: string;
  qty: number;
  job_qtyexpected: number;
  job_no_of_cse: number;
  job_qtyluom_expected: number;
  job_qtypuom_expected: number;
  no_of_cse: number;
  qtypuom_expected: number;
  qtyluom_expected: number;
  qtyexpected: number;
  qty_rcvd: number;
  qtypuom_dam: number;
  qtyluom_dam: number;
  qty_dam: number;
}

export interface IPackDetailEDI {
  company_code?: string; // default 'BSG'
  prin_code: string;
  job_no: string;
  packdet_no: number; // Serial number for the line item

  // Mapped fields
  container_no?: string;
  vessel_name?: string;
  voyage_no?: string;

  product_code: string; // Maps to PROD_CODE
  puom?: string;        // Maps to P_UOM
  qty_puom?: number;    // Maps to QTY_PUOM
  luom?: string;        // Maps to L_UOM
  qty_luom?: number;    // Maps to QTY_LUOM

  unit_price?: number;  // Maps to UNIT_PRICE
  curr_code?: string;   // Maps to CURR_CODE

  lot_no?: string;
  mfg_date?: Date;
  exp_date?: Date;

  manu_code?: string;           // Manufacturer
  origin_country?: string;

  from_site?: string;           // Maps to FROM_SITE
  to_site?: string;             // Optional depending on flow
  location_from?: string;
  location_to?: string;

  batch_no?: string;
  po_no?: string;

  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
  user_id?: string;
}
export interface IJobInboundWmsview {
  company_code: string; // varchar(10)
  prin_code: string; // varchar(5)
 // prin_name: string;
  job_no: string; // varchar(10)
  job_date: Date; // date
  job_type?: string; // varchar(3)
  job_class?: string; // varchar(3)
  dept_code?: string; // varchar(3)
  transport_mode?: string; // varchar(1)
  doc_ref?: string; // varchar(20)
  port_code?: string; // varchar(8)
  description1?: string; // varchar(80)
  description2?: string; // varchar(80)
  prin_ref1?: string; // varchar(80)
  prin_ref2?: string; // varchar(80)
  remarks?: string; // varchar(250)
  eta?: Date; // date
  ata?: Date; // date
  etd?: Date; // date
  schedule_date?: Date; // date
  payment_terms?: string; // varchar(3)
  curr_code?: string; // varchar(3)
  ex_rate?: number; // decimal(15,5)
  frieght_value?: number; // float
  insurance_value?: number; // float
  cust_code?: string; // varchar(20)
  container_flag?: string; // varchar(1)
  container?: string; // varchar(1)
  // container_date?: Date; // date
  packdet?: string; // varchar(1)
  //packdet_date?: Date; // date
  allocated?: string; // varchar(1)
  //allocate_date?: Date; // date
  canceled?: string; // varchar(1)
  //cancel_date?: Date; // date
  confirmed?: string; // varchar(1)
  //confirm_date?: Date; // date
  grn_no?: number; // int
  //grn_date?: Date; // date
  invoiced?: string; // varchar(1)
  //invoice_date?: Date; // date
  completed?: string; // varchar(1)
  //complete_date?: Date; // date
  exp_jobno?: string; // varchar(10)
  picked?: string; // varchar(1)
  //picked_date?: Date; // date
  //order_date?: Date; // date
  ordered?: string; // varchar(1)
  destination_port?: string; // varchar(8)
  vessel_name?: string; // varchar(50)
  voyage_no?: string; // varchar(20)
  payableat?: string; // varchar(20)
  place_receipt?: string; // varchar(50)
  place_delivery?: string; // varchar(50)
  no_of_original_bl?: number; // tinyint
  broker_code?: string; // varchar(5)
  quotation_ref?: string; // varchar(15)
  // be_no?: string; // varchar(20)
  //be_date?: Date; // date
  // be_dep_amount?: number; // decimal(18,6)
  // deposit_collected?: string; // char(1)
  // deposit_collected_dt?: Date; // date
  // deposit_collected_no?: number; // int
  //be_deposits?: string; // char(1)
  //ind_freight?: string; // varchar(1)
  country_origin?: string; // varchar(50)
  country_destination?: string; // varchar(50)
  //task_order?: number; // int
  custom_recno?: string; // varchar(20)
  doc_ref2?: string; // varchar(20)
  hawb?: string; // varchar(20)
  reexport?: string; // varchar(1)
  ref_jobno?: string; // varchar(200)
  combined_jobno?: string; // varchar(10)
  carrier?: string; // varchar(5)
  job_lock?: string; // varchar(1)
  courier_code?: string; // varchar(20)
  delivery_point?: string; // varchar(20)
  div_code?: string; // varchar(5)
  salesman_code?: string; // varchar(10)
  health_status?: string; // varchar(10)
  transit_time?: string; // varchar(60)
  document_check?: string; // char(1)
  delivery_remarks?: string; // varchar(250)
  cargo_received?: string; // varchar(1)
  delivered_by?: string; // varchar(50)
  canceled_by?: string; // varchar(25)
  cancel_remarks?: string; // varchar(250)
  send_mail?: string; // varchar(1)
  backlog_mail?: string; // varchar(1)
  dplan_flag?: string; // varchar(1)
  trans_batch_id?: string; // varchar(20)
  send_mail_dn?: string; // varchar(1)
  kpi_inc?: string; // varchar(1)
  kpi_exc_remark?: string; // varchar(100)
  job_category?: string; // varchar(200)
  edit_user?: string; // varchar(10)
  tx_cat_code?: string; // varchar(5)
  bcf_code?: string; // varchar(10)
  created_at?: Date; // date
  created_by: string; // varchar(20)
  updated_at?: Date; // date
  updated_by: string; // varchar(20)
  confirm_date?: Date;
  invoice_date?: Date;
}