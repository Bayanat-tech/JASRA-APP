import {
  Entity,
  Column,
  PrimaryColumn,
  ValueTransformer,
} from "typeorm";

// Date transformer to handle Oracle date format
const dateTransformer: ValueTransformer = {
  to: (value: any) => {
    if (!value) return null;
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string') {
      // Parse ISO string and return Date object
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return value;
  },
  from: (value: any) => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }
};

@Entity({ name: "TI_JOB" })
export class InboundJobWms {
  // Composite primary key
  @PrimaryColumn({ type: "varchar2", length: 5, name: "COMPANY_CODE" })
  company_code: string;

  @PrimaryColumn({ type: "varchar2", length: 5, name: "PRIN_CODE" })
  prin_code: string;

  @PrimaryColumn({ type: "varchar2", length: 10, name: "JOB_NO" })
  job_no: string;

  // Required columns
  @Column({ type: "date", name: "JOB_DATE", transformer: dateTransformer })
  job_date: Date;

  @Column({ type: "varchar2", length: 3, name: "CURR_CODE" })
  curr_code: string;

  @Column({ type: "number", precision: 15, scale: 5, name: "EX_RATE" })
  ex_rate: number;

  // Optional columns
  @Column({ type: "varchar2", length: 3, nullable: true, name: "JOB_TYPE" })
  job_type?: string;

  @Column({ type: "varchar2", length: 3, nullable: true, name: "JOB_CLASS" })
  job_class?: string;

