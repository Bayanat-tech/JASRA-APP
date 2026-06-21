import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("GT_REJECTED")
export class PRRejected {
  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;

  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar2", length: 25 })
  request_number!: string;

  @Column({ name: "DOCUMENT_NUMBER", type: "varchar2", length: 25 })
  document_number!: string;

  @Column({ name: "REQUEST_DATE", type: "timestamp", nullable: true })
  request_date!: Date;

  @Column({ name: "SUPPLIER", type: "varchar2", length: 100, nullable: true })
  supplier!: string;

  @Column({ name: "DESCRIPTION", type: "varchar2", length: 200, nullable: true })
  description!: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 500, nullable: true })
  remarks!: string;

  @Column({ name: "AMOUNT", type: "number", precision: 15, scale: 2, nullable: true })
  amount!: number;

  @Column({ name: "DEPARTMENT_CODE", type: "varchar2", length: 50, nullable: true })
  department_code!: string;

  @Column({ name: "FLOW_CODE", type: "varchar2", length: 15, nullable: true })
  flow_code!: string;

  @Column({ name: "ROLE_NAME", type: "varchar2", length: 100, nullable: true })
  role_name!: string;

  @Column({ name: "PROJECT_NAME", type: "varchar2", length: 100, nullable: true })
  project_name!: string;

  @Column({ name: "CREATE_USER", type: "varchar2", length: 50, nullable: true })
  create_user!: string;

  @Column({ name: "CREATE_DATE", type: "timestamp", nullable: true })
  create_date!: Date;

  @Column({ name: "LAST_ACTION", type: "varchar2", length: 50, nullable: true })
  last_action!: string;

  @Column({ name: "LAST_UPDATED", type: "timestamp", nullable: true })
  last_updated!: Date;

  @Column({ name: "DOCUMENT_TYPE", type: "varchar2", length: 10, default: "PR" })
  document_type!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 50, nullable: true })
  created_by!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by!: string;

  @Column({ name: "STATUS", type: "varchar2", length: 20, nullable: true })
  status!: string;

  @Column({ name: "REFERENCE_DOC_NO", type: "varchar2", length: 25, nullable: true })
  reference_doc_no!: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", length: 100, nullable: true })
  company_name!: string;
}
