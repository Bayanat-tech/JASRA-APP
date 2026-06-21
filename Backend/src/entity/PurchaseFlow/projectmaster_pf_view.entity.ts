import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.VIEW.VW_MS_PS_PROJECT_MASTER)
export class VProjectMaster {
  @PrimaryColumn({ name: "PROJECT_CODE", type: "varchar2", length: 15 })
  project_code!: string;

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code!: string;

  @Column({ name: "PROJECT_NAME", type: "varchar2", length: 200, nullable: true })
  project_name!: string;

  @Column({ name: "DIV_NAME", type: "varchar2", length: 100, nullable: true })
  div_name!: string;

  @Column({ name: "TOTAL_PROJECT_COST", type: "number", precision: 10, scale: 2, nullable: true })
  total_project_cost!: number;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by!: string;

  @Column({ name: "CREATED_AT", type: "timestamp", nullable: true, default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ name: "UPDATED_AT", type: "timestamp", nullable: true, default: () => "CURRENT_TIMESTAMP" })
  updated_at!: Date;

  @Column({ name: "DIV_CODE", type: "varchar2", length: 50 })
  div_code!: string;

  @Column({ name: "PRNO_PRE_FIX", type: "varchar2", nullable: true })
  prno_pre_fix!: string;

  @Column({ name: "FLAG_PROJ_DEPARTMENT", type: "varchar2", nullable: true })
  flag_proj_department!: string;

  @Column({ name: "PROJECT_TYPE", type: "varchar2", nullable: false })
  project_type!: string;

  @Column({ name: "FACILITY_MGR_NAME", type: "varchar2", length: 100, nullable: true })
  facility_mgr_name!: string;

  @Column({ name: "FACILITY_MGR_EMAIL", type: "varchar2", nullable: true })
  facility_mgr_email!: string;

  @Column({ name: "FACILITY_MGR_PHONE", type: "varchar2", nullable: true })
  facility_mgr_phone!: string;

  @Column({ name: "PROJECT_DATE_FROM", type: "timestamp", nullable: true })
  project_date_from!: Date;

  @Column({ name: "PROJECT_DATE_TO", type: "timestamp", nullable: true })
  project_date_to!: Date;

  @Column({ name: "PO_AMOUNT", type: "number", precision: 15, scale: 2, nullable: true })
  po_amount!: number;

  @Column({ name: "PR_AMOUNT", type: "number", precision: 15, scale: 2, nullable: true })
  pr_amount!: number;

  @Column({ name: "PREV_APPR_AMT", type: "number", precision: 15, scale: 2, nullable: true })
  prev_appr_amt!: number;
}
