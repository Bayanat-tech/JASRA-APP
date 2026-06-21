// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrDivision } from "../../interfaces/Hr/hr_division";

// Define the HrDivision entity
@Entity(constants.TABLE.MS_HR_DIVISION)
export class HrDivision implements IHrDivision {
  // Company code attribute (composite primary key)
  @PrimaryColumn({ type: "varchar2", name: "COMPANY_CODE", length: 5, nullable: false })
  company_code!: string;

  // Division code attribute (composite primary key)
  @PrimaryColumn({ type: "varchar2", name: "DIV_CODE", length: 5, nullable: false })
  div_code!: string;

  // Division name attribute
  @Column({ type: "varchar2", name: "DIV_NAME", length: 50, nullable: false })
  div_name!: string;

  // Division short name attribute
  @Column({ type: "varchar2", name: "DIV_SHORT_NAME", length: 10, nullable: false })
  div_short_name!: string;

  // Division address 1 attribute
  @Column({ type: "varchar2", name: "DIV_ADDRESS1", length: 50, nullable: true })
  div_address1!: string;

  // Division address 2 attribute
  @Column({ type: "varchar2", name: "DIV_ADDRESS2", length: 50, nullable: true })
  div_address2!: string;

  // Division address 3 attribute
  @Column({ type: "varchar2", name: "DIV_ADDRESS3", length: 50, nullable: true })
  div_address3!: string;

  // Country code attribute
  @Column({ type: "varchar2", name: "COUNTRY_CODE", length: 5, nullable: true })
  country_code!: string;

  // Phone number attribute
  @Column({ type: "varchar2", name: "PHONE", length: 25, nullable: true })
  phone!: string;

  // Fax number attribute
  @Column({ type: "varchar2", name: "FAX", length: 25, nullable: true })
  fax!: string;

  // Email address attribute
  @Column({ type: "varchar2", name: "EMAIL", length: 50, nullable: true })
  email!: string;

  // Division head ID attribute
  @Column({ type: "varchar2", name: "DIV_HEAD_ID", length: 10, nullable: true })
  div_head_id!: string;

  // Remarks attribute
  @Column({ type: "varchar2", name: "REMARKS", length: 100, nullable: true })
  remarks!: string;

  // Status attribute
  @Column({ type: "varchar2", name: "STATUS", length: 1, nullable: false })
  status!: string;

  // User ID attribute
  @Column({ type: "varchar2", name: "USER_ID", length: 10, nullable: true })
  user_id!: string;

  // User date attribute
  @Column({ type: "date", name: "USER_DT", nullable: true })
  user_dt!: Date;

  // Enterprise code attribute (note: fixed typo from "enterprice_code")
  @Column({ type: "varchar2", name: "ENTERPRISE_CODE", length: 5, nullable: true })
  enterprice_code!: string;

  // Payroll date attribute
  @Column({ type: "date", name: "PAYROLL_DATE", nullable: true })
  payroll_date!: Date;

  // Payroll status attribute
  @Column({ type: "varchar2", name: "PAYROLL_STATUS", length: 1, nullable: true })
  payroll_status!: string;

  // Normal working hours attribute
  @Column({ type: "number", name: "NORMAL_WORKING_HRS", nullable: true })
  normal_working_hrs!: number;

  // Day off 1 attribute
  @Column({ type: "varchar2", name: "DAY_OFF1", length: 1, nullable: true })
  day_off1!: string;

  // Day off 2 attribute
  @Column({ type: "varchar2", name: "DAY_OFF2", length: 1, nullable: true })
  day_off2!: string;

  // HR representative attribute
  @Column({ type: "varchar2", name: "HR_REPRESENTATIVE", length: 10, nullable: true })
  hr_representative!: string;

  // Pay month attribute
  @Column({ type: "number", name: "PAY_MONTH", precision: 3, nullable: true })
  pay_month!: number;

  // Pay year attribute
  @Column({ type: "number", name: "PAY_YEAR", precision: 5, nullable: true })
  pay_year!: number;

  // Payroll calculation type attribute
  @Column({ type: "varchar2", name: "PAYROLL_CALC_TYPE", length: 1, nullable: true })
  payroll_calc_type!: string;

