import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("GT_PO_NOT_GENERATED")
export class PoNotGenerated {
  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar2", length: 25 })
  request_number!: string;

  @PrimaryColumn({ name: "FLOW_CODE", type: "varchar2", length: 15 })
  flow_code!: string;

  @PrimaryColumn({ name: "DOCUMENT_TYPE", type: "varchar2", length: 100 })
  document_type!: string;

  @PrimaryColumn({ name: "STATUS", type: "varchar2", length: 100 })
  status!: string;

  @Column({ name: "DOCUMENT_NUMBER", type: "varchar2", length: 25 })
  document_number!: string;

  @Column({ name: "REQUEST_DATE", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  request_date!: Date;

  @Column({ name: "DESCRIPTION", type: "varchar2", length: 200, nullable: true })
  description!: string;

  @Column({ name: "PROJECT_NAME", type: "varchar2", length: 200, nullable: true })
  project_name!: string;

  @Column({ name: "AMOUNT", type: "decimal", precision: 10, scale: 2, nullable: true })
  amount!: number;

  @Column({ name: "FLOW_LEVEL_RUNNING", type: "number", nullable: true })
  flow_level_running!: number;

  @Column({ name: "LAST_UPDATED", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  last_updated!: Date;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 50, nullable: true })
  created_by!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by!: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", length: 200, nullable: true })
  company_name!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20, nullable: true })
  company_code!: string;

  // 🟩 Optional fields — You can add them later if needed
  @Column({ name: "PROJECT_CODE", type: "varchar2", length: 50, nullable: true })
  project_code!: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 200, nullable: true })
  remarks!: string;

  @Column({ name: "WO_NUMBER", type: "varchar2", length: 50, nullable: true })
  wo_number!: string;

  @Column({ name: "FLOW_TYPE", type: "varchar2", length: 50, nullable: true })
  flow_type!: string;

  @Column({ name: "TYPE_OF_CONTRACT", type: "varchar2", length: 100, nullable: true })
  type_of_contract!: string;
}
