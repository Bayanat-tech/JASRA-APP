import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "VW_TI_JOB" })
export class JobInboundWms {

  @PrimaryColumn({ type: "varchar2", length: 10 })
  company_code: string;

  @PrimaryColumn({ type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ type: "varchar2", length: 10 })
  job_no: string;

  @Column({ type: "date" })
  job_date: Date;

  @Column({ type: "varchar2", length: 3, nullable: true })
  job_type?: string;

  @Column({ type: "varchar2", length: 3, nullable: true })
  job_class?: string;

  @Column({ type: "varchar2", length: 3, nullable: true })
  dept_code?: string;

  @Column({ type: "char", length: 1, nullable: true })
  transport_mode?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  doc_ref?: string;

  @Column({ type: "varchar2", length: 8, nullable: true })
  port_code?: string;

  @Column({ type: "varchar2", length: 80, nullable: true })
  description1?: string;

  @Column({ type: "varchar2", length: 80, nullable: true })
  description2?: string;

  @Column({ type: "varchar2", length: 80, nullable: true })
  prin_ref1?: string;

  @Column({ type: "varchar2", length: 80, nullable: true })
  prin_ref2?: string;

  @Column({ type: "varchar2", length: 250, nullable: true })
  remarks?: string;

  @Column({ type: "date", nullable: true })
  eta?: Date;

  @Column({ type: "date", nullable: true })
  ata?: Date;

  @Column({ type: "date", nullable: true })
  etd?: Date;

  @Column({ type: "date", nullable: true })
  schedule_date?: Date;

  @Column({ type: "varchar2", length: 3, nullable: true })
  payment_terms?: string;

  @Column({ type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ type: "number", precision: 15, scale: 5, nullable: true })
  ex_rate?: number;

  @Column({ type: "float", nullable: true })
  insurance_value?: number;

  @Column({ type: "varchar2", length: 20, nullable: true })
  cust_code?: string;

  @Column({ type: "char", length: 1, nullable: true })
  container_flag?: string;

  @Column({ type: "char", length: 1, nullable: true })
  container?: string;

  @Column({ type: "char", length: 1, nullable: true })
  packdet?: string;

  @Column({ type: "char", length: 1, nullable: true })
  allocated?: string;

  @Column({ type: "char", length: 1, nullable: true })
  canceled?: string;

  @Column({ type: "char", length: 1, nullable: true })
  confirmed?: string;

  @Column({ type: "number", nullable: true })
  grn_no?: number;

  @Column({ type: "char", length: 1, nullable: true })
  invoiced?: string;

  @Column({ type: "char", length: 1, nullable: true })
  completed?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  exp_jobno?: string;

  @Column({ type: "char", length: 1, nullable: true })
  picked?: string;

  @Column({ type: "char", length: 1, nullable: true })
  ordered?: string;

  @Column({ type: "varchar2", length: 8, nullable: true })
  destination_port?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  vessel_name?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  voyage_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  payableat?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  place_receipt?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  place_delivery?: string;

  @Column({ type: "number", nullable: true })
  no_of_original_bl?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  broker_code?: string;

  @Column({ type: "varchar2", length: 15, nullable: true })
  quotation_ref?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  country_origin?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  country_destination?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  custom_recno?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  doc_ref2?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  hawb?: string;

  @Column({ type: "char", length: 1, nullable: true })
  reexport?: string;

  @Column({ type: "varchar2", length: 200, nullable: true })
  ref_jobno?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  combined_jobno?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  carrier?: string;

  @Column({ type: "char", length: 1, nullable: true })
  job_lock?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  courier_code?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  delivery_point?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  div_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  salesman_code?: string;

  @Column({ type: "varchar2", length: 60, nullable: true })
  transit_time?: string;

  @Column({ type: "varchar2", length: 250, nullable: true })
  delivery_remarks?: string;

  @Column({ type: "char", length: 1, nullable: true })
  cargo_received?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  delivered_by?: string;

  @Column({ type: "varchar2", length: 25, nullable: true })
  canceled_by?: string;

  @Column({ type: "varchar2", length: 250, nullable: true })
  cancel_remarks?: string;

  @Column({ type: "char", length: 1, nullable: true })
  send_mail?: string;

  @Column({ type: "char", length: 1, nullable: true })
  backlog_mail?: string;

  @Column({ type: "char", length: 1, nullable: true })
  dplan_flag?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  trans_batch_id?: string;

  @Column({ type: "char", length: 1, nullable: true })
  send_mail_dn?: string;

  @Column({ type: "char", length: 1, nullable: true })
  kpi_inc?: string;

  @Column({ type: "varchar2", length: 100, nullable: true })
  kpi_exc_remark?: string;

  @Column({ type: "varchar2", length: 200, nullable: true })
  job_category?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  edit_user?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  tx_cat_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  bcf_code?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  updated_by?: string;

  @Column({ type: "date", nullable: true })
  confirm_date?: Date;

  @Column({ type: "date", nullable: true })
  invoice_date?: Date;

}
