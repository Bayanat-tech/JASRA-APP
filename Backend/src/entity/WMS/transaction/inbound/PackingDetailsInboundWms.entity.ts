import {
  Entity,
  Column,
  PrimaryColumn,
} from "typeorm";

@Entity({ name: "TI_PACKDET" })
export class PackingDetailsInboundWms {
  // Composite primary key
  @PrimaryColumn({ type: "varchar2", length: 7 })
  company_code: string;

  @PrimaryColumn({ type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ type: "varchar2", length: 10 })
  job_no: string;

  @PrimaryColumn({ type: "number", name: "PACKDET_NO" })
  packdet_no: number;

  // Required columns
  @Column({ type: "varchar2", length: 40 })
  prod_code: string;

  @Column({ type: "number", precision: 12, scale: 1 })
  qty_puom: number;

  @Column({ type: "varchar2", length: 5 })
  p_uom: string;

  @Column({ type: "number", precision: 12, scale: 1 })
  qty_luom: number;

  @Column({ type: "varchar2", length: 5 })
  l_uom: string;

  @Column({ type: "number", precision: 12, scale: 1 })
  quantity: number;

  @Column({ type: "date" })
  mfg_date: Date;

  @Column({ type: "date" })
  exp_date: Date;

  // Optional columns
  @Column({ type: "varchar2", length: 20, nullable: true })
  lot_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  po_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  bl_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  vessel_name?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  voyage_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  container_no?: string;

  @Column({ type: "number", precision: 18, scale: 2, nullable: true })
  invoice_value?: number;

  @Column({ type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ type: "number", precision: 15, scale: 5, nullable: true })
  ex_rate?: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  doc_ref?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  manu_code?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  from_site?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  to_site?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  from_aisle?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  to_aisle?: string;

  @Column({ type: "number", nullable: true })
  from_column?: number;

  @Column({ type: "number", nullable: true })
  to_column?: number;

  @Column({ type: "number", nullable: true })
  from_height?: number;

  @Column({ type: "number", nullable: true })
  to_height?: number;

  @Column({ type: "varchar2", length: 1, nullable: true })
  selected?: string;

  @Column({ type: "varchar2", length: 1, nullable: true })
  receipt_type?: string;

  @Column({ type: "varchar2", length: 1, nullable: true })
  allocated?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  pallet_id?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  pallet_serial_no?: string;

  @Column({ type: "varchar2", length: 1, nullable: true })
  mixed_putaway?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  user_id?: string;

  @Column({ type: "date", nullable: true })
  user_dt?: Date;

  @Column({ type: "varchar2", length: 15, nullable: true })
  location_from?: string;

  @Column({ type: "varchar2", length: 15, nullable: true })
  location_to?: string;

  @Column({ type: "number", nullable: true })
  uppp?: number;

  @Column({ type: "varchar2", length: 1, nullable: true })
  confirmed?: string;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  unit_price?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  apportionate_value?: number;

  @Column({ type: "varchar2", length: 1, nullable: true })
  multi_series?: string;

  @Column({ type: "varchar2", length: 1, nullable: true })
  clearance?: string;

  @Column({ type: "date", nullable: true })
  cleared_date?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true })
  cleared_user?: string;

  @Column({ type: "varchar2", length: 200, nullable: true })
  reject_reason?: string;

  @Column({ type: "number", nullable: true })
  container_size?: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  cust_code?: string;

  @Column({ type: "varchar2", length: 2, nullable: true })
  moc1?: string;

  @Column({ type: "varchar2", length: 2, nullable: true })
  moc2?: string;

  @Column({ type: "char", length: 1, nullable: true })
  simulate_flag?: string;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  length?: number;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  breadth?: number;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  height?: number;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  gross_weight?: number;

  @Column({ type: "varchar2", length: 40, nullable: true })
  new_product?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  prod_name?: string;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  volume?: number;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  new_weight?: number;

  @Column({ type: "varchar2", length: 15, nullable: true })
  origin_country?: string;

  @Column({ type: "number", nullable: true })
  shelf_life_days?: number;

  @Column({ type: "date", nullable: true })
  shelf_life_date?: Date;

  @Column({ type: "number", precision: 12, scale: 1, nullable: true })
  pda_qty1?: number;

  @Column({ type: "number", precision: 12, scale: 1, nullable: true })
  pda_qty2?: number;

  @Column({ type: "number", precision: 12, scale: 1, nullable: true })
  pda_quantity?: number;

  @Column({ type: "number", precision: 12, scale: 1, nullable: true })
  qty1_arrived?: number;

  @Column({ type: "number", precision: 12, scale: 1, nullable: true })
  qty2_arrived?: number;

  @Column({ type: "number", precision: 12, scale: 1, nullable: true })
  quantity_arrived?: number;

  @Column({ type: "varchar2", length: 50, nullable: true })
  prod_attrib_code?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  prod_grade1?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  prod_grade2?: string;

  @Column({ type: "varchar2", length: 30, nullable: true })
  tx_identity_number?: string;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  net_weight?: number;

  @Column({ type: "varchar2", length: 10, nullable: true })
  supp_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  assigned_putaway_user?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  assigned_tally_user?: string;

  @Column({ type: "varchar2", length: 15, nullable: true })
  prv_location_code?: string;

  @Column({ type: "date", nullable: true })
  tally_dt?: Date;

  @Column({ type: "varchar2", length: 20, nullable: true })
  be_doc_no?: string;

  @Column({ type: "number", precision: 18, scale: 0, nullable: true })
  master_ctn?: number;

  @Column({ type: "number", precision: 18, scale: 0, nullable: true })
  loose_ctn?: number;

  @Column({ type: "number", precision: 18, scale: 4, nullable: true })
  net_price?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  supp_ex_rate?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  local_charges_value?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  po_ex_rate?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  lc_po_value?: number;

  @Column({ type: "varchar2", length: 10, nullable: true })
  po_curr_code?: string;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  po_value?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  net_volume?: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  hs_code?: string;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  gross_wt?: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  confirm_user?: string;

  @Column({ type: "date", nullable: true })
  confirm_dt?: Date;

  @Column({ type: "varchar2", length: 20, nullable: true })
  batch_no?: string;
}
