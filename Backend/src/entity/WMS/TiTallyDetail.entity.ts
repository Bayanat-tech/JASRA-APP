import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.TI_TALLY_DETAIL)
export class TiTallyDetail {
  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 5, nullable: true })
  company_code!: string;

  @Column({ name: "PRIN_CODE", type: "varchar2", length: 5, nullable: true })
  prin_code!: string;

  @Column({ name: "JOB_NO", type: "varchar2", length: 10, nullable: true })
  job_no!: string;

  @Column({ name: "CONTAINER_NO", type: "varchar2", length: 20, nullable: true })
  container_no!: string;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40, nullable: true })
  prod_code!: string;

  @Column({ name: "PROD_ATTRIB_CODE", type: "varchar2", length: 50, nullable: true })
  prod_attrib_code!: string;

  @Column({ name: "QUANTITY", type: "decimal", precision: 18, scale: 6, nullable: true })
  quantity!: number;

  @Column({ name: "PDA_QUANTITY", type: "decimal", precision: 18, scale: 6, nullable: true })
  pda_quantity!: number;

  @Column({ name: "LOCATION_CODE", type: "varchar2", length: 15, nullable: true })
  location_code!: string;

  @Column({ name: "BARCODE", type: "varchar2", length: 60, nullable: true })
  barcode!: string;

  @Column({ name: "SIZE_VALUE", type: "varchar2", length: 20, nullable: true })
  size_value!: string;

  @PrimaryColumn({ name: "SEQ_NUMBER", type: "number" })
  seq_number!: number;

  @Column({ name: "USER_ID", type: "varchar2", length: 20, nullable: true })
  user_id!: string;

  @Column({ name: "USER_DT", type: "date", nullable: true })
  user_dt!: Date;

  @Column({ name: "PACKDET_NO", type: "number", nullable: true })
  packdet_no!: number;

  @Column({ name: "CARTON_NO", type: "varchar2", length: 30, nullable: true })
  carton_no!: string;

  @Column({ name: "BATCH_NO", type: "varchar2", length: 20, nullable: true })
  batch_no!: string;

  @Column({ name: "PROD_EXP_DATE", type: "date", nullable: true })
  prod_exp_date!: Date;

  @Column({ name: "PALLET_ID", type: "varchar2", length: 20, nullable: true })
  pallet_id!: string;

  @Column({ name: "SELECTED", type: "varchar2", length: 1, nullable: true })
  selected!: string;

  @Column({ name: "ALLOCATED", type: "varchar2", length: 1, nullable: true })
  allocated!: string;

  @Column({ name: "PDA_QTY_PUOM", type: "number", nullable: true })
  pda_qty_puom!: number;

  @Column({ name: "PDA_PUOM", type: "varchar2", length: 5, nullable: true })
  pda_puom!: string;

  @Column({ name: "PDA_QTY_LUOM", type: "number", nullable: true })
  pda_qty_luom!: number;

  @Column({ name: "PDA_LUOM", type: "varchar2", length: 5, nullable: true })
  pda_luom!: string;

  @Column({ name: "LOT_NO", type: "varchar2", length: 40, nullable: true })
  lot_no!: string;

  @Column({ name: "PROD_MFG_DATE", type: "date", nullable: true })
  prod_mfg_date!: Date;

  @Column({ name: "SITE_IND", type: "varchar2", length: 5, nullable: true })
  site_ind!: string;

  @Column({ name: "TALLY_PROCESSED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  tally_processed!: string;

  @Column({ name: "PUTAWAY_PROCESSED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  putaway_processed!: string;

  @Column({ name: "TARGET_LOCATION", type: "varchar2", length: 15, nullable: true })
  target_location!: string;

  @Column({ name: "RECEIPT_TYPE", type: "varchar2", length: 2, nullable: true })
  receipt_type!: string;

  @Column({ name: "VESSEL_NAME", type: "varchar2", length: 20, nullable: true })
  vessel_name!: string;

  @Column({ name: "EXP_DATE", type: "date", nullable: true })
  exp_date!: Date;

  @Column({ name: "MGF_DATE", type: "date", nullable: true })
  mgf_date!: Date;

  @Column({ name: "MFG_DATE", type: "date", nullable: true })
  mfg_date!: Date;

  @Column({ name: "UPPP", type: "number", nullable: true })
  uppp!: number;

  @Column({ name: "ORIGIN_COUNTRY", type: "varchar2", length: 5, nullable: true })
  origin_country!: string;

  @Column({ name: "BATCH_ID", type: "varchar2", length: 40, nullable: true })
  batch_id!: string;

  @Column({ name: "CARTON_TALLY", type: "varchar2", length: 1, nullable: true })
  carton_tally!: string;

  @Column({ name: "PUTAWAY_PDA_PROCESSED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  putaway_pda_processed!: string;

  @Column({ name: "PROD_EXP_CHAR", type: "varchar2", length: 50, nullable: true })
  prod_exp_char!: string;

  @Column({ name: "PROD_MFG_CHAR", type: "varchar2", length: 50, nullable: true })
  prod_mfg_char!: string;

  @Column({ name: "PO_NO", type: "varchar2", length: 100, nullable: true })
  po_no!: string;

  @Column({ name: "SHELF_LIFE_DATE", type: "date", nullable: true })
  shelf_life_date!: Date;

  @Column({ name: "SHELF_LIFE_DAYS", type: "number", nullable: true })
  shelf_life_days!: number;

  @UpdateDateColumn({ name: "UPDATED_AT", nullable: true })
  updated_at!: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by!: string;

  @CreateDateColumn({ name: "CREATED_AT", nullable: true })
  created_at!: Date;

  @Column({ name: "GROSS_WEIGHT", type: "number", nullable: true })
  gross_weight!: number;

  @Column({ name: "VOLUME", type: "number", nullable: true })
  volume!: number;

  @Column({ name: "PROD_NAME", type: "varchar2", length: 50, nullable: true })
  prod_name!: string;

  @Column({ name: "TALLY_SINO", type: "number", nullable: true })
  tally_sino!: number;
}
