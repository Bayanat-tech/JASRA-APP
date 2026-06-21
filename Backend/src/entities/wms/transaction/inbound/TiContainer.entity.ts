import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";

@Entity("TI_CONTAINER")
export class TiContainer {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar", length: 5 })
  company_code: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar", length: 5 })
  prin_code: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar", length: 10 })
  job_no: string;

  @PrimaryColumn({ name: "VESSEL_NAME", type: "varchar", length: 20 })
  vessel_name: string;

  @Column({ name: "VOYAGE_NO", type: "varchar", length: 20, nullable: true })
  voyage_no?: string;

  @PrimaryColumn({ name: "CONTAINER_NO", type: "varchar", length: 20 })
  container_no: string;

  @Column({ name: "SEAL_NO", type: "varchar", length: 20, nullable: true })
  seal_no?: string;

  @Column({ name: "CONTAINER_SIZE", type: "int", nullable: true })
  container_size?: number;

  @Column({ name: "CONTAINER_TYPE", type: "varchar", length: 40, nullable: true })
  container_type?: string;

  @Column({ name: "BL_NO", type: "varchar", length: 20, nullable: true })
  bl_no?: string;

  @Column({ name: "PACKDET_ENTERED", type: "varchar", length: 1, default: "N", nullable: true })
  packdet_entered?: string;

  @Column({ name: "USER_ID", type: "varchar", length: 10, nullable: true })
  user_id?: string;

  @CreateDateColumn({ name: "USER_DT", type: "timestamp", nullable: true })
  user_dt?: Date;

  @Column({ name: "MOC1", type: "varchar", length: 3, default: "0", nullable: true })
  moc1?: string;

  @Column({ name: "MOC2", type: "varchar", length: 2, default: "0", nullable: true })
  moc2?: string;

  @Column({ name: "ACT_CODE", type: "varchar", length: 5, nullable: true })
  act_code?: string;

  @Column({ name: "UOC", type: "varchar", length: 1, default: "0", nullable: true })
  uoc?: string;

  @Column({ name: "VOLUME", type: "decimal", precision: 18, scale: 6, nullable: true })
  volume?: number;

  @Column({ name: "NET_WEIGHT", type: "decimal", precision: 18, scale: 6, nullable: true })
  net_weight?: number;

  @Column({ name: "ASSIGNED_PDA_USER", type: "varchar", length: 30, nullable: true })
  assigned_pda_user?: string;

  @Column({ name: "PO_NO", type: "varchar", length: 20, nullable: true })
  po_no?: string;

  @Column({ name: "SR_COMP_CODE", type: "varchar", length: 20, nullable: true })
  sr_comp_code?: string;

  @Column({ name: "SR_CUST_CODE", type: "varchar", length: 20, nullable: true })
  sr_cust_code?: string;

  @Column({ name: "SUPP_CODE", type: "varchar", length: 10, nullable: true })
  supp_code?: string;

  @Column({ name: "ASSIGNED_TALLY_USER", type: "varchar", length: 30, nullable: true })
  assigned_tally_user?: string;

  @Column({ name: "UNSTUFF_START", type: "timestamp", nullable: true })
  unstuff_start?: Date;

  @Column({ name: "UNSTUFF_END", type: "timestamp", nullable: true })
  unstuff_end?: Date;

  @Column({ name: "TALLY_START_TIME", type: "timestamp", nullable: true })
  tally_start_time?: Date;

  @Column({ name: "TALLY_END_TIME", type: "timestamp", nullable: true })
  tally_end_time?: Date;

  @Column({ name: "PUTAWAY_START_TIME", type: "timestamp", nullable: true })
  putaway_start_time?: Date;

  @Column({ name: "PUTAWAY_END_TIME", type: "timestamp", nullable: true })
  putaway_end_time?: Date;

  @Column({ name: "OLD_CONTAINER_NO", type: "varchar", length: 20, nullable: true })
  old_container_no?: string;

  @Column({ name: "OLD_VESSEL_NAME", type: "varchar", length: 20, nullable: true })
  old_vessel_name?: string;

  @Column({ name: "OLD_VOYAGE_NO", type: "varchar", length: 20, nullable: true })
  old_voyage_no?: string;

  @Column({ name: "SR_REASON_CODE", type: "varchar", length: 10, nullable: true })
  sr_reason_code?: string;

  @Column({ name: "PROMO_SHIFT", type: "varchar", length: 10, nullable: true })
  promo_shift?: string;

  @Column({ name: "HBL_NO", type: "varchar", length: 20, nullable: true })
  hbl_no?: string;

  @Column({ name: "CONTN_TEMPTR", type: "varchar", length: 40, nullable: true })
  contn_temptr?: string;

  @Column({ name: "GOODS_TEMMTR", type: "varchar", length: 30, nullable: true })
  goods_temmtr?: string;

  @Column({ name: "DRIVER_NAME", type: "varchar", length: 50, nullable: true })
  driver_name?: string;

  @Column({ name: "DRIVER_ID", type: "varchar", length: 50, nullable: true })
  driver_id?: string;

  @Column({ name: "VEHICLE_NO", type: "varchar", length: 30, nullable: true })
  vehicle_no?: string;
}