  // Day off 1 half day attribute
  @Column({ type: "varchar2", name: "DAY_OFF1_HALF_DAY", length: 1, nullable: true })
  day_off1_half_day!: string;

  // Day off 2 half day attribute
  @Column({ type: "varchar2", name: "DAY_OFF2_HALF_DAY", length: 1, nullable: true })
  day_off2_half_day!: string;

  // Financial year start attribute
  @Column({ type: "date", name: "FIN_YEAR_START", nullable: true })
  fin_year_start!: Date;

  // Financial year end attribute
  @Column({ type: "date", name: "FIN_YEAR_END", nullable: true })
  fin_year_end!: Date;

  // Bank name for invoice attribute
  @Column({ type: "varchar2", name: "BANK_NAME_INV", length: 50, nullable: true })
  bank_name_inv!: string;

  // Account code for invoice attribute
  @Column({ type: "varchar2", name: "AC_CODE_INV", length: 50, nullable: true })
  ac_code_inv!: string;

  // Reference number for invoice attribute
  @Column({ type: "varchar2", name: "REFERENCE_NO_INV", length: 50, nullable: true })
  reference_no_inv!: string;

  // Bank address for invoice attribute
  @Column({ type: "varchar2", name: "BANK_ADDRESS_INV", length: 50, nullable: true })
  bank_address_inv!: string;

  // Swift code for invoice attribute
  @Column({ type: "varchar2", name: "SWIFT_CODE_INV", length: 50, nullable: true })
  swift_code_inv!: string;

  // Employee document path attribute
  @Column({ type: "varchar2", name: "EMP_DOCUMENT_PATH", length: 200, nullable: true })
  emp_document_path!: string;

  // Payroll cutoff date attribute
  @Column({ type: "date", name: "PAYROLL_CUTOFF_DATE", nullable: true })
  payroll_cutoff_date!: Date;

  // Payroll day attribute
  @Column({ type: "number", name: "PAYROLL_DAY", nullable: true })
  payroll_day!: number;

  // Employee account group attribute
  @Column({ type: "varchar2", name: "EMP_ACGROUP", length: 10, nullable: true })
  emp_acgroup!: string;

  // Employee count attribute
  @Column({ type: "number", name: "EMP_CNT", nullable: true })
  emp_cnt!: number;

  // Transaction number attribute
  @Column({ type: "varchar2", name: "TRN_NO", length: 20, nullable: true })
  trn_no!: string;

  // Company logo attribute
  @Column({ type: "varchar2", name: "COMP_LOGO", length: 100, nullable: true })
  comp_logo!: string;

  // Logo title attribute
  @Column({ type: "varchar2", name: "LOGO_TITLE", length: 100, nullable: true })
  logo_title!: string;

  // Default grade attribute
  @Column({ type: "varchar2", name: "DEFAULT_GRADE", length: 5, nullable: true })
  default_grade!: string;

  // Employer EID attribute
  @Column({ type: "varchar2", name: "EMPLOYER_EID", length: 50, nullable: true })
  employer_eid!: string;

  // Payer EID attribute
  @Column({ type: "varchar2", name: "PAYER_EID", length: 50, nullable: true })
  payer_eid!: string;

  // Payer QID attribute
  @Column({ type: "varchar2", name: "PAYER_QID", length: 50, nullable: true })
  payer_qid!: string;

  // Payer bank attribute
  @Column({ type: "varchar2", name: "PAYER_BANK", length: 10, nullable: true })
  payer_bank!: string;

  // Payer IBAN attribute
  @Column({ type: "varchar2", name: "PAYER_IBAN", length: 150, nullable: true })
  payer_iban!: string;

  // Created by attribute
  @Column({ type: "varchar2", name: "CREATED_BY", length: 20, nullable: true })
  created_by!: string;

  // Updated by attribute
  @Column({ type: "varchar2", name: "UPDATED_BY", length: 50, nullable: true })
  updated_by!: string;

  // Created at attribute (automatically managed)
  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp", nullable: true })
  created_at!: Date;

  // Updated at attribute (automatically managed)
  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp", nullable: true })
  updated_at!: Date;
}