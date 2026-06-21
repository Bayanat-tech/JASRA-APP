import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity("TMP_LEAVE_REQUEST_FLOW")
export class TmpLeaveRequestFlow {

  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar2", length: 15 })
  request_number!: string;

  @Column({ name: "CURRENT_STEP", type: "varchar2", length: 20, nullable: true })
  current_step?: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 7, nullable: true })
  company_code?: string;

  @Column({ name: "EMPLOYEE_CODE", type: "varchar2", length: 10, nullable: true })
  employee_code?: string;

  @Column({ name: "LEAVE_REQUEST_DATE", type: "date", nullable: true })
  leave_request_date?: Date;

  @Column({ name: "TRAVEL_DATE", type: "date", nullable: true })
  travel_date?: Date;

  @Column({ name: "LEAVE_TYPE", type: "varchar2", length: 10, nullable: true })
  leave_type?: string;

  @Column({ name: "LEAVE_START_DATE", type: "date", nullable: true })
  leave_start_date?: Date;

  @Column({ name: "LEAVE_END_DATE", type: "date", nullable: true })
  leave_end_date?: Date;

  @Column({ name: "LEAVE_DAYS", type: "number", nullable: true })
  leave_days?: number;

  @Column({ name: "LEAVE_REASON", type: "varchar2", length: 1, nullable: true })
  leave_reason?: string;

  @Column({ name: "DAYS_ADJUSTED", type: "number", nullable: true })
  days_adjusted?: number;

  @Column({ name: "HALF_DAY", type: "varchar2", length: 1, nullable: true })
  half_day?: string;

  @Column({ name: "AIR_TICKET", type: "varchar2", length: 20, nullable: true })
  air_ticket?: string;

  @Column({ name: "AIR_TICKET_SELF", type: "varchar2", length: 1, nullable: true })
  air_ticket_self?: string;

  @Column({ name: "AIR_TICKET_WIFE", type: "varchar2", length: 1, nullable: true })
  air_ticket_wife?: string;

  @Column({ name: "AIR_TICKET_CHILDREN", type: "number", nullable: true })
  air_ticket_children?: number;

  @Column({ name: "REQUEST_DATE", type: "date", nullable: true })
  request_date?: Date;

  @Column({ name: "FLOW_CODE", type: "varchar2", length: 5, nullable: true })
  flow_code?: string;

  @Column({ name: "FLOW_LEVEL_INITIAL", type: "number", nullable: true })
  flow_level_initial?: number;

  @Column({ name: "FLOW_LEVEL_RUNNING", type: "number", nullable: true })
  flow_level_running?: number;

  @Column({ name: "FLOW_LEVEL_FINAL", type: "number", nullable: true })
  flow_level_final?: number;

  @Column({ name: "FA_UPLOADED", type: "char", length: 1, nullable: true })
  fa_uploaded?: string;

  @Column({ name: "FINAL_APPROVED", type: "varchar2", length: 3, nullable: true })
  final_approved?: string;

  @Column({ name: "CREATE_USER", type: "varchar2", length: 10, nullable: true })
  create_user?: string;

  @Column({ name: "CREATE_DATE", type: "date", nullable: true })
  create_date?: Date;

  @Column({ name: "LAST_UPDATED", type: "varchar2", length: 10, nullable: true })
  last_updated?: string;

  @Column({ name: "LAST_ACTION", type: "varchar2", length: 20, nullable: true })
  last_action?: string;

  @Column({ name: "HISTORY_SERIAL", type: "number", nullable: true })
  history_serial?: number;

  @Column({ name: "CANCEL_FLAG", type: "char", length: 1, nullable: true })
  cancel_flag?: string;

  @Column({ name: "CANCEL_USER", type: "varchar2", length: 20, nullable: true })
  cancel_user?: string;

  @Column({ name: "CANCEL_DATE", type: "date", nullable: true })
  cancel_date?: Date;

  @Column({ name: "CANCEL_REMARK", type: "varchar2", length: 100, nullable: true })
  cancel_remark?: string;

  @Column({ name: "REMARKS_HISTRY", type: "varchar2", length: 3000, nullable: true })
  remarks_histry?: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 1000, nullable: true })
  remarks?: string;

  @Column({ name: "DESCRIPTION", type: "varchar2", length: 200, nullable: true })
  description?: string;

  @Column({ name: "COMMENTS", type: "varchar2", length: 1000, nullable: true })
  comments?: string;

  @Column({ name: "MOBILE_APP_UPDATE", type: "char", length: 1, nullable: true })
  mobile_app_update?: string;

  @Column({ name: "UPDATED_AT", type: "date", nullable: true })
  updated_at?: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ name: "CREATED_AT", type: "date", nullable: true })
  created_at?: Date;

  @Column({ name: "HOD", type: "varchar2", length: 10, nullable: true })
  hod?: string;

  @Column({ name: "DEPT_HEAD", type: "varchar2", length: 10, nullable: true })
  dept_head?: string;

  @Column({ name: "IMMEDIATE_SUPERVISOR", type: "varchar2", length: 10, nullable: true })
  immediate_supervisor?: string;

  @Column({ name: "LOG_NUMBER", type: "number", nullable: true })
  log_number?: number;

  @Column({ name: "NEXT_ACTION_BY", type: "varchar2", length: 20, nullable: true })
  next_action_by?: string;

  @Column({ name: "LEAVE_ALLOWANCE", type: "varchar2", length: 5, nullable: true })
  leave_allowance?: string;

  @Column({ name: "ADV_PAYMENT", type: "varchar2", length: 5, nullable: true })
  adv_payment?: string;

  @Column({ name: "CAUSE_TYPE", type: "varchar2", length: 30, nullable: true })
  cause_type?: string;

  @Column({ name: "NAME_OF_REPLACEMENT", type: "varchar2", length: 100, nullable: true })
  name_of_replacement?: string;

  @Column({ name: "CONTACT_DETAILS_DURING_LEAVE", type: "varchar2", length: 100, nullable: true })
  contact_details_during_leave?: string;

  @Column({ name: "DUTY_RESUME_DATE", type: "date", nullable: true })
  duty_resume_date?: Date;

  @Column({ name: "ACTUAL_RESUME_DATE", type: "date", nullable: true })
  actual_resume_date?: Date;

  @Column({ name: "EMPLOYEE_NAME", type: "varchar2", length: 500, nullable: true })
  employee_name?: string;

  @Column({ name: "ERP_DOC_NO", type: "varchar2", length: 20, nullable: true })
  erp_doc_no?: string;
}