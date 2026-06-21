import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("MATERIAL_REQUEST_HEADER")
export class MaterialRequestHeader {
  @PrimaryColumn({ type: "varchar2", length: 25 })
  request_number: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  request_date: Date;

  @Column({ type: "varchar2", length: 2000, nullable: true })
  description?: string;

  @Column({ type: "varchar2", length: 1000, nullable: true })
  remarks?: string;

  @Column({ type: "number", precision: 13, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  department_code?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  flow_code?: string;

  @Column({ type: "number", precision: 5, nullable: true })
  flow_level_initial?: number;

  @Column({ type: "number", precision: 5, nullable: true })
  flow_level_running?: number;

  @Column({ type: "number", precision: 5, nullable: true })
  flow_level_final?: number;

  @Column({ type: "varchar2", length: 20, default: 'BSG' })
  company_code: string;

  @Column({ type: "number", precision: 5, scale: 2, nullable: true })
  currency_rate?: number;

  @Column({ type: "timestamp", nullable: true })
  user_dt?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true })
  user_id?: string;

  @Column({ type: "char", length: 1, default: 'N' })
  fa_uploaded: string;

  @Column({ type: "varchar2", length: 3, nullable: true })
  final_approved?: string;

  @Column({ type: "varchar2", length: 3000, nullable: true })
  remarks_histry?: string;

  @Column({ type: "varchar2", length: 5, nullable: true })
  curr_code?: string;

  @Column({ type: "varchar2", length: 10, nullable: true })
  create_user?: string;

  @Column({ type: "timestamp", nullable: true })
  create_date?: Date;

  @Column({ type: "varchar2", length: 10, nullable: true })
  last_updated?: string;

  @Column({ type: "varchar2", length: 35, nullable: true })
  last_action?: string;

  @Column({ type: "number", precision: 5, nullable: true })
  history_serial?: number;

  @Column({ type: "varchar2", length: 400, nullable: true })
  attach_file_name?: string;

  @Column({ type: "varchar2", length: 400, nullable: true })
  attach_file_name1?: string;

  @Column({ type: "varchar2", length: 400, nullable: true })
  attach_file_name2?: string;

  @Column({ type: "varchar2", length: 3000, nullable: true })
  reject_histry?: string;

  @Column({ type: "varchar2", length: 3000, nullable: true })
  sendback_histry?: string;

  @Column({ type: "number", precision: 20, nullable: true })
  req_doc_no?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  req_div_code?: string;

  @Column({ type: "varchar2", length: 50, nullable: true })
  cost_code?: string;

  @Column({ type: "number", precision: 13, scale: 2, default: 0.0 })
  po_amount: number;

  @Column({ type: "timestamp", nullable: true })
  doc_date?: Date;

  @Column({ type: "varchar2", length: 20, nullable: true })
  project_code?: string;

  @Column({ type: "timestamp", nullable: true })
  need_by_date?: Date;

  @Column({ type: "varchar2", length: 3, nullable: true })
  status?: string;

  @Column({ type: "number", precision: 10, nullable: true })
  project_pr_no?: number;

  @Column({ type: "varchar2", length: 5, nullable: true })
  div_code?: string;

  @Column({ type: "timestamp", nullable: true })
  final_approved_date?: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @Column({ type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  flow_type?: string;

  @Column({ type: "varchar2", length: 15, nullable: true })
  project_code_from?: string;

  @Column({ type: "varchar2", length: 15, nullable: true })
  project_code_to?: string;

  @Column({ type: "varchar2", length: 100, nullable: true })
  requestor_name?: string;
}
