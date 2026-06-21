import { Entity, PrimaryColumn, Column, Index } from "typeorm";
import constants from "../../../../helpers/constants";

@Entity({ name: constants.VIEW.VW_WM_INB_TT_BATCH_DETS })
@Index("idx_unique_confirm_inbound", ["company_code", "prin_code", "job_no", "packdet_no"], { unique: true })
export class ConfirmInboundJob {

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code!: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no!: string;

  @PrimaryColumn({ name: "PACKDET_NO", type: "number" })
  packdet_no!: number;

  @Column({ name: "TXN_TYPE", type: "varchar2", length: 40 })
  txn_type!: string;

  @Column({ name: "TXN_DATE", type: "date" })
  txn_date!: Date;

  @Column({ name: "KEY_NUMBER", type: "varchar2", length: 40 })
  key_number!: string;

  @Column({ name: "SITE_CODE", type: "varchar2", length: 40 })
  site_code!: string;

  @Column({ name: "LOCATION_CODE", type: "varchar2", length: 15, nullable: true })
  location_code?: string;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40 })
  prod_code!: string;

  @Column({ name: "QTY_PUOM", type: "number", precision: 12, scale: 1 })
  qty_puom!: number;

  @Column({ name: "P_UOM", type: "varchar2", length: 5 })
  p_uom!: string;

  @Column({ name: "QTY_LUOM", type: "number", precision: 12, scale: 1 })
  qty_luom!: number;

  @Column({ name: "L_UOM", type: "varchar2", length: 5 })
  l_uom!: string;

  @Column({ name: "QUANTITY", type: "number", precision: 12, scale: 1 })
  quantity!: number;

  @Column({ name: "QTY_CONFIRMED", type: "varchar2", length: 20, nullable: true })
  qty_confirmed?: string;

  @Column({ name: "PQTY_CONFIRMED", type: "number", precision: 12, scale: 1 })
  pqty_confirmed!: number;

  @Column({ name: "LQTY_CONFIRMED", type: "number", precision: 12, scale: 1 })
  lqty_confirmed!: number;

  @Column({ name: "PUOM_CONFIRMED", type: "varchar2", length: 20, nullable: true })
  puom_confirmed?: string;

  @Column({ name: "LUOM_CONFIRMED", type: "varchar2", length: 20, nullable: true })
  luom_confirmed?: string;

  @Column({ name: "LOT_NO", type: "varchar2", length: 20, nullable: true })
  lot_no?: string;

  @Column({ name: "PO_NO", type: "varchar2", length: 20, nullable: true })
  po_no?: string;

  @Column({ name: "BL_NO", type: "varchar2", length: 20, nullable: true })
  bl_no?: string;

  @Column({ name: "MFG_DATE", type: "date" })
  mfg_date!: Date;

  @Column({ name: "EXP_DATE", type: "date" })
  exp_date!: Date;

  @Column({ name: "VESSEL_NAME", type: "varchar2", length: 20, nullable: true })
  vessel_name?: string;

  @Column({ name: "UPP", type: "varchar2", length: 20, nullable: true })
  upp?: string;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ name: "EX_RATE", type: "number", precision: 15, scale: 5, nullable: true })
  ex_rate?: number;

  @Column({ name: "DOC_REF", type: "varchar2", length: 20, nullable: true })
  doc_ref?: string;

  @Column({ name: "SELECTED", type: "varchar2", length: 1, nullable: true })
  selected?: string;

  @Column({ name: "RECEIPT_TYPE", type: "varchar2", length: 1, nullable: true })
  receipt_type?: string;

  @Column({ name: "ALLOCATED", type: "varchar2", length: 1, nullable: true })
  allocated?: string;

  @Column({ name: "PALLET_ID", type: "varchar2", length: 20, nullable: true })
  pallet_id?: string;

  @Column({ name: "PALLET_SERIAL_NO", type: "varchar2", length: 20, nullable: true })
  pallet_serial_no?: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true })
  user_id?: string;

  @Column({ name: "USER_DT", type: "date", nullable: true })
  user_dt?: Date;

  @Column({ name: "UPPP", type: "number", nullable: true })
  uppp?: number;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, nullable: true })
  confirmed?: string;

  @Column({ name: "UNIT_PRICE", type: "number", precision: 18, scale: 6, nullable: true })
  unit_price?: number;

  @Column({ name: "CONTAINER_SIZE", type: "number", nullable: true })
  container_size?: number;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20, nullable: true })
  cust_code?: string;

  @Column({ name: "MOC1", type: "varchar2", length: 2, nullable: true })
  moc1?: string;

  @Column({ name: "MOC2", type: "varchar2", length: 2, nullable: true })
  moc2?: string;

  @Column({ name: "PROD_NAME", type: "varchar2", length: 50, nullable: true })
  prod_name?: string;

  @Column({ name: "ORIGIN_COUNTRY", type: "varchar2", length: 15, nullable: true })
  origin_country?: string;

  @Column({ name: "SHELF_LIFE_DAYS", type: "number", nullable: true })
  shelf_life_days?: number;

  @Column({ name: "SHELF_LIFE_DATE", type: "date", nullable: true })
  shelf_life_date?: Date;

  @Column({ name: "PROD_ATTRIB_CODE", type: "varchar2", length: 50, nullable: true })
  prod_attrib_code?: string;

  @Column({ name: "PROD_GRADE2", type: "varchar2", length: 20, nullable: true })
  prod_grade2?: string;

  @Column({ name: "TX_IDENTITY_NUMBER", type: "varchar2", length: 30, nullable: true })
  tx_identity_number?: string;

  @Column({ name: "SUPP_CODE", type: "varchar2", length: 10, nullable: true })
  supp_code?: string;

  @Column({ name: "PACK_KEY", type: "varchar2", length: 20, nullable: true })
  pack_key?: string;

  @Column({ name: "ORDER_NO", type: "varchar2", length: 20, nullable: true })
  order_no?: string;

  @Column({ name: "SEAL_NO", type: "varchar2", length: 20, nullable: true })
  seal_no?: string;

  @Column({ name: "ORDER_SRNO", type: "varchar2", length: 20, nullable: true })
  order_srno?: string;

  @Column({ name: "CONTAINER_NO", type: "varchar2", length: 20, nullable: true })
  container_no?: string;

  @Column({ name: "CONFIRM_DATE", type: "date", nullable: true })
  confirm_date?: Date;

  @Column({ name: "MANU_CODE", type: "varchar2", length: 40, nullable: true })
  manu_code?: string;

  @Column({ name: "QTY_STRING", type: "varchar2", length: 40, nullable: true })
  qty_string?: string;

  @Column({ name: "QTY_CONFIRM_STRING", type: "varchar2", length: 40, nullable: true })
  qty_confirm_string?: string;

  @Column({ name: "IDENTITY_NUMBER", type: "number", nullable: true })
  identity_number?: number;
}
