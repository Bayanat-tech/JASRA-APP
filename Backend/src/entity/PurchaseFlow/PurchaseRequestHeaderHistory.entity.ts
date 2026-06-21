import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("GT_MY_HISTORY")
export class PurchaseRequestHeaderHistory {
  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar2", length: 25 })
  request_number!: string;

  @PrimaryColumn({ name: "FLOW_CODE", type: "varchar2", length: 15 })
  flow_code!: string;

  @Column({ name: "DOCUMENT_NUMBER", type: "varchar2", length: 25 })
  document_number!: string;

  @Column({ name: "REQUEST_DATE", type: "varchar2", length: 50, nullable: true })
  request_date!: string;

  @Column({ name: "SUPPLIER", type: "varchar2", length: 100, nullable: true })
  supplier!: string;

  @Column({ name: "DESCRIPTION", type: "varchar2", length: 200, nullable: true })
  description!: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 500, nullable: true })
  remarks!: string;

  @Column({ name: "AMOUNT", type: "varchar2", length: 50, nullable: true })
  amount!: string;

  @Column({ name: "DEPARTMENT_CODE", type: "varchar2", length: 50, nullable: true })
  department_code!: string;

  @Column({ name: "FLOW_LEVEL_INITIAL", type: "number", nullable: true })
  flow_level_initial!: number;

  @Column({ name: "FLOW_LEVEL_RUNNING", type: "number", nullable: true })
  flow_level_running!: number;

  @Column({ name: "FLOW_LEVEL_FINAL", type: "number", nullable: true })
  flow_level_final!: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20, nullable: true })
  company_code!: string;

  @Column({ name: "CREATE_USER", type: "varchar2", length: 50, nullable: true })
  create_user!: string;

  @Column({ name: "CREATE_DATE", type: "varchar2", length: 50, nullable: true })
  create_date!: string;

  @Column({ name: "FA_UPLOADED", type: "varchar2", length: 5, nullable: true })
  fa_uploaded!: string;

  @Column({ name: "FINAL_APPROVED", type: "varchar2", length: 5, nullable: true })
  final_approved!: string;

  @Column({ name: "PURCH_STATUS", type: "varchar2", length: 20, nullable: true })
  purch_status!: string;

  @Column({ name: "SORT_ORDER", type: "varchar2", length: 10, nullable: true })
  sort_order!: string;

  @Column({ name: "CALL_TYPE", type: "number", default: 3 })
  call_type!: number;

  @Column({ name: "LAST_ACTION", type: "varchar2", length: 50, nullable: true })
  last_action!: string;

  @Column({ name: "LAST_UPDATED", type: "varchar2", length: 50, nullable: true })
  last_updated!: string;

  @Column({ name: "HISTORY_STATUS", type: "varchar2", length: 20, default: "HISTORY" })
  history_status!: string;

  @Column({ name: "NEXT_ACTION_BY", type: "varchar2", length: 50, nullable: true })
  next_action_by!: string;

  @Column({ name: "PROJECT_CODE", type: "varchar2", length: 50, nullable: true })
  project_code!: string;

  @Column({ name: "FLOW_TYPE", type: "varchar2", length: 20, nullable: true })
  flow_type!: string;

  @Column({ name: "STATUS", type: "varchar2", length: 20, nullable: true })
  status!: string;

  @Column({ name: "PROJECT_NAME", type: "varchar2", length: 100, nullable: true })
  project_name!: string;

  @Column({ name: "DOCUMENT_TYPE", type: "varchar2", length: 20, nullable: true })
  document_type!: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", length: 100, nullable: true })
  company_name!: string;

  @Column({ name: "REFERENCE_DOC_NO", type: "varchar2", length: 25, nullable: true })
  reference_doc_no!: string;
}
