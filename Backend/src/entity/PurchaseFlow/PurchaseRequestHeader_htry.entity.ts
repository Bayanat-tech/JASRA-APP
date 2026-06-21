import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "VW_GT_MY_TASK" })
export class PurchaseRequestHeader_htry {
  @Column({ name: "SENDBACK_HISTRY", type: "varchar", length: 2000, nullable: true })
  sendback_histry: string;

  @Column({ name: "COMPANY_CODE", type: "varchar", length: 50, nullable: true })
  company_code: string;

  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar", length: 50 })
  request_number: string;

  @Column({ name: "DOCUMENT_NUMBER", type: "varchar", length: 50, nullable: true })
  document_number: string;

  @Column({ name: "REQUEST_DATE", type: "timestamp", nullable: true })
  request_date: Date;

  @Column({ name: "SUPPLIER", type: "varchar", length: 255, nullable: true })
  supplier: string;

  @Column({ name: "DESCRIPTION", type: "varchar", length: 2000, nullable: true })
  description: string;

  @Column({ name: "REMARKS", type: "varchar", length: 2000, nullable: true })
  remarks: string;

  @Column({ name: "AMOUNT", type: "decimal", precision: 18, scale: 2, nullable: true })
  amount: number;

  @Column({ name: "DEPARTMENT_CODE", type: "varchar", length: 50, nullable: true })
  department_code: string;

  @Column({ name: "FLOW_CODE", type: "varchar", length: 50, nullable: true })
  flow_code: string;

  @Column({ name: "ROLE_NAME", type: "varchar", length: 255, nullable: true })
  role_name: string;

  @Column({ name: "PROJECT_NAME", type: "varchar", length: 500, nullable: true })
  project_name: string;

  @Column({ name: "CREATE_USER", type: "varchar", length: 50, nullable: true })
  create_user: string;

  @Column({ name: "CREATE_DATE", type: "timestamp", nullable: true })
  create_date: Date;

  @Column({ name: "LAST_ACTION", type: "varchar", length: 255, nullable: true })
  last_action: string;

  @Column({ name: "LAST_UPDATED", type: "varchar", length: 255, nullable: true })
  last_updated: string;

  @Column({ name: "DOCUMENT_TYPE", type: "varchar", length: 50, nullable: true })
  document_type: string;

  @Column({ name: "ORDER_SEQUENCE", type: "varchar", length: 5, nullable: true })
  order_sequence: string;

  @Column({ name: "UPDATED_AT", type: "timestamp", nullable: true })
  updated_at: Date;

  @Column({ name: "CREATED_BY", type: "varchar", length: 50, nullable: true })
  created_by: string;

  @Column({ name: "UPDATED_BY", type: "varchar", length: 50, nullable: true })
  updated_by: string;

  @Column({ name: "FLOW_LEVEL_RUNNING", type: "int", nullable: true })
  flow_level_running: number;

  @Column({ name: "STATUS", type: "varchar", length: 30, nullable: true })
  status: string;

  @Column({ name: "LOGIN_ID", type: "varchar", length: 30, nullable: true })
  login_id: string;

  @Column({ name: "REFERENCE_DOC_NO", type: "varchar", length: 30, nullable: true })
  reference_doc_no: string;

  @Column({ name: "COMPANY_NAME", type: "varchar", length: 100, nullable: true })
  company_name: string;
}
