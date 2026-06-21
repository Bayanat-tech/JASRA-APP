import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IHrSponsor } from "../../interfaces/Hr/hr_sponsor";

@Entity("MS_HR_SPONSOR")
export class HrSponsor implements IHrSponsor {
  @PrimaryColumn({ name: "sponsor_code", type: "varchar2", length: 5 })
  sponsor_code: string;

  @PrimaryColumn({ name: "company_code", type: "varchar2", length: 5 })
  company_code: string;

  @Column({ name: "sponsor_name", type: "varchar2", length: 50, nullable: true })
  sponsor_name: string;

  @Column({ name: "sponsor_short_name", type: "varchar2", length: 10, nullable: true })
  sponsor_short_name: string;

  @Column({ name: "trade_license_no", type: "varchar2", length: 15, nullable: true })
  trade_license_no: string;

  @Column({ name: "trade_license_exp_date", type: "date", nullable: true })
  trade_license_exp_date: Date;

  @Column({ name: "sponsor_address1", type: "varchar2", length: 50, nullable: true })
  sponsor_address1: string;

  @Column({ name: "sponsor_address2", type: "varchar2", length: 50, nullable: true })
  sponsor_address2: string;

  @Column({ name: "country_code", type: "varchar2", length: 5, nullable: true })
  country_code: string;

  @Column({ name: "no_of_visa", type: "number", nullable: true })
  no_of_visa: number;

  @Column({ name: "no_of_visit_visa", type: "number", nullable: true })
  no_of_visit_visa: number;

  @Column({ name: "sponsor_labor_no", type: "varchar2", length: 10, nullable: true })
  sponsor_labor_no: string;

  @Column({ name: "sponsor_immgr_no", type: "varchar2", length: 10, nullable: true })
  sponsor_immgr_no: string;

  @Column({ name: "sponsor_immgr_dt", type: "date", nullable: true })
  sponsor_immgr_dt: Date;

  @Column({ name: "labour_card_blocked", type: "varchar2", length: 10, nullable: true })
  labour_card_blocked: string;

  @Column({ name: "blocked_reason", type: "varchar2", length: 100, nullable: true })
  blocked_reason: string;

  @Column({ name: "remarks", type: "varchar2", length: 100, nullable: true })
  remarks: string;

  @Column({ name: "status", type: "varchar2", length: 1, nullable: true })
  status: string;

  @Column({ name: "updated_by", type: "varchar2", length: 50, nullable: true })
  updated_by: string;

  @Column({ name: "created_by", type: "varchar2", length: 20, nullable: true })
  created_by: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updated_at: Date;
}