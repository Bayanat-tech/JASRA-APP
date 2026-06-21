//import dayjs from 'dayjs';

export interface TddPrinceCustomer {
  company_code: string;
  cust_name: string;
  cust_code: string;
  prin_code: string;
  cust_addr1: string;
  cust_addr2: string;
  cust_addr3: string;
  cust_addr4: string;
  cust_city: string;
  prin_name: string;
}

interface Product {
  prod_name: string;
}
export interface TOrderDetail extends Product {
  company_code: string;
  prin_code: string;
  job_no: string;
  cust_code: string;
  cust_name: string;
  order_no: string;
  serial_no: number;
  prod_code: string;
  qty_puom: number | null;
  p_uom: string | null;
  qty_luom: number | null;
  quantity: number;
  doc_ref: string | null;
  lot_no: string | null;
  po_no: string | null;
  imp_job_no: string | null;
  manu_code: string | null;
  container_no: string | null;
  production_from: Date | null;
  production_to: Date | null;
  expiry_from: Date | null;
  expiry_to: Date | null;
  unit_price: number | null;
  site_code: string | null;
  loc_code_from: string | null;
  loc_code_to: string | null;
  picked: string | null;
  confirmed: string | null;
  confirmed_date: Date | null;
  l_uom: string | null;
  uppp: number | null;
  selected: string | null;
  aisle_from: string | null;
  aisle_to: string | null;
  height_from: string | null;
  height_to: string | null;
  column_from: string | null;
  column_to: string | null;
  gate_no: string | null;
  sales_rate: number | null;
  exp_container_no: string | null;
  exp_container_size: number | null;
  exp_container_type: string | null;
  exp_container_sealno: string | null;
  moc1: string | null;
  moc2: string | null;
  order_serial: number | null;
  origin_country: string | null;
  bal_pack_qty: number | null;
  multi_series: string | null;
  prod_attrib_code: string | null;
  prod_grade1: string | null;
  prod_grade2: string | null;
  tx_identity_number: string | null;
  ref_txn_code: string | null;
  ref_txn_slno: number | null;
  so_txn_code: string | null;
  inbound_done: string | null;
  ref_txn_doc: string | null;
  supp_code: string | null;
  supp_reference: string | null;
  orig_prod_code: string | null;
  salesman_code: string | null;
  hs_code: string | null;
  batch_no: string | null;
  act_order_qty: number | null;
  bal_order_qty: number | null;
  minperiod_exppick: number;
  ignore_minexp_period: string | null;
  stock_owner: string | null;
  ind_code: string | null;
  git_no: string | null;
  priority: string | null;
  updated_at?: Date;
  updated_by: string | null;
  created_by: string | null;
  created_at?: Date;
  qty_string?: string | null;
}
//IEDIOrderDetail

export interface IEDIOrderDetail {
  company_code?: string; // default 'BSG'
  prin_code: string;
  job_no: string;
  product_code: string;
  site_code?: string;
  puom?: string;
  qty1?: number;
  luom?: string;
  qty2?: number;
  lotno?: string;
  location_from?: string;
  location_to?: string;
  salesman_code?: string;
  expiry_date_from?: Date;
  expiry_date_to?: Date;
  batch_no?: string;
  mfg_date_from?: Date;
  mfg_date_to?: Date;
  customer_store_name?: string;
  order_no: string;
  cust_code: string;
  serial_no: number;
  serial_number?: string; // default '-'
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
  user_id?: string;
  error_msg?: string;
}

export interface IToOrderEntry {
id: number;
manu_code?: string; // ➕ New Field Added
company_code: string;
prin_code: string;
job_no: string;
cust_code: string;
cust_name: string;
order_no: string;
order_date: Date | string | null;
order_due_date: Date | string | null;
cust_reference: string | null;
po_no: string | null;
po_date: Date | string | null;
curr_code: string;
ex_rate: number;
exp_container_no: string | null;
exp_container_size: string | null;
exp_container_type: string | null;
exp_container_sealno: string | null;
moc1: string | number;
moc2: string | number;
act_code: string | null;
uoc: string | null;
volume: string | null;
net_weight: string | null;
assigned_pda_user: string | null;
order_serial: string | null;
ref_txn_code: string | null;
ref_txn_docno: string | null;
ref_txn_slno: string | null;
so_txn_code: string | null;
delivery_term: string | null;
salesman_code: string | null;
recollected_flag: string;
recollected_dt: Date | string | null;
recollected_remarks: string | null;
stuff_start: Date | string | null;
stuff_end: Date | string | null;
pick_start: Date | string | null;   // updated
pick_end: Date | string | null;     // updated
pack_start: Date | string | null;   // updated
pack_end: Date | string | null;     // updated
load_start: Date | string | null;   // updated
load_end: Date | string | null;     // updated
allow_doc_gen: string | null;
pre_so: string | null;
assigned_pack_user: string | null;
order_location: string | null;
route_code: string | null;
manifest_no: string | null;
vehicle_no: string | null;
order_load_seq_nr: string | null;
}
