import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("GT_CLOSE") // Table name
export class POHeader {
  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar", length: 25 })
  request_number!: string;

  @Column({ name: "DOCUMENT_NUMBER", type: "varchar", length: 25 })
  document_number!: string;

  @Column({ name: "REQUEST_DATE", type: "timestamp", nullable: true, default: () => "CURRENT_TIMESTAMP" })
  request_date!: Date;

  @Column({ name: "DESCRIPTION", type: "varchar", length: 200, nullable: true })
  description!: string;

  @Column({ name: "DOCUMENT_TYPE", type: "varchar", length: 200, nullable: true })
  document_type!: string;

  @Column({ name: "PROJECT_NAME", type: "varchar", length: 200, nullable: true })
  project_name!: string;

  @Column({ name: "SUPPLIER", type: "varchar", length: 200, nullable: true })
  supplier!: string;

  @Column({ name: "AMOUNT", type: "decimal", nullable: true })
  amount!: number;

  @Column({ name: "STATUS", type: "varchar", length: 200, nullable: true })
  status!: string;

  @Column({ name: "COMPANY_NAME", type: "varchar", length: 200, nullable: true })
  company_name!: string;

  @Column({ name: "REFERENCE_DOC_NO", type: "varchar", length: 200, nullable: true })
  reference_doc_no!: string;

  @Column({ name: "DIV_CODE", type: "varchar", length: 50, nullable: true })
  div_code!: string;

  @Column({ name: "PO_CONFIRM", type: "varchar", length: 10, nullable: true })
  po_confirm!: string;

  @Column({ name: "PO_CANCEL", type: "varchar", length: 10, nullable: true })
  po_cancel!: string;

  @Column({ name: "CANCEL_TYPE", type: "varchar", length: 50, nullable: true })
  cancel_type!: string;

  @Column({ name: "SUPP_NAME", type: "varchar", length: 200, nullable: true })
  supp_name!: string;

  @Column({ name: "DLVR_TERM", type: "varchar", length: 200, nullable: true })
  dlvr_term!: string;

  @Column({ name: "SUPP_ADDR1", type: "varchar", length: 200, nullable: true })
  supp_addr1!: string;

  @Column({ name: "SUPP_ADDR3", type: "varchar", length: 200, nullable: true })
  supp_addr3!: string;

  @Column({ name: "SUPP_ADDR4", type: "varchar", length: 200, nullable: true })
  supp_addr4!: string;

  @Column({ name: "SUPP_TELNO1", type: "varchar", length: 50, nullable: true })
  supp_telno1!: string;

  @Column({ name: "SUPP_FAXNO1", type: "varchar", length: 50, nullable: true })
  supp_faxno1!: string;

  @Column({ name: "SUPP_EMAIL1", type: "varchar", length: 100, nullable: true })
  supp_email1!: string;

  @Column({ name: "PROJECT_CODE", type: "varchar", length: 50, nullable: true })
  project_code!: string;

  @Column({ name: "WO_NUMBER", type: "varchar", length: 50, nullable: true })
  wo_number!: string;

  @Column({ name: "REMARKS", type: "varchar", length: 500, nullable: true })
  remarks!: string;

  @Column({ name: "PAYMENT_TERMS", type: "varchar", length: 200, nullable: true })
  payment_terms!: string;

  @Column({ name: "LAST_ACTION", type: "varchar", length: 50, nullable: true })
  last_action!: string;
}
