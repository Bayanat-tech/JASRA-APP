import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
} from "typeorm";

@Entity({ name: "TI_TALLY_DETAIL" })
@Index(["company_code", "prin_code", "job_no", "packdet_no"], { unique: true })
export class TallyDetailsInboundWms {
  @PrimaryColumn({ type: "varchar2", length: 7 })
  company_code: string;

  @PrimaryColumn({ type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ type: "varchar2", length: 10 })
  job_no: string;

  @PrimaryColumn({ type: "number" })
  packdet_no: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  container_no?: string;

  @Column({ type: "varchar2", length: 40, nullable: true })
  prod_code?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  prod_attrib_code?: string;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  quantity?: number;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true })
  pda_quantity?: number;

  @Column({ type: "varchar2", length: 15, nullable: true })
  location_code?: string;

  @Column({ type: "varchar2", length: 60, nullable: true })
  barcode?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  size_value?: string;

  @Column({ type: "number", nullable: true })
  seq_number?: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  user_id?: string;

  @Column({ type: "date", nullable: true })
  user_dt?: Date;

  @Column({ type: "varchar2", length: 30, nullable: true })
  carton_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  batch_no?: string;

  @Column({ type: "date", nullable: true })
  prod_exp_date?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true })
  pallet_id?: string;

  @Column({ type: "char", length: 1, nullable: true })
  selected?: string;

  @Column({ type: "char", length: 1, nullable: true })
  allocated?: string;

  @Column({ type: "number", precision: 12, scale: 0, nullable: true })
  pda_qty_puom?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  pda_puom?: string;

  @Column({ type: "number", precision: 12, scale: 0, nullable: true })
  pda_qty_luom?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  pda_luom?: string;

  @Column({ type: "varchar2", length: 40, nullable: true })
  lot_no?: string;

  @Column({ type: "date", nullable: true })
  prod_mfg_date?: Date;

  @Column({ type: "varchar2", length: 5, nullable: true })
  site_ind?: string;

  @Column({ type: "char", length: 1, default: () => "'N'", nullable: true })
  tally_processed?: string;

  @Column({ type: "char", length: 1, default: () => "'N'", nullable: true })
  putaway_processed?: string;

  @Column({ type: "varchar2", length: 15, nullable: true })
  target_location?: string;

  @Column({ type: "varchar2", length: 2, nullable: true })
  receipt_type?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  vessel_name?: string;

  @Column({ type: "date", nullable: true })
  exp_date?: Date;

  @Column({ type: "date", nullable: true })
  mfg_date?: Date;

  @Column({ type: "number", precision: 18, scale: 0, nullable: true })
  uppp?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  origin_country?: string;

  @Column({ type: "varchar2", length: 40, nullable: true })
  batch_id?: string;

  @Column({ type: "char", length: 1, nullable: true })
  carton_tally?: string;

  @Column({ type: "char", length: 1, default: () => "'N'", nullable: true })
  putaway_pda_processed?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  prod_exp_char?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  prod_mfg_char?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  po_no?: string;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  gross_weight?: number;

  @Column({ type: "number", precision: 22, scale: 0, nullable: true })
  volume?: number;

  @Column({ type: "number", nullable: true })
  shelf_life_days?: number;

  @Column({ type: "date", nullable: true })
  shelf_life_date?: Date;

  @Column({ type: "varchar2", length: 50, nullable: true })
  prod_name?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  updated_by?: string;
}
