import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import constants from "../../../../helpers/constants";
import { Product } from '../../Product.entity';

@Entity(constants.TABLE.TI_PACKDET)
export class PackingDetailsInboundWms {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no: string;

  @PrimaryColumn({ name: "PACKDET_NO", type: "integer" })
  packdet_no: number;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40 })
  prod_code: string;

  @Column({ name: "QTY_PUOM", type: "number", precision: 12, scale: 1, nullable: true })
  qty_puom: number;

  @Column({ name: "P_UOM", type: "varchar2", length: 5, nullable: true })
  p_uom: string;

  @Column({ name: "QTY_LUOM", type: "number", precision: 12, scale: 1, nullable: true })
  qty_luom: number;

  @Column({ name: "L_UOM", type: "varchar2", length: 5, nullable: true })
  l_uom: string;

  @Column({ name: "QUANTITY", type: "number", precision: 12, scale: 1, nullable: true })
  quantity: number;

  @Column({ name: "LOT_NO", type: "varchar2", length: 20, nullable: true })
  lot_no: string;

  @Column({ name: "PO_NO", type: "varchar2", length: 20, nullable: true })
  po_no: string;

  @Column({ name: "BL_NO", type: "varchar2", length: 20, nullable: true })
  bl_no: string;

  @Column({ name: "MFG_DATE", type: "date", nullable: true })
  mfg_date: Date;

  @Column({ name: "EXP_DATE", type: "date", nullable: true })
  exp_date: Date;

  @Column({ name: "VESSEL_NAME", type: "varchar2", length: 20, nullable: true })
  vessel_name: string;

  @Column({ name: "VOYAGE_NO", type: "varchar2", length: 20, nullable: true })
  voyage_no: string;

  @Column({ name: "CONTAINER_NO", type: "varchar2", length: 20, nullable: true })
  container_no: string;

  @Column({ name: "INVOICE_VALUE", type: "float", precision: 63, nullable: true })
  invoice_value: number;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code: string;

  @Column({ name: "EX_RATE", type: "number", precision: 15, scale: 5, nullable: true })
  ex_rate: number;

  @Column({ name: "DOC_REF", type: "varchar2", length: 20, nullable: true })
  doc_ref: string;

  @Column({ name: "MANU_CODE", type: "varchar2", length: 10, nullable: true })
  manu_code: string;

  @Column({ name: "FROM_SITE", type: "varchar2", length: 5, nullable: true })
  from_site: string;

  @Column({ name: "TO_SITE", type: "varchar2", length: 5, nullable: true })
  to_site: string;

  @Column({ name: "FROM_AISLE", type: "varchar2", length: 5, nullable: true })
  from_aisle: string;

  @Column({ name: "TO_AISLE", type: "varchar2", length: 5, nullable: true })
  to_aisle: string;

  @Column({ name: "FROM_COLUMN", type: "integer", nullable: true })
  from_column: number;

  @Column({ name: "TO_COLUMN", type: "integer", nullable: true })
  to_column: number;

  @Column({ name: "FROM_HEIGHT", type: "integer", nullable: true })
  from_height: number;

  @Column({ name: "TO_HEIGHT", type: "integer", nullable: true })
  to_height: number;

  @Column({ name: "SELECTED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  selected: string;

  @Column({ name: "RECEIPT_TYPE", type: "varchar2", length: 1, nullable: true })
  receipt_type: string;

  @Column({ name: "ALLOCATED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  allocated: string;

  @Column({ name: "PALLET_ID", type: "varchar2", length: 20, nullable: true })
  pallet_id: string;

  @Column({ name: "PALLET_SERIAL_NO", type: "varchar2", length: 20, nullable: true })
  pallet_serial_no: string;

  @Column({ name: "MIXED_PUTAWAY", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  mixed_putaway: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true })
  user_id: string;

  @Column({ name: "USER_DT", type: "date", nullable: true })
  user_dt: Date;

  @Column({ name: "LOCATION_FROM", type: "varchar2", length: 15, nullable: true })
  location_from: string;

  @Column({ name: "LOCATION_TO", type: "varchar2", length: 15, nullable: true })
  location_to: string;

  @Column({ name: "UPPP", type: "integer", nullable: true })
  uppp: number;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  confirmed: string;

  @Column({ name: "UNIT_PRICE", type: "number", precision: 18, scale: 6, nullable: true })
  unit_price: number;

  @Column({ name: "APPORTIONATE_VALUE", type: "number", precision: 18, scale: 6, nullable: true })
  apportionate_value: number;

  @Column({ name: "MULTI_SERIES", type: "varchar2", length: 1, nullable: true })
  multi_series: string;

  @Column({ name: "CLEARANCE", type: "varchar2", length: 1, nullable: true })
  clearance: string;

  @Column({ name: "CLEARED_DATE", type: "date", nullable: true })
  cleared_date: Date;

  @Column({ name: "CLEARED_USER", type: "varchar2", length: 10, nullable: true })
  cleared_user: string;

  @Column({ name: "REJECT_REASON", type: "varchar2", length: 200, nullable: true })
  reject_reason: string;

  @Column({ name: "CONTAINER_SIZE", type: "integer", nullable: true })
  container_size: number;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20, nullable: true })
  cust_code: string;

  @Column({ name: "MOC1", type: "varchar2", length: 2, nullable: true })
  moc1: string;

  @Column({ name: "MOC2", type: "varchar2", length: 2, nullable: true })
  moc2: string;

  @Column({ name: "SIMULATE_FLAG", type: "char", length: 1, nullable: true })
  simulate_flag: string;

  @Column({ name: "LENGTH", type: "float", precision: 22, nullable: true })
  length: number;

  @Column({ name: "BREADTH", type: "float", precision: 22, nullable: true })
  breadth: number;

  @Column({ name: "HEIGHT", type: "float", precision: 22, nullable: true })
  height: number;

  @Column({ name: "GROSS_WEIGHT", type: "float", precision: 22, nullable: true })
  gross_weight: number;

  @Column({ name: "NEW_PRODUCT", type: "varchar2", length: 40, nullable: true })
  new_product: string;

  @Column({ name: "PROD_NAME", type: "varchar2", length: 50, nullable: true })
  prod_name: string;

  @Column({ name: "VOLUME", type: "float", precision: 22, nullable: true })
  volume: number;

  @Column({ name: "NEW_WEIGHT", type: "float", precision: 22, nullable: true })
  new_weight: number;

  @Column({ name: "ORIGIN_COUNTRY", type: "varchar2", length: 15, nullable: true })
  origin_country: string;

  @Column({ name: "SHELF_LIFE_DAYS", type: "integer", nullable: true })
  shelf_life_days: number;

  @Column({ name: "SHELF_LIFE_DATE", type: "date", nullable: true })
  shelf_life_date: Date;

  @Column({ name: "PDA_QTY1", type: "number", precision: 12, scale: 1, nullable: true, default: () => "0" })
  pda_qty1: number;

  @Column({ name: "PDA_QTY2", type: "number", precision: 12, scale: 1, nullable: true, default: () => "0" })
  pda_qty2: number;

  @Column({ name: "PDA_QUANTITY", type: "number", precision: 12, scale: 1, nullable: true, default: () => "0" })
  pda_quantity: number;

  @Column({ name: "QTY1_ARRIVED", type: "number", precision: 12, scale: 1, nullable: true, default: () => "0" })
  qty1_arrived: number;

  @Column({ name: "QTY2_ARRIVED", type: "number", precision: 12, scale: 1, nullable: true, default: () => "0" })
  qty2_arrived: number;

  @Column({ name: "QUANTITY_ARRIVED", type: "number", precision: 12, scale: 1, nullable: true, default: () => "0" })
  quantity_arrived: number;

  @Column({ name: "PROD_ATTRIB_CODE", type: "varchar2", length: 50, nullable: true })
  prod_attrib_code: string;

  @Column({ name: "PROD_GRADE1", type: "varchar2", length: 20, nullable: true })
  prod_grade1: string;

  @Column({ name: "PROD_GRADE2", type: "varchar2", length: 20, nullable: true })
  prod_grade2: string;

  @Column({ name: "TX_IDENTITY_NUMBER", type: "varchar2", length: 30, nullable: true })
  tx_identity_number: string;

  @Column({ name: "NET_WEIGHT", type: "float", precision: 22, nullable: true })
  net_weight: number;

  @Column({ name: "SUPP_CODE", type: "varchar2", length: 10, nullable: true })
  supp_code: string;

  @Column({ name: "ASSIGNED_PUTAWAY_USER", type: "varchar2", length: 10, nullable: true })
  assigned_putaway_user: string;

  @Column({ name: "ASSIGNED_TALLY_USER", type: "varchar2", length: 10, nullable: true })
  assigned_tally_user: string;

  @Column({ name: "PRV_LOCATION_CODE", type: "varchar2", length: 15, nullable: true })
  prv_location_code: string;

  @Column({ name: "TALLY_DT", type: "date", nullable: true })
  tally_dt: Date;

  @Column({ name: "BE_DOC_NO", type: "varchar2", length: 20, nullable: true })
  be_doc_no: string;

  @Column({ name: "MASTER_CTN", type: "number", precision: 18, nullable: true })
  master_ctn: number;

  @Column({ name: "LOOSE_CTN", type: "number", precision: 18, nullable: true })
  loose_ctn: number;

  @Column({ name: "NET_PRICE", type: "number", precision: 18, scale: 4, nullable: true })
  net_price: number;

  @Column({ name: "SUPP_EX_RATE", type: "number", precision: 18, scale: 6, nullable: true })
  supp_ex_rate: number;

  @Column({ name: "LOCAL_CHARGES_VALUE", type: "number", precision: 18, scale: 6, nullable: true })
  local_charges_value: number;

  @Column({ name: "PO_EX_RATE", type: "number", precision: 18, scale: 6, nullable: true })
  po_ex_rate: number;

  @Column({ name: "LC_PO_VALUE", type: "number", precision: 18, scale: 6, nullable: true })
  lc_po_value: number;

  @Column({ name: "PO_CURR_CODE", type: "varchar2", length: 10, nullable: true })
  po_curr_code: string;

  @Column({ name: "PO_VALUE", type: "number", precision: 18, scale: 6, nullable: true })
  po_value: number;

  @Column({ name: "NET_VOLUME", type: "number", precision: 18, scale: 6, nullable: true })
  net_volume: number;

  @Column({ name: "HS_CODE", type: "varchar2", length: 20, nullable: true })
  hs_code: string;

  @Column({ name: "GROSS_WT", type: "number", precision: 18, scale: 6, nullable: true })
  gross_wt: number;

  @Column({ name: "CONFIRM_USER", type: "varchar2", length: 20, nullable: true })
  confirm_user: string;

  @Column({ name: "CONFIRM_DT", type: "date", nullable: true })
  confirm_dt: Date;

  @Column({ name: "BATCH_NO", type: "varchar2", length: 20, nullable: true })
  batch_no: string;

  @Column({ name: "SERIALIZE", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  serialize: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'PRIN_CODE', referencedColumnName: 'prin_code' })
  product: Product;
}
