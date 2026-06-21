import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "TI_JOB" })
export class JobInboundWms {

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 10 })
  company_code: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no: string;

  @Column({ name: "JOB_DATE", type: "date" })
  job_date: Date;

  @Column({ name: "JOB_TYPE", type: "varchar2", length: 3, nullable: true })
  job_type?: string;

  @Column({ name: "JOB_CLASS", type: "varchar2", length: 3, nullable: true })
  job_class?: string;

  @Column({ name: "DEPT_CODE", type: "varchar2", length: 3, nullable: true })
  dept_code?: string;

  @Column({ name: "TRANSPORT_MODE", type: "varchar2", length: 1, nullable: true })
  transport_mode?: string;

  @Column({ name: "DOC_REF", type: "varchar2", length: 20, nullable: true })
  doc_ref?: string;

  @Column({ name: "PORT_CODE", type: "varchar2", length: 8, nullable: true })
  port_code?: string;

  @Column({ name: "DESCRIPTION1", type: "varchar2", length: 80, nullable: true })
  description1?: string;

  @Column({ name: "DESCRIPTION2", type: "varchar2", length: 80, nullable: true })
  description2?: string;

  @Column({ name: "PRIN_REF1", type: "varchar2", length: 80, nullable: true })
  prin_ref1?: string;

  @Column({ name: "PRIN_REF2", type: "varchar2", length: 80, nullable: true })
  prin_ref2?: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 250, nullable: true })
  remarks?: string;

  @Column({ name: "ETA", type: "date", nullable: true })
  eta?: Date;

  @Column({ name: "ATA", type: "date", nullable: true })
  ata?: Date;

  @Column({ name: "ETD", type: "date", nullable: true })
  etd?: Date;

  @Column({ name: "SCHEDULE_DATE", type: "date", nullable: true })
  schedule_date?: Date;

  @Column({ name: "PAYMENT_TERMS", type: "varchar2", length: 3, nullable: true })
  payment_terms?: string;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ name: "EX_RATE", type: "number", precision: 15, scale: 5, nullable: true })
  ex_rate?: number;

  @Column({ name: "INSURANCE_VALUE", type: "number", nullable: true })
  insurance_value?: number;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20, nullable: true })
  cust_code?: string;

  @Column({ name: "CONTAINER_FLAG", type: "varchar2", length: 1, nullable: true })
  container_flag?: string;

  @Column({ name: "CONTAINER", type: "varchar2", length: 1, nullable: true })
  container?: string;

  @Column({ name: "PACKDET", type: "varchar2", length: 1, nullable: true })
  packdet?: string;

  @Column({ name: "ALLOCATED", type: "varchar2", length: 1, nullable: true })
  allocated?: string;

  @Column({ name: "CANCELED", type: "varchar2", length: 1, nullable: true })
  canceled?: string;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, nullable: true })
  confirmed?: string;

  @Column({ name: "GRN_NO", type: "number", nullable: true })
  grn_no?: number;

  @Column({ name: "INVOICED", type: "varchar2", length: 1, nullable: true })
  invoiced?: string;

  @Column({ name: "COMPLETED", type: "varchar2", length: 1, nullable: true })
  completed?: string;

  @Column({ name: "EXP_JOBNO", type: "varchar2", length: 10, nullable: true })
  exp_jobno?: string;

  @Column({ name: "PICKED", type: "varchar2", length: 1, nullable: true })
  picked?: string;

  @Column({ name: "ORDERED", type: "varchar2", length: 1, nullable: true })
  ordered?: string;

  @Column({ name: "DESTINATION_PORT", type: "varchar2", length: 8, nullable: true })
  destination_port?: string;

  @Column({ name: "VESSEL_NAME", type: "varchar2", length: 50, nullable: true })
  vessel_name?: string;

  @Column({ name: "VOYAGE_NO", type: "varchar2", length: 20, nullable: true })
  voyage_no?: string;

  @Column({ name: "PAYABLEAT", type: "varchar2", length: 20, nullable: true })
  payableat?: string;

  @Column({ name: "PLACE_RECEIPT", type: "varchar2", length: 50, nullable: true })
  place_receipt?: string;

  @Column({ name: "PLACE_DELIVERY", type: "varchar2", length: 50, nullable: true })
  place_delivery?: string;

  @Column({ name: "NO_OF_ORIGINAL_BL", type: "number", nullable: true })
  no_of_original_bl?: number;

  @Column({ name: "BROKER_CODE", type: "varchar2", length: 5, nullable: true })
  broker_code?: string;

  @Column({ name: "QUOTATION_REF", type: "varchar2", length: 15, nullable: true })
  quotation_ref?: string;

  @Column({ name: "COUNTRY_ORIGIN", type: "varchar2", length: 50, nullable: true })
  country_origin?: string;

  @Column({ name: "COUNTRY_DESTINATION", type: "varchar2", length: 50, nullable: true })
  country_destination?: string;

  @Column({ name: "CUSTOM_RECNO", type: "varchar2", length: 20, nullable: true })
  custom_recno?: string;

  @Column({ name: "DOC_REF2", type: "varchar2", length: 20, nullable: true })
  doc_ref2?: string;

  @Column({ name: "HAWB", type: "varchar2", length: 20, nullable: true })
  hawb?: string;

  @Column({ name: "REEXPORT", type: "varchar2", length: 1, nullable: true })
  reexport?: string;

  @Column({ name: "REF_JOBNO", type: "varchar2", length: 200, nullable: true })
  ref_jobno?: string;

  @Column({ name: "COMBINED_JOBNO", type: "varchar2", length: 10, nullable: true })
  combined_jobno?: string;

  @Column({ name: "CARRIER", type: "varchar2", length: 5, nullable: true })
  carrier?: string;

  @Column({ name: "JOB_LOCK", type: "varchar2", length: 1, nullable: true })
  job_lock?: string;

  @Column({ name: "COURIER_CODE", type: "varchar2", length: 20, nullable: true })
  courier_code?: string;

  @Column({ name: "DELIVERY_POINT", type: "varchar2", length: 20, nullable: true })
  delivery_point?: string;

  @Column({ name: "DIV_CODE", type: "varchar2", length: 5, nullable: true })
  div_code?: string;

  @Column({ name: "SALESMAN_CODE", type: "varchar2", length: 10, nullable: true })
  salesman_code?: string;

  @Column({ name: "TRANSIT_TIME", type: "varchar2", length: 60, nullable: true })
  transit_time?: string;

  @Column({ name: "DELIVERY_REMARKS", type: "varchar2", length: 250, nullable: true })
  delivery_remarks?: string;

  @Column({ name: "CARGO_RECEIVED", type: "varchar2", length: 1, nullable: true })
  cargo_received?: string;

  @Column({ name: "DELIVERED_BY", type: "varchar2", length: 50, nullable: true })
  delivered_by?: string;

  @Column({ name: "CANCELED_BY", type: "varchar2", length: 25, nullable: true })
  canceled_by?: string;

  @Column({ name: "CANCEL_REMARKS", type: "varchar2", length: 250, nullable: true })
  cancel_remarks?: string;

  @Column({ name: "SEND_MAIL", type: "varchar2", length: 1, nullable: true })
  send_mail?: string;

  @Column({ name: "BACKLOG_MAIL", type: "varchar2", length: 1, nullable: true })
  backlog_mail?: string;

  @Column({ name: "DPLAN_FLAG", type: "varchar2", length: 1, nullable: true })
  dplan_flag?: string;

  @Column({ name: "TRANS_BATCH_ID", type: "varchar2", length: 20, nullable: true })
  trans_batch_id?: string;

  @Column({ name: "SEND_MAIL_DN", type: "varchar2", length: 1, nullable: true })
  send_mail_dn?: string;

  @Column({ name: "KPI_INC", type: "varchar2", length: 1, nullable: true })
  kpi_inc?: string;

  @Column({ name: "KPI_EXC_REMARK", type: "varchar2", length: 100, nullable: true })
  kpi_exc_remark?: string;

  @Column({ name: "JOB_CATEGORY", type: "varchar2", length: 200, nullable: true })
  job_category?: string;

  @Column({ name: "EDIT_USER", type: "varchar2", length: 10, nullable: true })
  edit_user?: string;

  @Column({ name: "TX_CAT_CODE", type: "varchar2", length: 5, nullable: true })
  tx_cat_code?: string;

  @Column({ name: "BCF_CODE", type: "varchar2", length: 10, nullable: true })
  bcf_code?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 20, nullable: true })
  updated_by?: string;

  @Column({ name: "CONFIRM_DATE", type: "date", nullable: true })
  confirm_date?: Date;

  @Column({ name: "INVOICE_DATE", type: "date", nullable: true })
  invoice_date?: Date;
}
