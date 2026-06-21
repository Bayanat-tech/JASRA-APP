import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "VW_TO_ORDER_DET" })
export class OrderDetail {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no: string;

  @PrimaryColumn({ name: "ORDER_NO", type: "varchar2", length: 20 })
  order_no: string;

  @PrimaryColumn({ name: "SERIAL_NO", type: "number" })
  serial_no: number;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20 })
  cust_code: string;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40 })
  prod_code: string;

  @Column({ name: "QTY_PUOM", type: "number", precision: 12, scale: 1 })
  qty_puom: number;

  @Column({ name: "P_UOM", type: "varchar2", length: 5 })
  p_uom: string;

  @Column({ name: "QTY_LUOM", type: "number", precision: 12, scale: 1 })
  qty_luom: number;

  @Column({ name: "QUANTITY", type: "number", precision: 12, scale: 1 })
  quantity: number;

  @Column({ name: "DOC_REF", type: "varchar2", length: 20 })
  doc_ref: string;

  @Column({ name: "LOT_NO", type: "varchar2", length: 20 })
  lot_no: string;

  @Column({ name: "PO_NO", type: "varchar2", length: 20 })
  po_no: string;

  @Column({ name: "IMP_JOB_NO", type: "varchar2", length: 10 })
  imp_job_no: string;

  @Column({ name: "MANU_CODE", type: "varchar2", length: 10 })
  manu_code: string;

  @Column({ name: "CONTAINER_NO", type: "varchar2", length: 20 })
  container_no: string;

  @Column({ name: "PRODUCTION_FROM", type: "date" })
  production_from: Date;

  @Column({ name: "PRODUCTION_TO", type: "date" })
  production_to: Date;

  @Column({ name: "EXPIRY_FROM", type: "date" })
  expiry_from: Date;

  @Column({ name: "EXPIRY_TO", type: "date" })
  expiry_to: Date;

  @Column({ name: "UNIT_PRICE", type: "number", precision: 16, scale: 6 })
  unit_price: number;

  @Column({ name: "SITE_CODE", type: "varchar2", length: 5 })
  site_code: string;

  @Column({ name: "LOC_CODE_FROM", type: "varchar2", length: 15 })
  loc_code_from: string;

  @Column({ name: "LOC_CODE_TO", type: "varchar2", length: 15 })
  loc_code_to: string;

  @Column({ name: "PICKED", type: "char", length: 1 })
  picked: string;

  @Column({ name: "CONFIRMED", type: "char", length: 1 })
  confirmed: string;

  @Column({ name: "CONFIRMED_DATE", type: "date" })
  confirmed_date: Date;

  @Column({ name: "L_UOM", type: "varchar2", length: 6 })
  l_uom: string;

  @Column({ name: "UPPP", type: "number" })
  uppp: number;

  @Column({ name: "SELECTED", type: "char", length: 1 })
  selected: string;

  @Column({ name: "AISLE_FROM", type: "varchar2", length: 2 })
  aisle_from: string;

  @Column({ name: "AISLE_TO", type: "varchar2", length: 2 })
  aisle_to: string;

  @Column({ name: "HEIGHT_FROM", type: "varchar2", length: 2 })
  height_from: string;

  @Column({ name: "HEIGHT_TO", type: "varchar2", length: 2 })
  height_to: string;

  @Column({ name: "COLUMN_FROM", type: "varchar2", length: 2 })
  column_from: string;

  @Column({ name: "COLUMN_TO", type: "varchar2", length: 2 })
  column_to: string;

  @Column({ name: "GATE_NO", type: "varchar2", length: 3 })
  gate_no: string;

  @Column({ name: "SALES_RATE", type: "number", precision: 18, scale: 4 })
  sales_rate: number;

  @Column({ name: "EXP_CONTAINER_NO", type: "varchar2", length: 20 })
  exp_container_no: string;

  @Column({ name: "EXP_CONTAINER_SIZE", type: "number", precision: 10, scale: 0 })
  exp_container_size: number;

  @Column({ name: "EXP_CONTAINER_TYPE", type: "varchar2", length: 40 })
  exp_container_type: string;

  @Column({ name: "EXP_CONTAINER_SEALNO", type: "varchar2", length: 50 })
  exp_container_sealno: string;

  @Column({ name: "MOC1", type: "varchar2", length: 3 })
  moc1: string;

  @Column({ name: "MOC2", type: "varchar2", length: 5 })
  moc2: string;

  @Column({ name: "ORDER_SERIAL", type: "number" })
  order_serial: number;

  @Column({ name: "ORIGIN_COUNTRY", type: "varchar2", length: 5 })
  origin_country: string;

  @Column({ name: "BAL_PACK_QTY", type: "number", precision: 12, scale: 1 })
  bal_pack_qty: number;

  @Column({ name: "MULTI_SERIES", type: "char", length: 1 })
  multi_series: string;

  @Column({ name: "PROD_ATTRIB_CODE", type: "varchar2", length: 50 })
  prod_attrib_code: string;

  @Column({ name: "PROD_GRADE1", type: "varchar2", length: 20 })
  prod_grade1: string;

  @Column({ name: "PROD_GRADE2", type: "varchar2", length: 20 })
  prod_grade2: string;

  @Column({ name: "TX_IDENTITY_NUMBER", type: "varchar2", length: 30 })
  tx_identity_number: string;

  @Column({ name: "REF_TXN_CODE", type: "varchar2", length: 10 })
  ref_txn_code: string;

  @Column({ name: "REF_TXN_SLNO", type: "number" })
  ref_txn_slno: number;

  @Column({ name: "SO_TXN_CODE", type: "varchar2", length: 20 })
  so_txn_code: string;

  @Column({ name: "INBOUND_DONE", type: "char", length: 1 })
  inbound_done: string;

  @Column({ name: "REF_TXN_DOC", type: "varchar2", length: 20 })
  ref_txn_doc: string;

  @Column({ name: "SUPP_CODE", type: "varchar2", length: 10 })
  supp_code: string;

  @Column({ name: "SUPP_REFERENCE", type: "varchar2", length: 25 })
  supp_reference: string;

  @Column({ name: "ORIG_PROD_CODE", type: "varchar2", length: 40 })
  orig_prod_code: string;

  @Column({ name: "SALESMAN_CODE", type: "varchar2", length: 10 })
  salesman_code: string;

  @Column({ name: "HS_CODE", type: "varchar2", length: 20 })
  hs_code: string;

  @Column({ name: "BATCH_NO", type: "varchar2", length: 20 })
  batch_no: string;

  @Column({ name: "ACT_ORDER_QTY", type: "number", precision: 12, scale: 1 })
  act_order_qty: number;

  @Column({ name: "BAL_ORDER_QTY", type: "number", precision: 12, scale: 1 })
  bal_order_qty: number;

  @Column({ name: "MINPERIOD_EXPPICK", type: "number" })
  minperiod_exppick: number;

  @Column({ name: "IGNORE_MINEXP_PERIOD", type: "char", length: 1 })
  ignore_minexp_period: string;

  @Column({ name: "STOCK_OWNER", type: "varchar2", length: 10 })
  stock_owner: string;

  @Column({ name: "IND_CODE", type: "varchar2", length: 30 })
  ind_code: string;

  @Column({ name: "GIT_NO", type: "varchar2", length: 10 })
  git_no: string;

  @Column({ name: "QTY_STRING", type: "varchar2", length: 10 })
  qty_string: string;

  @Column({ name: "PRIORITY", type: "varchar2", length: 10 })
  priority: string;
}
