import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { IHrEmployee } from "../../interfaces/Hr/hr_employee";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_HR_EMPLOYEE)
@Index("IDX_HR_EMPLOYEE_ALT_ID_EMP_CODE", ["alternate_id", "employee_code"], { unique: true })
export class HrEmployee implements IHrEmployee {
  // Unique identifier for the employee
  @Column({ name: "employee_id", type: "varchar2", length: 255, nullable: true })
  employee_id: string;

  // Unique code for the employee (Primary Key)
  @PrimaryColumn({ name: "employee_code", type: "varchar2", length: 255 })
  employee_code: string;

  // Alternate identifier for the employee
  @Column({ name: "alternate_id", type: "varchar2", length: 255, nullable: false })
  alternate_id: string;

  // Title of the employee
  @Column({ name: "title", type: "varchar2", length: 255, nullable: true })
  title: string;

  // First name of the employee
  @Column({ name: "first_name", type: "varchar2", length: 255, nullable: true })
  first_name: string;

  // Second name of the employee
  @Column({ name: "second_name", type: "varchar2", length: 255, nullable: true })
  second_name: string;

  // Third name of the employee
  @Column({ name: "third_name", type: "varchar2", length: 255, nullable: true })
  third_name: string;

  // Fourth name of the employee
  @Column({ name: "fourth_name", type: "varchar2", length: 255, nullable: true })
  fourth_name: string;

  // Last name of the employee
  @Column({ name: "last_name", type: "varchar2", length: 255, nullable: true })
  last_name: string;

  // Family name of the employee
  @Column({ name: "family_name", type: "varchar2", length: 255, nullable: true })
  family_name: string;

  // Alias name of the employee
  @Column({ name: "alias_name", type: "varchar2", length: 255, nullable: true })
  alias_name: string;

  // Reporting name of the employee
  @Column({ name: "rpt_name", type: "varchar2", length: 255, nullable: true })
  rpt_name: string;

  // Passport name of the employee
  @Column({ name: "ppt_name", type: "varchar2", length: 255, nullable: true })
  ppt_name: string;

  // Passport number of the employee
  @Column({ name: "ppt_no", type: "varchar2", length: 255, nullable: true })
  ppt_no: string;

  // Passport country of the employee
  @Column({ name: "ppt_country", type: "varchar2", length: 255, nullable: true })
  ppt_country: string;

  // Passport valid from date
  @Column({ name: "ppt_valid_from", type: "date", nullable: true })
  ppt_valid_from: Date;

  // Passport valid to date
  @Column({ name: "ppt_valid_to", type: "date", nullable: true })
  ppt_valid_to: Date;

  // Passport status of the employee
  @Column({ name: "ppt_status", type: "varchar2", length: 255, nullable: true })
  ppt_status: string;

  // Designation code of the employee
  @Column({ name: "desg_code", type: "varchar2", length: 255, nullable: true })
  desg_code: string;

  // Labour designation code of the employee
  @Column({ name: "labour_desg_code", type: "varchar2", length: 255, nullable: true })
  labour_desg_code: string;

  // Position ID of the employee
  @Column({ name: "position_id", type: "number", nullable: true })
  position_id: number;

  // Sub-position ID of the employee
  @Column({ name: "sub_position_id", type: "number", nullable: true })
  sub_position_id: number;

  // Grade code of the employee
  @Column({ name: "grade_code", type: "varchar2", length: 255, nullable: true })
  grade_code: string;

  // Overtime eligibility of the employee
  @Column({ name: "ot_eligibility", type: "varchar2", length: 255, nullable: true })
  ot_eligibility: string;

  // Birth date of the employee
  @Column({ name: "birth_date", type: "date", nullable: true })
  birth_date: Date;

  // Birth place of the employee
  @Column({ name: "birth_place", type: "varchar2", length: 255, nullable: true })
  birth_place: string;

  // Gender of the employee
  @Column({ name: "gender", type: "varchar2", length: 255, nullable: true })
  gender: string;