  @Column({ type: "varchar2", length: 3, nullable: true, name: "DEPT_CODE" })
  dept_code?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "TRANSPORT_MODE" })
  transport_mode?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "DOC_REF" })
  doc_ref?: string;

  @Column({ type: "varchar2", length: 8, nullable: true, name: "PORT_CODE" })
  port_code?: string;

  @Column({ type: "varchar2", length: 80, nullable: true, name: "DESCRIPTION1" })
  description1?: string;

  @Column({ type: "varchar2", length: 80, nullable: true, name: "DESCRIPTION2" })
  description2?: string;

  @Column({ type: "varchar2", length: 80, nullable: true, name: "PRIN_REF1" })
  prin_ref1?: string;

  @Column({ type: "varchar2", length: 80, nullable: true, name: "PRIN_REF2" })
  prin_ref2?: string;

  @Column({ type: "varchar2", length: 250, nullable: true, name: "REMARKS" })
  remarks?: string;

  @Column({ type: "date", nullable: true, name: "ETA", transformer: dateTransformer })
  eta?: Date;

  @Column({ type: "date", nullable: true, name: "ATA", transformer: dateTransformer })
  ata?: Date;

  @Column({ type: "date", nullable: true, name: "ETD", transformer: dateTransformer })
  etd?: Date;

  @Column({ type: "date", nullable: true, name: "SCHEDULE_DATE", transformer: dateTransformer })
  schedule_date?: Date;

  @Column({ type: "varchar2", length: 3, nullable: true, name: "PAYMENT_TERMS" })
  payment_terms?: string;

  @Column({ type: "float", nullable: true, name: "FRIEGHT_VALUE" })
  frieght_value?: number;

  @Column({ type: "float", nullable: true, name: "INSURANCE_VALUE" })
  insurance_value?: number;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "CUST_CODE" })
  cust_code?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "CONTAINER_FLAG" })
  container_flag?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "CONTAINER" })
  container?: string;

  @Column({ type: "date", nullable: true, name: "CONTAINER_DATE", transformer: dateTransformer })
  container_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "PACKDET" })
  packdet?: string;

  @Column({ type: "date", nullable: true, name: "PACKDET_DATE", transformer: dateTransformer })
  packdet_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "ALLOCATED" })
  allocated?: string;

  @Column({ type: "date", nullable: true, name: "ALLOCATE_DATE", transformer: dateTransformer })
  allocate_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "CANCELED" })
  canceled?: string;

  @Column({ type: "date", nullable: true, name: "CANCEL_DATE", transformer: dateTransformer })
  cancel_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "CONFIRMED" })
  confirmed?: string;

  @Column({ type: "date", nullable: true, name: "CONFIRM_DATE", transformer: dateTransformer })
  confirm_date?: Date;

  @Column({ type: "number", precision: 8, nullable: true, name: "GRN_NO" })
  grn_no?: number;

  @Column({ type: "date", nullable: true, name: "GRN_DATE", transformer: dateTransformer })
  grn_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "INVOICED" })
  invoiced?: string;

  @Column({ type: "date", nullable: true, name: "INVOICE_DATE", transformer: dateTransformer })
  invoice_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "COMPLETED" })
  completed?: string;

  @Column({ type: "date", nullable: true, name: "COMPLETE_DATE", transformer: dateTransformer })
  complete_date?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "USER_ID" })
  user_id?: string;

  @Column({ type: "date", nullable: true, name: "USER_DT", transformer: dateTransformer })
  user_dt?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "EXP_JOBNO" })
  exp_jobno?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "PICKED" })
  picked?: string;

  @Column({ type: "date", nullable: true, name: "PICKED_DATE", transformer: dateTransformer })
  picked_date?: Date;

  @Column({ type: "date", nullable: true, name: "ORDER_DATE", transformer: dateTransformer })
  order_date?: Date;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "ORDERED" })
  ordered?: string;

  @Column({ type: "varchar2", length: 8, nullable: true, name: "DESTINATION_PORT" })
  destination_port?: string;

  @Column({ type: "varchar2", length: 50, nullable: true, name: "VESSEL_NAME" })
  vessel_name?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "VOYAGE_NO" })
  voyage_no?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "PAYABLEAT" })
  payableat?: string;

  @Column({ type: "varchar2", length: 50, nullable: true, name: "PLACE_RECEIPT" })
  place_receipt?: string;

  @Column({ type: "varchar2", length: 50, nullable: true, name: "PLACE_DELIVERY" })
  place_delivery?: string;

  @Column({ type: "number", precision: 1, nullable: true, name: "NO_OF_ORIGINAL_BL" })
  no_of_original_bl?: number;

  @Column({ type: "varchar2", length: 5, nullable: true, name: "BROKER_CODE" })
  broker_code?: string;

  @Column({ type: "varchar2", length: 15, nullable: true, name: "QUOTATION_REF" })
  quotation_ref?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "BE_NO" })
  be_no?: string;

  @Column({ type: "date", nullable: true, name: "BE_DATE", transformer: dateTransformer })
  be_date?: Date;

  @Column({ type: "number", precision: 18, scale: 6, nullable: true, name: "BE_DEP_AMOUNT" })
  be_dep_amount?: number;

  @Column({ type: "char", length: 1, nullable: true, name: "DEPOSIT_COLLECTED" })
  deposit_collected?: string;

  @Column({ type: "date", nullable: true, name: "DEPOSIT_COLLECTED_DT", transformer: dateTransformer })
  deposit_collected_dt?: Date;

  @Column({ type: "number", precision: 10, nullable: true, name: "DEPOSIT_COLLECTED_NO" })
  deposit_collected_no?: number;

  @Column({ type: "char", length: 1, nullable: true, name: "BE_DEPOSITS" })
  be_deposits?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "IND_FREIGHT" })
  ind_freight?: string;

  @Column({ type: "varchar2", length: 50, nullable: true, name: "COUNTRY_ORIGIN" })
  country_origin?: string;

  @Column({ type: "varchar2", length: 50, nullable: true, name: "COUNTRY_DESTINATION" })
  country_destination?: string;

  @Column({ type: "number", nullable: true, name: "TASK_ORDER" })
  task_order?: number;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "CUSTOM_RECNO" })
  custom_recno?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "DOC_REF2" })
  doc_ref2?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "HAWB" })
  hawb?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "REEXPORT" })
  reexport?: string;

  @Column({ type: "varchar2", length: 200, nullable: true, name: "REF_JOBNO" })
  ref_jobno?: string;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "COMBINED_JOBNO" })
  combined_jobno?: string;

  @Column({ type: "varchar2", length: 5, nullable: true, name: "CARRIER" })
  carrier?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "JOB_LOCK" })
  job_lock?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "COURIER_CODE" })
  courier_code?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "DELIVERY_POINT" })
  delivery_point?: string;

  @Column({ type: "varchar2", length: 5, nullable: true, name: "DIV_CODE" })
  div_code?: string;

  @Column({ type: "date", nullable: true, name: "DOC_DEPOSIT_EXPIRY", transformer: dateTransformer })
  doc_deposit_expiry?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "SALESMAN_CODE" })
  salesman_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "HEALTH_STATUS" })
  health_status?: string;

  @Column({ type: "varchar2", length: 60, nullable: true, name: "TRANSIT_TIME" })
  transit_time?: string;

  @Column({ type: "char", length: 1, nullable: true, name: "DOCCUMENT_CHECK" })
  document_check?: string;

  @Column({ type: "varchar2", length: 250, nullable: true, name: "DELIVERY_REMARKS" })
  delivery_remarks?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "CARGO_RECEIVED" })
  cargo_received?: string;

  @Column({ type: "varchar2", length: 50, nullable: true, name: "DELIVERED_BY" })
  delivered_by?: string;

  @Column({ type: "varchar2", length: 25, nullable: true, name: "CANCELED_BY" })
  canceled_by?: string;

  @Column({ type: "varchar2", length: 250, nullable: true, name: "CANCEL_REMARKS" })
  cancel_remarks?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "SEND_MAIL" })
  send_mail?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "N", name: "BACKLOG_MAIL" })
  backlog_mail?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "DPLAN_FLAG" })
  dplan_flag?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "TRANS_BATCH_ID" })
  trans_batch_id?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, name: "SEND_MAIL_DN" })
  send_mail_dn?: string;

  @Column({ type: "varchar2", length: 1, nullable: true, default: "Y", name: "KPI_INC" })
  kpi_inc?: string;

  @Column({ type: "varchar2", length: 100, nullable: true, name: "KPI_EXC_REMARK" })
  kpi_exc_remark?: string;

  @Column({ type: "varchar2", length: 200, nullable: true, default: "N/A", name: "JOB_CATEGORY" })
  job_category?: string;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "EDIT_USER" })
  edit_user?: string;

  @Column({ type: "varchar2", length: 5, nullable: true, name: "TX_CAT_CODE" })
  tx_cat_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true, name: "BCF_CODE" })
  bcf_code?: string;

  @Column({ type: "date", nullable: true, name: "DN_PRINT_DATE", transformer: dateTransformer })
  dn_print_date?: Date;

  @Column({ type: "varchar2", length: 5, nullable: true, name: "TEST_CODE" })
  test_code?: string;

  @Column({ type: "varchar2", length: 20, nullable: true, name: "DEC_NO" })
  dec_no?: string;
}
