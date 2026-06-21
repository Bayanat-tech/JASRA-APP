import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "VW_TOTAL_CLOSE_DOCUMENT" })
export class PurchaseCloseRequest {
  @PrimaryColumn({ type: "varchar", length: 25 })
  request_number: string;

  @PrimaryColumn({ type: "varchar", length: 25 })
  document_number: string;

  @Column({ type: "varchar", nullable: true })
  request_date: string;

  @Column({ type: "varchar", nullable: true })
  supplier: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  description: string;

  @Column({ type: "varchar", nullable: true })
  remarks: string;

  @Column({ type: "varchar", nullable: true })
  amount: string;

  @Column({ type: "varchar", nullable: true })
  department_code: string;

  @Column({ type: "varchar", length: 15 })
  flow_code: string;

  @Column({ type: "int", nullable: true })
  flow_level_initial: number;

  @Column({ type: "int", nullable: true })
  flow_level_running: number;

  @Column({ type: "int", nullable: true })
  flow_level_final: number;

  @Column({ type: "varchar", nullable: true })
  company_code: string;

  @Column({ type: "varchar", nullable: true })
  create_user: string;

  @Column({ type: "varchar", nullable: true })
  create_date: string;

  @Column({ type: "varchar", nullable: true })
  fa_uploaded: string;

  @Column({ type: "varchar", nullable: true })
  final_approved: string;

  @Column({ type: "varchar", nullable: true })
  purch_status: string;

  @Column({ type: "varchar", nullable: true })
  sort_order: string;

  @Column({ type: "varchar", nullable: true })
  last_action: string;

  @Column({ type: "varchar", nullable: true })
  last_updated: string;

  @Column({ type: "varchar", nullable: true })
  project_code: string;

  @Column({ type: "varchar", nullable: true })
  flow_type: string;

  @Column({ type: "varchar", nullable: true })
  status: string;

  @Column({ type: "varchar", nullable: true })
  project_name: string;

  @Column({ type: "varchar", nullable: true })
  document_type: string;
}