  // Father's name of the employee
  @Column({ name: "father_name", type: "varchar2", length: 255, nullable: true })
  father_name: string;

  // Mother's name of the employee
  @Column({ name: "mother_name", type: "varchar2", length: 255, nullable: true })
  mother_name: string;

  // Marital status of the employee
  @Column({ name: "marrital_status", type: "varchar2", length: 255, nullable: true })
  marrital_status: string;

  // Spouse's name of the employee
  @Column({ name: "spouse_name", type: "varchar2", length: 255, nullable: true })
  spouse_name: string;

  // Number of children of the employee
  @Column({ name: "no_of_children", type: "number", nullable: true })
  no_of_children: number;

  // Employee's blood group
  @Column({ name: "blood_group", type: "varchar2", length: 255, nullable: true })
  blood_group: string;

  // Employee's nationality
  @Column({ name: "nationality", type: "varchar2", length: 255, nullable: true })
  nationality: string;

  // Employee's religion code
  @Column({ name: "religion_code", type: "number", nullable: true })
  religion_code: number;

  // Employee's caste code
  @Column({ name: "caste_code", type: "number", nullable: true })
  caste_code: number;

  // Employee's country code
  @Column({ name: "country_code", type: "varchar2", length: 255, nullable: true })
  country_code: string;

  // Employee's permanent address line 1
  @Column({ name: "perm_address1", type: "varchar2", length: 255, nullable: true })
  perm_address1: string;

  // Employee's permanent address line 2
  @Column({ name: "perm_address2", type: "varchar2", length: 255, nullable: true })
  perm_address2: string;

  // Employee's permanent address line 3
  @Column({ name: "perm_address3", type: "varchar2", length: 255, nullable: true })
  perm_address3: string;

  // Employee's permanent phone number
  @Column({ name: "perm_phone", type: "varchar2", length: 255, nullable: true })
  perm_phone: string;

  // Employee's permanent mobile number
  @Column({ name: "perm_mobile", type: "varchar2", length: 255, nullable: true })
  perm_mobile: string;

  // Employee's local address line 1
  @Column({ name: "local_address1", type: "varchar2", length: 255, nullable: true })
  local_address1: string;

  // Employee's local address line 2
  @Column({ name: "local_address2", type: "varchar2", length: 255, nullable: true })
  local_address2: string;

  // Employee's local address line 3
  @Column({ name: "local_address3", type: "varchar2", length: 255, nullable: true })
  local_address3: string;

  // Employee's local phone number
  @Column({ name: "local_phone", type: "varchar2", length: 255, nullable: true })
  local_phone: string;

  // Employee's local mobile number
  @Column({ name: "local_mobile", type: "varchar2", length: 255, nullable: true })
  local_mobile: string;

  // Employee's emergency contact address line 1
  @Column({ name: "emgr_address1", type: "varchar2", length: 255, nullable: true })
  emgr_address1: string;

  // Employee's emergency contact address line 2
  @Column({ name: "emgr_address2", type: "varchar2", length: 255, nullable: true })
  emgr_address2: string;

  // Employee's emergency contact address line 3
  @Column({ name: "emgr_address3", type: "varchar2", length: 255, nullable: true })
  emgr_address3: string;

  // Employee's emergency contact phone number
  @Column({ name: "emgr_phone", type: "varchar2", length: 255, nullable: true })
  emgr_phone: string;

  // Employee's emergency contact mobile number
  @Column({ name: "emgr_mobile", type: "varchar2", length: 255, nullable: true })
  emgr_mobile: string;

  // Employee's emergency contact person
  @Column({ name: "emgr_contact_person", type: "varchar2", length: 255, nullable: true })
  emgr_contact_person: string;

  // Employee's office phone number
  @Column({ name: "phone_office", type: "varchar2", length: 255, nullable: true })
  phone_office: string;

  // Employee's office phone extension
  @Column({ name: "phone_office_extn", type: "varchar2", length: 255, nullable: true })
  phone_office_extn: string;

