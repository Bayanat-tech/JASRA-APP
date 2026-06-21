import {
  Entity,
  Column,
  PrimaryColumn,
} from "typeorm";

@Entity({ name: "TI_CONTAINER" })
export class ShipmentDetailsInboundWms {
  // Composite primary key
  @PrimaryColumn({ type: "varchar2", length: 7 })
  company_code: string;

  @PrimaryColumn({ type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ type: "varchar2", length: 10 })
  job_no: string;

  @PrimaryColumn({ type: "varchar2", length: 20 })
  container_no: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  vessel_name?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  voyage_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  seal_no?: string;

  @Column({ type: "number", nullable: true })
  container_size?: number;

  @Column({ type: "varchar2", length: 40, nullable: true })
  container_type?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  bl_no?: string;

  @Column({ type: "char", length: 1, nullable: true })
  packdet_entered?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  user_id?: string;

  @Column({ type: "date", nullable: true })
  user_dt?: Date;

  @Column({ type: "varchar2", length: 3, nullable: true })
  moc1?: string;

  @Column({ type: "varchar2", length: 2, nullable: true })
  moc2?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  act_code?: string;

  @Column({ type: "char", length: 1, nullable: true })
  uoc?: string;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  volume?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  net_weight?: number;

  @Column({ type: "varchar2", length: 30, nullable: true })
  assigned_pda_user?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  po_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  sr_comp_code?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  sr_cust_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  supp_code?: string;

  @Column({ type: "varchar2", length: 30, nullable: true })
  assigned_tally_user?: string;

  @Column({ type: "date", nullable: true })
  unstuff_start?: Date;

  @Column({ type: "date", nullable: true })
  unstuff_end?: Date;

  @Column({ type: "date", nullable: true })
  tally_start_time?: Date;

  @Column({ type: "date", nullable: true })
  tally_end_time?: Date;

  @Column({ type: "date", nullable: true })
  putaway_start_time?: Date;

  @Column({ type: "date", nullable: true })
  putaway_end_time?: Date;

  @Column({ type: "varchar2", length: 20, nullable: true })
  old_container_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  old_vessel_name?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  old_voyage_no?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  sr_reason_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  promo_shift?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  hbl_no?: string;

  @Column({ type: "varchar2", length: 30, nullable: true })
  asn_no?: string;

  @Column({ type: "varchar2", length: 30, nullable: true })
  doc_ref_no?: string;

  @Column({ type: "varchar2", length: 30, nullable: true })
  cust_decl_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  truck_no?: string;
}
