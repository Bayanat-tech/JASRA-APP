import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("VW_TOTAL_CANCEL_PO_PR")
export class POCancel {
  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar2", length: 25 })
  request_number!: string;

  @Column({ name: "DOCUMENT_NUMBER", type: "varchar2", length: 25 })
  document_number!: string;

  @Column({
    name: "REQUEST_DATE",
    type: "timestamp",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  request_date?: Date;

  @Column({ name: "DESCRIPTION", type: "varchar2", length: 200, nullable: true })
  description?: string;

  @Column({ name: "DOCUMENT_TYPE", type: "varchar2", length: 200, nullable: true })
  document_type?: string;

  @Column({ name: "PROJECT_NAME", type: "varchar2", length: 200, nullable: true })
  project_name?: string;

  @Column({ name: "SUPPLIER", type: "varchar2", length: 200, nullable: true })
  supplier?: string;

  @Column({
    name: "AMOUNT",
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  amount?: number;

  @Column({ name: "PROJECT_CODE", type: "varchar2", length: 200, nullable: true })
  project_code?: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", length: 200, nullable: true })
  company_name?: string;

  @Column({ name: "STATUS", type: "varchar2", length: 200, nullable: true })
  status?: string;

  @Column({
    name: "REFERENCE_DOC_NO",
    type: "varchar2",
    length: 200,
    nullable: true,
  })
  reference_doc_no?: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 10, nullable: true })
  companyCode?: string;

  @Column({ name: "DOC_NO", type: "varchar2", length: 25, nullable: true })
  doc_no?: string;

  @Column({ name: "DOC_DATE", type: "timestamp", nullable: true })
  doc_date?: Date;

  @Column({ name: "REF_DOC_NO", type: "varchar2", length: 50, nullable: true })
  ref_doc_no?: string;

  @Column({ name: "DIV_CODE", type: "varchar2", length: 20, nullable: true })
  div_code?: string;

  @Column({ name: "PO_CONFIRM", type: "varchar2", length: 5, nullable: true })
  po_confirm?: string;

  @Column({ name: "PO_CANCEL", type: "varchar2", length: 5, nullable: true })
  po_cancel?: string;

  @Column({ name: "CANCEL_TYPE", type: "varchar2", length: 10, nullable: true })
  cancel_type?: string;

  @Column({ name: "SUPP_NAME", type: "varchar2", length: 200, nullable: true })
  supp_name?: string;

  @Column({ name: "DLVR_TERM", type: "varchar2", length: 50, nullable: true })
  dlvr_term?: string;

  @Column({ name: "SUPP_ADDR1", type: "varchar2", length: 200, nullable: true })
  supp_addr1?: string;

  @Column({ name: "SUPP_ADDR3", type: "varchar2", length: 200, nullable: true })
  supp_addr3?: string;

  @Column({ name: "SUPP_ADDR4", type: "varchar2", length: 200, nullable: true })
  supp_addr4?: string;

  @Column({ name: "SUPP_TELNO1", type: "varchar2", length: 50, nullable: true })
  supp_telno1?: string;

  @Column({ name: "SUPP_FAXNO1", type: "varchar2", length: 50, nullable: true })
  supp_faxno1?: string;

  @Column({ name: "SUPP_EMAIL1", type: "varchar2", length: 100, nullable: true })
  supp_email1?: string;

  @Column({ name: "WO_NUMBER", type: "varchar2", length: 50, nullable: true })
  wo_number?: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 500, nullable: true })
  remarks?: string;

  @Column({ name: "PAYMENT_TERMS", type: "varchar2", length: 100, nullable: true })
  payment_terms?: string;

  @Column({ name: "LAST_ACTION", type: "varchar2", length: 50, nullable: true })
  last_action?: string;

  @Column({
    name: "UPDATED_AT",
    type: "timestamp",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at?: Date;
}