  // Employee's mobile number
  @Column({ name: "mobile_no", type: "varchar2", length: 255, nullable: true })
  mobile_no: string;

  // Employee's official email
  @Column({ name: "email_official", type: "varchar2", length: 255, nullable: true })
  email_official: string;

  // Employee's personal email
  @Column({ name: "email_personal", type: "varchar2", length: 255, nullable: true })
  email_personal: string;

  // Employee's join date
  @Column({ name: "join_date", type: "date", nullable: true })
  join_date: Date;

  // Probation details
  @Column({ name: "probation_end_date", type: "date", nullable: true })
  probation_end_date: Date;

  @Column({ name: "probation_confirm_date", type: "date", nullable: true })
  probation_confirm_date: Date;

  // Payroll details
  @Column({ name: "payroll_start_date", type: "date", nullable: true })
  payroll_start_date: Date;

  @Column({ name: "gratuity_start_date", type: "date", nullable: true })
  gratuity_start_date: Date;

  @Column({ name: "gratuity_slab", type: "number", nullable: true })
  gratuity_slab: number;

  // Contract details
  @Column({ name: "contract_type", type: "varchar2", length: 255, nullable: true })
  contract_type: string;

  @Column({ name: "contract_start_date", type: "date", nullable: true })
  contract_start_date: Date;

  @Column({ name: "contract_end_date", type: "date", nullable: true })
  contract_end_date: Date;

  @Column({ name: "contract_renewable", type: "varchar2", length: 255, nullable: true })
  contract_renewable: string;

  // Sponsor and passport details
  @Column({ name: "sponsor_id", type: "varchar2", length: 255, nullable: true })
  sponsor_id: string;

  @Column({ name: "passport_with", type: "varchar2", length: 255, nullable: true })
  passport_with: string;

  // Manager and currency details
  @Column({ name: "manager_code", type: "varchar2", length: 255, nullable: true })
  manager_code: string;

  @Column({ name: "currency_id", type: "varchar2", length: 255, nullable: true })
  currency_id: string;

  @Column({ name: "exch_rate", type: "number", nullable: true })
  exch_rate: number;

  // Payment and payroll details
  @Column({ name: "payment_mode", type: "varchar2", length: 255, nullable: true })
  payment_mode: string;

  @Column({ name: "include_in_payroll", type: "varchar2", length: 255, nullable: true })
  include_in_payroll: string;

  @Column({ name: "payslip_via_email", type: "varchar2", length: 255, nullable: true })
  payslip_via_email: string;

  @Column({ name: "payslip_email_id", type: "varchar2", length: 255, nullable: true })
  payslip_email_id: string;

  // Category and airport details
  @Column({ name: "category_code", type: "varchar2", length: 255, nullable: true })
  category_code: string;

  @Column({ name: "airport_code", type: "varchar2", length: 255, nullable: true })
  airport_code: string;

  @Column({ name: "accom_code", type: "varchar2", length: 255, nullable: true })
  accom_code: string;

  // Labour card details
  @Column({ name: "labourcard_no", type: "varchar2", length: 255, nullable: true })
  labourcard_no: string;

  @Column({ name: "labourcard_valid_from", type: "date", nullable: true })
  labourcard_valid_from: Date;

  @Column({ name: "labourcard_valid_to", type: "date", nullable: true })
  labourcard_valid_to: Date;

  @Column({ name: "labourcard_status", type: "varchar2", length: 255, nullable: true })
  labourcard_status: string;

  // Visa details
  @Column({ name: "visa_type", type: "varchar2", length: 255, nullable: true })
  visa_type: string;

  @Column({ name: "visa_valid_from", type: "date", nullable: true })
  visa_valid_from: Date;

  @Column({ name: "visa_valid_to", type: "date", nullable: true })
  visa_valid_to: Date;

  // Ticket eligibility details
  @Column({ name: "ticket_eligibility", type: "varchar2", length: 255, nullable: true })
  ticket_eligibility: string;

