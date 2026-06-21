import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_LOCATION)
export class LocationMaster {

  @PrimaryColumn({ name: "LOCATION_CODE", type: "varchar2", length: 15 })
  location_code!: string;

   @Column({ name: "SITE_CODE", type: "varchar2", length: 5 })
  site_code!: string;

  @Column({ name: "LOC_DESC", type: "varchar2", length: 40, nullable: true })
  loc_desc?: string;

  @Column({ name: "LOC_TYPE", type: "varchar2", length: 3, nullable: true })
  loc_type?: string;

  @Column({ name: "LOC_STAT", type: "varchar2", length: 3, nullable: true })
  loc_stat?: string;

  @Column({ name: "AISLE", type: "varchar2", length: 5 })
  aisle!: string;

  @Column({ name: "COLUMN_NO", type: "number" })
  column_no!: number;

  @Column({ name: "HEIGHT", type: "number" })
  height!: number;

  @Column({ name: "JOB_NO", type: "varchar2", length: 15, nullable: true })
  job_no?: string;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40, nullable: true })
  prod_code?: string;

  @Column({ name: "PRIN_CODE", type: "varchar2", length: 5, nullable: true })
  prin_code?: string;

  @Column({ name: "STK_STAT", type: "varchar2", length: 2, nullable: true })
  stk_stat?: string;

  @Column({ name: "PREF_PRIN", type: "varchar2", length: 5, nullable: true })
  pref_prin?: string;

  @Column({ name: "PREF_PROD", type: "varchar2", length: 40, nullable: true })
  pref_prod?: string;

  @Column({ name: "PREF_GROUP", type: "varchar2", length: 15, nullable: true })
  pref_group?: string;

  @Column({ name: "PREF_BRAND", type: "varchar2", length: 15, nullable: true })
  pref_brand?: string;

  @Column({ name: "PUT_SEQNO", type: "number", nullable: true })
  put_seqno?: number;

  @Column({ name: "PICK_SEQNO", type: "number", nullable: true })
  pick_seqno?: number;

  @Column({ name: "PUSH_LEVEL", type: "varchar2", length: 3, nullable: true })
  push_level?: string;

  @Column({ name: "MAX_QTY", type: "number", precision: 12, scale: 1, nullable: true })
  max_qty?: number;

  @Column({ name: "UOM", type: "varchar2", length: 5, nullable: true })
  uom?: string;

  @Column({ name: "REORDER_QTY", type: "number", precision: 12, scale: 1, nullable: true })
  reorder_qty?: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;

  @Column({ name: "BARCODE", type: "varchar2", length: 30, nullable: true })
  barcode?: string;

  @Column({ name: "PROD_TYPE", type: "number", nullable: true })
  prod_type?: number;

  @Column({ name: "DEPTH", type: "number", nullable: true })
  depth?: number;

  @Column({ name: "CHECK_DIGIT", type: "varchar2", length: 2, nullable: true })
  check_digit?: string;

  @Column({ name: "ASSIGNED_PRIN_CODE", type: "varchar2", length: 5, nullable: true })
  assigned_prin_code?: string;

  @Column({ name: "ASSIGNED_PRODGROUP", type: "varchar2", length: 20, nullable: true })
  assigned_prodgroup?: string;

  @Column({ name: "ASSIGNED_USERID", type: "varchar2", length: 10, nullable: true })
  assigned_userid?: string;

  @Column({ name: "LOCATION_CODE_002", type: "varchar2", length: 20, nullable: true })
  location_code_002?: string;

  @Column({ name: "VOLUME_CBM", type: "number", precision: 18, scale: 4, nullable: true })
  volume_cbm?: number;

  @Column({ name: "HEIGHT_CM", type: "number", precision: 18, scale: 4, nullable: true })
  height_cm?: number;

  @Column({ name: "BREADTH_CM", type: "number", precision: 18, scale: 4, nullable: true })
  breadth_cm?: number;

  @Column({ name: "LENGTH_CM", type: "number", precision: 18, scale: 4, nullable: true })
  length_cm?: number;

  @Column({ name: "BLOCKCYC", type: "char", length: 1, default: () => "'N'" })
  blockcyc!: string;

  @Column({ name: "TROLLEY_NO", type: "varchar2", length: 15, nullable: true })
  trolley_no?: string;

  @Column({ name: "BONDED_AREA_CODE", type: "varchar2", length: 50, nullable: true })
  bonded_area_code?: string;

  @Column({ name: "LOCATION_RESERVED_FOR", type: "varchar2", length: 30, nullable: true })
  location_reserved_for?: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @CreateDateColumn({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;

  @Column({ name: "USER_ID", type: "varchar2", length: 45, nullable: true })
  user_id?: string;

  @Column({ name: "USER_DT", type: "date", nullable: true })
  user_dt?: Date;
}
