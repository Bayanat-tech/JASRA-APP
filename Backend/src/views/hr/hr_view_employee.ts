import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IHrViewEmp } from "../../interfaces/Hr/hr_view_employee";

@Entity("VW_HR_EMPLOYEE")
export class HrViewEmp implements IHrViewEmp {
  @PrimaryColumn({ name: "employee_id", type: "varchar2", length: 10 })
  employee_id: string;

  @PrimaryColumn({ name: "employee_code", type: "varchar2", length: 10 })
  employee_code: string;

  @Column({ name: "alternate_id", type: "varchar2", length: 10, nullable: true })
  alternate_id: string;

  @Column({ name: "rpt_name", type: "varchar2", length: 50, nullable: true })
  rpt_name: string;

  @Column({ name: "desg_code", type: "varchar2", length: 5, nullable: true })
  desg_code: string;

  @Column({ name: "desg_name", type: "varchar2", length: 50, nullable: true })
  desg_name: string;

  @Column({ name: "airport_code", type: "varchar2", length: 5, nullable: true })
  airport_code: string;

  @Column({ name: "company_code", type: "varchar2", length: 5, nullable: true })
  company_code: string;

  @Column({ name: "comp_name", type: "varchar2", length: 50, nullable: true })
  comp_name: string;

  @Column({ name: "grade_code", type: "varchar2", length: 5, nullable: true })
  grade_code: string;

  @Column({ name: "grade_name", type: "varchar2", length: 50, nullable: true })
  grade_name: string;

  @Column({ name: "gender", type: "varchar2", length: 1, nullable: true })
  gender: string;

  @Column({ name: "nationality", type: "varchar2", length: 50, nullable: true })
  nationality: string;

  @Column({ name: "mobile_no", type: "varchar2", length: 15, nullable: true })
  mobile_no: string;

  @Column({ name: "payment_mode", type: "varchar2", length: 1, nullable: true })
  payment_mode: string;

  @Column({ name: "category_code", type: "varchar2", length: 5, nullable: true })
  category_code: string;

  @Column({ name: "category_name", type: "varchar2", length: 50, nullable: true })
  category_name: string;

  @Column({ name: "div_code", type: "varchar2", length: 5, nullable: true })
  div_code: string;

  @Column({ name: "div_name", type: "varchar2", length: 50, nullable: true })
  div_name: string;

  @Column({ name: "dept_code", type: "varchar2", length: 5, nullable: true })
  dept_code: string;

  @Column({ name: "dept_name", type: "varchar2", length: 50, nullable: true })
  dept_name: string;

  @Column({ name: "section_code", type: "varchar2", length: 5, nullable: true })
  section_code: string;

  @Column({ name: "section_name", type: "varchar2", length: 50, nullable: true })
  section_name: string;

  @Column({ name: "user_id", type: "varchar2", length: 10, nullable: true })
  user_id: string;

  @Column({ name: "user_dt", type: "varchar2", nullable: true })
  user_dt: string;

  @Column({ name: "join_date", type: "date", nullable: true })
  join_date: Date;

  @Column({ name: "comp_payroll_date", type: "varchar2", nullable: true })
  comp_payroll_date: Date;

  @Column({ name: "cmp_payroll_day", type: "date", nullable: true })
  cmp_payroll_day: string;

  @Column({ name: "div_payroll_date", type: "date", nullable: true })
  div_payroll_date: Date;

  @Column({ name: "emp_status", type: "varchar2", length: 1, nullable: true })
  emp_status: string;

  @Column({ name: "include_in_payroll", type: "date", nullable: true })
  include_in_payroll: string;

  @Column({ name: "salary_bank_code", type: "varchar2", length: 10, nullable: true })
  salary_bank_code: string;

  @Column({ name: "salary_acct_no", type: "varchar2", length: 15, nullable: true })
  salary_acct_no: string;

  @Column({ name: "sal_processed", type: "number", nullable: true })
  sal_processed: number;

  @Column({ name: "pay_month", type: "number", nullable: true })
  pay_month: number;

  @Column({ name: "pay_year", type: "number", nullable: true })
  pay_year: number;

  @Column({ name: "sal_advance", type: "number", nullable: true })
  sal_advance: number;

  @Column({ name: "labour_desg_code", type: "varchar2", length: 5, nullable: true })
  labour_desg_code: string;

  @Column({ name: "adv_paid", type: "number", nullable: true })
  adv_paid: number;

  @Column({ name: "probation_end_date", type: "date", nullable: true })
  probation_end_date: Date;

  @Column({ name: "separation_eff_date", type: "date", nullable: true })
  separation_eff_date: Date;

  @Column({ name: "probation_confirm_date", type: "date", nullable: true })
  probation_confirm_date: Date;

  @Column({ name: "pasi_no", type: "varchar2", length: 10, nullable: true })
  pasi_no: string;

  @Column({ name: "payroll_process", type: "varchar2", length: 1, nullable: true })
  payroll_process: string;

  @Column({ name: "resume_dt", type: "date", nullable: true })
  resume_dt: Date;

  @Column({ name: "emp_acref", type: "varchar2", length: 10, nullable: true })
  emp_acref: string;

  @Column({ name: "passport_no", type: "varchar2", length: 15, nullable: true })
  passport_no: string;

  @Column({ name: "id_no", type: "varchar2", length: 15, nullable: true })
  id_no: string;

  @Column({ name: "memo_posted", type: "varchar2", length: 1, nullable: true })
  memo_posted: string;

  @Column({ name: "destn_port", type: "varchar2", length: 10, nullable: true })
  destn_port: string;

  @Column({ name: "adult_fare", type: "number", nullable: true })
  adult_fare: number;

  @Column({ name: "child_fare", type: "number", nullable: true })
  child_fare: number;

  @Column({ name: "infant_fare", type: "number", nullable: true })
  infant_fare: number;

  @Column({ name: "title", type: "varchar2", length: 50, nullable: true })
  title: string;

  @Column({ name: "company_bank_code", type: "varchar2", length: 10, nullable: true })
  company_bank_code: string;

  @Column({ name: "labour_card_no", type: "varchar2", length: 15, nullable: true })
  labour_card_no: string;

  @Column({ name: "passport_name", type: "varchar2", length: 50, nullable: true })
  passport_name: string;

  @Column({ name: "iban_no", type: "varchar2", length: 50, nullable: true })
  iban_no: string;

  @Column({ name: "main_bank", type: "varchar2", length: 50, nullable: true })
  main_bank: string;

  @Column({ name: "emp_photo", type: "varchar2", length: 255, nullable: true })
  emp_photo: string;

  @Column({ name: "updated_by", type: "varchar2", length: 50, nullable: true })
  updated_by: string;

  @Column({ name: "created_by", type: "varchar2", length: 20, nullable: true })
  created_by: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updated_at: Date;
}