  // TA, TC, and TI details
  @Column({ name: "ta_no", type: "number", nullable: true })
  ta_no: number;

  @Column({ name: "tc_no", type: "number", nullable: true })
  tc_no: number;

  @Column({ name: "ti_no", type: "number", nullable: true })
  ti_no: number;

  // Employer and driving license details
  @Column({ name: "employer_code", type: "varchar2", length: 255, nullable: true })
  employer_code: string;

  @Column({ name: "driving_license_no", type: "varchar2", length: 255, nullable: true })
  driving_license_no: string;

  @Column({ name: "dl_issue_place", type: "varchar2", length: 255, nullable: true })
  dl_issue_place: string;

  @Column({ name: "dl_issue_date", type: "date", nullable: true })
  dl_issue_date: Date;

  @Column({ name: "dl_valid_upto", type: "date", nullable: true })
  dl_valid_upto: Date;

  // Leave and status details
  @Column({ name: "on_leave", type: "varchar2", length: 255, nullable: true })
  on_leave: string;

  @Column({ name: "emp_status", type: "varchar2", length: 255, nullable: true })
  emp_status: string;

  // Separation details
  @Column({ name: "separation_req_date", type: "date", nullable: true })
  separation_req_date: Date;

  @Column({ name: "separation_reason", type: "varchar2", length: 255, nullable: true })
  separation_reason: string;

  @Column({ name: "separation_eff_date", type: "date", nullable: true })
  separation_eff_date: Date;

  // Rehire details
  @Column({ name: "rehire_date", type: "date", nullable: true })
  rehire_date: Date;

  // Day off details
  @Column({ name: "day_off1", type: "varchar2", length: 255, nullable: true })
  day_off1: string;

  @Column({ name: "day_off2", type: "varchar2", length: 255, nullable: true })
  day_off2: string;

  // Employee photo and last dates
  @Column({ name: "emp_photo", type: "varchar2", length: 255, nullable: true })
  emp_photo: string;

  @Column({ name: "last_annual_vaccation_date", type: "date", nullable: true })
  last_annual_vaccation_date: Date;

  @Column({ name: "last_appraisal_date", type: "date", nullable: true })
  last_appraisal_date: Date;

  @Column({ name: "last_desg_change_date", type: "date", nullable: true })
  last_desg_change_date: Date;

  @Column({ name: "last_grade_change_date", type: "date", nullable: true })
  last_grade_change_date: Date;

  // Salary bank and account details
  @Column({ name: "salary_bank_code", type: "varchar2", length: 255, nullable: true })
  salary_bank_code: string;

  @Column({ name: "salary_acct_no", type: "varchar2", length: 255, nullable: true })
  salary_acct_no: string;

  // Bank loan and accommodation details
  @Column({ name: "has_bank_loan", type: "varchar2", length: 255, nullable: true })
  has_bank_loan: string;

  @Column({ name: "accom_eligibility", type: "varchar2", length: 255, nullable: true })
  accom_eligibility: string;

  // Mid-month payroll and country details
  @Column({ name: "include_in_midmonth_payroll", type: "varchar2", length: 255, nullable: true })
  include_in_midmonth_payroll: string;

  @Column({ name: "country_living_in", type: "varchar2", length: 255, nullable: true })
  country_living_in: string;

  // Company, division, department, and section details
  @Column({ name: "company_code", type: "varchar2", length: 255, nullable: true })
  company_code: string;

  @Column({ name: "div_code", type: "varchar2", length: 255, nullable: true })
  div_code: string;

  @Column({ name: "dept_code", type: "varchar2", length: 255, nullable: true })
  dept_code: string;

  @Column({ name: "section_code", type: "varchar2", length: 255, nullable: true })
  section_code: string;

  // Employee and loan account references
  @Column({ name: "emp_acref", type: "varchar2", length: 255, nullable: true })
  emp_acref: string;

  @Column({ name: "loan_acref", type: "varchar2", length: 255, nullable: true })
  loan_acref: string;

