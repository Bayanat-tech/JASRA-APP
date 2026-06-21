import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import constants from "../../../../helpers/constants";

@Entity(constants.TABLE.TI_JOB)
export class InboundJobWms {
  
  // Composite Primary Key
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code!: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code!: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no!: string;

  // Regular Columns
  @Column({ name: "JOB_DATE", type: "date" })
  job_date!: Date;

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

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3 })
  curr_code!: string;

  @Column({ name: "EX_RATE", type: "number", precision: 15, scale: 5 })
  ex_rate!: number;

  @Column({ name: "FRIEGHT_VALUE", type: "float", precision: 63, nullable: true })
  frieght_value?: number;

  @Column({ name: "INSURANCE_VALUE", type: "float", precision: 63, nullable: true })
  insurance_value?: number;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20, nullable: true })
  cust_code?: string;

  @Column({ name: "CONTAINER_FLAG", type: "varchar2", length: 1, nullable: true })
  container_flag?: string;

  @Column({ name: "CONTAINER", type: "varchar2", length: 1, default: "'N'", nullable: true })
  container?: string;

  @Column({ name: "CONTAINER_DATE", type: "date", nullable: true })
  container_date?: Date;

  @Column({ name: "PACKDET", type: "varchar2", length: 1, default: "'N'", nullable: true })
  packdet?: string;

  @Column({ name: "PACKDET_DATE", type: "date", nullable: true })
  packdet_date?: Date;

  @Column({ name: "ALLOCATED", type: "varchar2", length: 1, default: "'N'", nullable: true })
  allocated?: string;

  @Column({ name: "ALLOCATE_DATE", type: "date", nullable: true })
  allocate_date?: Date;

  @Column({ name: "CANCELED", type: "varchar2", length: 1, default: "'N'", nullable: true })
  canceled?: string;

  @Column({ name: "CANCEL_DATE", type: "date", nullable: true })
  cancel_date?: Date;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, default: "'N'", nullable: true })
  confirmed?: string;

  @Column({ name: "CONFIRM_DATE", type: "date", nullable: true })
  confirm_date?: Date;

  @Column({ name: "GRN_NO", type: "number", precision: 8, nullable: true })
  grn_no?: number;

  @Column({ name: "GRN_DATE", type: "date", nullable: true })
  grn_date?: Date;

  @Column({ name: "INVOICED", type: "varchar2", length: 1, nullable: true })
  invoiced?: string;

  @Column({ name: "INVOICE_DATE", type: "date", nullable: true })
  invoice_date?: Date;

  @Column({ name: "COMPLETED", type: "varchar2", length: 1, nullable: true })
  completed?: string;

  @Column({ name: "COMPLETE_DATE", type: "date", nullable: true })
  complete_date?: Date;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, default: "USER", nullable: true })
  user_id?: string;

  @Column({ name: "USER_DT", type: "date", default: () => "SYSDATE", nullable: true })
  user_dt?: Date;

  @Column({ name: "EXP_JOBNO", type: "varchar2", length: 10, nullable: true })
  exp_jobno?: string;

  @Column({ name: "PICKED", type: "varchar2", length: 1, default: "'N'", nullable: true })
  picked?: string;

  @Column({ name: "PICKED_DATE", type: "date", nullable: true })
  picked_date?: Date;

  @Column({ name: "ORDER_DATE", type: "date", nullable: true })
  order_date?: Date;

  @Column({ name: "ORDERED", type: "varchar2", length: 1, default: "'N'", nullable: true })
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

  @Column({ name: "NO_OF_ORIGINAL_BL", type: "number", precision: 1, nullable: true })
  no_of_original_bl?: number;

  @Column({ name: "BROKER_CODE", type: "varchar2", length: 5, nullable: true })
  broker_code?: string;

  @Column({ name: "QUOTATION_REF", type: "varchar2", length: 15, nullable: true })
  quotation_ref?: string;

  @Column({ name: "BE_NO", type: "varchar2", length: 20, nullable: true })
  be_no?: string;

  @Column({ name: "BE_DATE", type: "date", nullable: true })
  be_date?: Date;

  @Column({ name: "BE_DEP_AMOUNT", type: "number", precision: 18, scale: 6, nullable: true })
  be_dep_amount?: number;

  @Column({ name: "DEPOSIT_COLLECTED", type: "char", length: 1, nullable: true })
  deposit_collected?: string;

  @Column({ name: "DEPOSIT_COLLECTED_DT", type: "date", nullable: true })
  deposit_collected_dt?: Date;

  @Column({ name: "DEPOSIT_COLLECTED_NO", type: "number", precision: 10, nullable: true })
  deposit_collected_no?: number;

  @Column({ name: "BE_DEPOSITS", type: "char", length: 1, nullable: true })
  be_deposits?: string;

  @Column({ name: "IND_FREIGHT", type: "varchar2", length: 1, nullable: true })
  ind_freight?: string;

  @Column({ name: "COUNTRY_ORIGIN", type: "varchar2", length: 50, nullable: true })
  country_origin?: string;

  @Column({ name: "COUNTRY_DESTINATION", type: "varchar2", length: 50, nullable: true })
  country_destination?: string;

  @Column({ name: "TASK_ORDER", type: "number", nullable: true })
  task_order?: number;

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

  @Column({ name: "JOB_LOCK", type: "varchar2", length: 1, default: "'N'", nullable: true })
  job_lock?: string;

  @Column({ name: "COURIER_CODE", type: "varchar2", length: 20, nullable: true })
  courier_code?: string;

  @Column({ name: "DELIVERY_POINT", type: "varchar2", length: 20, nullable: true })
  delivery_point?: string;

  @Column({ name: "DEP_BATCHDATE", type: "date", nullable: true })
  dep_batchdate?: Date;

  @Column({ name: "DEP_BATCHENTRY", type: "number", precision: 22, scale: 18, nullable: true })
  dep_batchentry?: number;

  @Column({ name: "DEP_DOC_TYPE", type: "varchar2", length: 20, nullable: true })
  dep_doc_type?: string;

  @Column({ name: "DEP_PERMIT_NO", type: "varchar2", length: 20, nullable: true })
  dep_permit_no?: string;

  @Column({ name: "DEP_REMARKS", type: "varchar2", length: 1000, nullable: true })
  dep_remarks?: string;

  @Column({ name: "DEP_REMIT_NO", type: "varchar2", length: 20, nullable: true })
  dep_remit_no?: string;

  @Column({ name: "DOC_DEP_RCVD_DATE", type: "date", nullable: true })
  doc_dep_rcvd_date?: Date;

  @Column({ name: "DOC_DEPOSIT_AMT", type: "number", precision: 22, scale: 18, nullable: true })
  doc_deposit_amt?: number;

  @Column({ name: "DOC_DEPOSIT_CURRENCY", type: "varchar2", length: 5, nullable: true })
  doc_deposit_currency?: string;

  @Column({ name: "DOC_DEPOSIT_DATE", type: "date", nullable: true })
  doc_deposit_date?: Date;

  @Column({ name: "DOC_DEPOSIT_RECEIVED", type: "number", precision: 22, scale: 18, nullable: true })
  doc_deposit_received?: number;

  @Column({ name: "DOC_DEPOSITD", type: "varchar2", length: 1, nullable: true })
  doc_depositd?: string;

  @Column({ name: "DOC_REF_DATE", type: "date", nullable: true })
  doc_ref_date?: Date;

  @Column({ name: "EXITBILL1", type: "varchar2", length: 25, nullable: true })
  exitbill1?: string;

  @Column({ name: "EXITBILL2", type: "varchar2", length: 25, nullable: true })
  exitbill2?: string;

  @Column({ name: "JOB_INTEGRATION_CLASS", type: "varchar2", length: 20, nullable: true })
  job_integration_class?: string;

  @Column({ name: "TOT_IMPORT_VALUE", type: "number", precision: 22, scale: 18, nullable: true })
  tot_import_value?: number;

  @Column({ name: "REF_CUSTOMS", type: "varchar2", length: 30, nullable: true })
  ref_customs?: string;

  @Column({ name: "REF_CUSTOMS_DATE", type: "date", nullable: true })
  ref_customs_date?: Date;

  @Column({ name: "DRIVER_REF", type: "varchar2", length: 40, nullable: true })
  driver_ref?: string;

  @Column({ name: "DRIVER_REMARKS", type: "varchar2", length: 250, nullable: true })
  driver_remarks?: string;

  @Column({ name: "DIV_CODE", type: "varchar2", length: 5, nullable: true })
  div_code?: string;

  @Column({ name: "DOC_DEPOSIT_EXPIRY", type: "date", nullable: true })
  doc_deposit_expiry?: Date;

  @Column({ name: "SALESMAN_CODE", type: "varchar2", length: 10, nullable: true })
  salesman_code?: string;

  @Column({ name: "HEALTH_STATUS", type: "varchar2", length: 10, nullable: true })
  health_status?: string;

  @Column({ name: "LETTER_UNDERTAKING", type: "date", nullable: true })
  letter_undertaking?: Date;

  @Column({ name: "TRANSIT_TIME", type: "varchar2", length: 60, nullable: true })
  transit_time?: string;

  @Column({ name: "DOCCUMENT_CHECK", type: "char", length: 1, nullable: true })
  doccument_check?: string;

  @Column({ name: "DELIVERY_REMARKS", type: "varchar2", length: 250, nullable: true })
  delivery_remarks?: string;

  @Column({ name: "DELIVERED_ON", type: "date", nullable: true })
  delivered_on?: Date;

  @Column({ name: "CARGO_RECEIVED", type: "varchar2", length: 1, nullable: true })
  cargo_received?: string;

  @Column({ name: "DELIVERED_BY", type: "varchar2", length: 50, nullable: true })
  delivered_by?: string;

  @Column({ name: "RECEIVED_DATE", type: "date", nullable: true })
  received_date?: Date;

  @Column({ name: "CHECKLIST_NO", type: "varchar2", length: 10, nullable: true })
  checklist_no?: string;

  @Column({ name: "BACKORDER_PICK", type: "varchar2", length: 1, default: "'N'", nullable: true })
  backorder_pick?: string;

  @Column({ name: "CANCELED_BY", type: "varchar2", length: 25, nullable: true })
  canceled_by?: string;

  @Column({ name: "CANCEL_REMARKS", type: "varchar2", length: 250, nullable: true })
  cancel_remarks?: string;

  @Column({ name: "SEND_MAIL", type: "varchar2", length: 1, nullable: true })
  send_mail?: string;

  @Column({ name: "BACKLOG_MAIL", type: "varchar2", length: 1, default: "'N'", nullable: true })
  backlog_mail?: string;

  @Column({ name: "DPLAN_FLAG", type: "varchar2", length: 1, nullable: true })
  dplan_flag?: string;

  @Column({ name: "TRANS_BATCH_ID", type: "varchar2", length: 20, nullable: true })
  trans_batch_id?: string;

  @Column({ name: "SEND_MAIL_DN", type: "varchar2", length: 1, nullable: true })
  send_mail_dn?: string;

  @Column({ name: "KPI_INC", type: "varchar2", length: 1, default: "'Y'", nullable: true })
  kpi_inc?: string;

  @Column({ name: "KPI_EXC_REMARK", type: "varchar2", length: 100, nullable: true })
  kpi_exc_remark?: string;

  @Column({ name: "JOB_CATEGORY", type: "varchar2", length: 200, default: "'N/A'", nullable: true })
  job_category?: string;

  @Column({ name: "EDIT_USER", type: "varchar2", length: 10, nullable: true })
  edit_user?: string;

  @Column({ name: "TX_CAT_CODE", type: "varchar2", length: 5, nullable: true })
  tx_cat_code?: string;

  @Column({ name: "BCF_CODE", type: "varchar2", length: 10, nullable: true })
  bcf_code?: string;

  @Column({ name: "DN_PRINT_DATE", type: "date", nullable: true })
  dn_print_date?: Date;

  @Column({ name: "DEC_TYPE", type: "varchar2", length: 10, nullable: true })
  dec_type?: string;

  @Column({ name: "LAB_CODE", type: "varchar2", length: 5, nullable: true })
  lab_code?: string;

  @Column({ name: "TEST_CODE", type: "varchar2", length: 5, nullable: true })
  test_code?: string;

  @Column({ name: "DEC_DATE", type: "date", nullable: true })
  dec_date?: Date;

  @Column({ name: "DEC_NO", type: "varchar2", length: 20, nullable: true })
  dec_no?: string;

  @Column({ name: "TALLY_TYPE", type: "char", length: 1, default: "'C'", nullable: true })
  tally_type?: string;

  @Column({ name: "ORDER_SRNO", type: "number", nullable: true })
  order_srno?: number;

  @Column({ name: "MEMBER_TYPE", type: "varchar2", length: 10, nullable: true })
  member_type?: string;

  @Column({ name: "SALE_TYPE", type: "varchar2", length: 10, default: "'Normal'", nullable: true })
  sale_type?: string;

  @Column({ name: "FORWARDER_CODE", type: "varchar2", length: 10, nullable: true })
  forwarder_code?: string;

  @Column({ name: "CONTR_DEPOSIT", type: "varchar2", length: 1, default: "'N'", nullable: true })
  contr_deposit?: string;

  @Column({ name: "CONTR_DEPOSIT_AMT", type: "number", precision: 18, scale: 6, nullable: true })
  contr_deposit_amt?: number;

  @Column({ name: "TEMP_EXP", type: "varchar2", length: 1, default: "'N'", nullable: true })
  temp_exp?: string;

  @Column({ name: "JOB_START_DATE", type: "date", nullable: true })
  job_start_date?: Date;

  @Column({ name: "FEEDER_VESSEL_NAME", type: "varchar2", length: 50, nullable: true })
  feeder_vessel_name?: string;

  @Column({ name: "JOB_FLAG", type: "char", length: 1, default: "'M'", nullable: true })
  job_flag?: string;

  @Column({ name: "HOUSE_APPRTN", type: "varchar2", length: 1, default: "'N'", nullable: true })
  house_apprtn?: string;

  @Column({ name: "WALKIN_PRIN_CODE", type: "varchar2", length: 10, nullable: true })
  walkin_prin_code?: string;

    @Column({ name: "UPDATED_BY", type: "varchar2", length: 20, nullable: true })
  updated_by?: string;

    @Column({ name: "UPDATED_AT", type: "date", nullable: true })
  updated_at?: Date;
}