  // National and expat details
  @Column({ name: "national_expat", type: "varchar2", length: 255, nullable: true })
  national_expat: string;

  // Ticket dependent and eligible period details
  @Column({ name: "ticket_dpend_adult", type: "number", nullable: true })
  ticket_dpend_adult: number;

  @Column({ name: "ticket_eligible_period", type: "number", nullable: true })
  ticket_eligible_period: number;

  // Insurance company and card details
  @Column({ name: "ins_company", type: "varchar2", length: 255, nullable: true })
  ins_company: string;

  @Column({ name: "ins_card_no", type: "varchar2", length: 255, nullable: true })
  ins_card_no: string;

  @Column({ name: "ins_card_type", type: "varchar2", length: 255, nullable: true })
  ins_card_type: string;

  @Column({ name: "ins_card_issue_dt", type: "date", nullable: true })
  ins_card_issue_dt: Date;

  @Column({ name: "isn_card_exp_dt", type: "date", nullable: true })
  isn_card_exp_dt: Date;

  @Column({ name: "ins_card_exp_dt", type: "date", nullable: true })
  ins_card_exp_dt: Date;

  // Pasi number and JV passed details
  @Column({ name: "pasi_no", type: "varchar2", length: 255, nullable: true })
  pasi_no: string;

  @Column({ name: "jvpassed", type: "varchar2", length: 255, nullable: true })
  jvpassed: string;

  // Company bank code and payroll process details
  @Column({ name: "company_bank_code", type: "varchar2", length: 255, nullable: true })
  company_bank_code: string;

  @Column({ name: "payroll_process", type: "varchar2", length: 255, nullable: true })
  payroll_process: string;

  // Resume date and mobile number details
  @Column({ name: "resume_date", type: "date", nullable: true })
  resume_date: Date;

  @Column({ name: "mobile_no2", type: "varchar2", length: 255, nullable: true })
  mobile_no2: string;

  // Memo posted and health expiry details
  @Column({ name: "memo_posted", type: "varchar2", length: 255, nullable: true })
  memo_posted: string;

  @Column({ name: "health_expiry", type: "date", nullable: true })
  health_expiry: Date;

  // Employee IBAN number and separation deletion restriction details
  @Column({ name: "emp_iban_no", type: "varchar2", length: 255, nullable: true })
  emp_iban_no: string;

  @Column({ name: "sep_del_restrict", type: "varchar2", length: 255, nullable: true })
  sep_del_restrict: string;

  // Allow pay delete and salary remarks details
  @Column({ name: "allow_pay_delete", type: "varchar2", length: 255, nullable: true })
  allow_pay_delete: string;

  @Column({ name: "salary_remarks", type: "varchar2", length: 255, nullable: true })
  salary_remarks: string;

  // Salary multi-currency and employee regular hours details
  @Column({ name: "sal_multi_curr", type: "varchar2", length: 255, nullable: true })
  sal_multi_curr: string;

  @Column({ name: "emp_reg_hours", type: "number", nullable: true })
  emp_reg_hours: number;

  // IP information and calculation month add amount details
  @Column({ name: "ip_info", type: "varchar2", length: 255, nullable: true })
  ip_info: string;

  @Column({ name: "calcmonth_add_amt", type: "number", nullable: true })
  calcmonth_add_amt: number;

  // Payroll email send and visa name details
  @Column({ name: "payroll_email_send", type: "varchar2", length: 255, nullable: true })
  payroll_email_send: string;

  @Column({ name: "visa_name", type: "varchar2", length: 255, nullable: true })
  visa_name: string;

  // Project ID and updated by details
  @Column({ name: "project_id", type: "varchar2", length: 255, nullable: true })
  project_id: string;

  @Column({ name: "updated_by", type: "varchar2", length: 255, nullable: true })
  updated_by: string;

  // Created by details
  @Column({ name: "created_by", type: "varchar2", length: 255, nullable: true })
  created_by: string;

  // Auto-generated timestamps
  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updated_at: Date;
}