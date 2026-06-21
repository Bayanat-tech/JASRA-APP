//combined all types in one
export type TEmployeeHr = TPersnolHr & TPayrollHr & TPassportHr & TContractHr & TSponsorHr & TIsuranceHr & TILPHr & TAirfareHr;
export type TTableEmployeeHr = TPersnolHr &
  TPayrollHr &
  TPassportHr &
  TContractHr &
  TSponsorHr &
  TIsuranceHr &
  TILPHr &
  TAirfareHr &
  TTableHr;
//Persnole information
export type TPersnolHr = {
  section_code: string;
  dept_code: string;
  div_code: string;
  emp_photo: string;
  employee_code: string;
  alternate_id: string;
  rpt_name: string;
  grade_code: string;
  desg_code: string;
  labour_desg_code: string;
  category_code: string;
  birth_date: Date;
  join_date: Date;
  probation_end_date: Date;
  probation_confirm_date: Date;
  emp_status: string;
  country_code: string;
  actions?: any;
};
export type TPayrollHr = {
  include_in_payroll: string;
  payroll_start_date: Date;
  payment_mode: string;
  company_bank_code: string;
  salary_acct_no: string;
  salary_bank_code: string;
  currency_id: string;
  exch_rate: number;
  emp_iban_no: string;
  actions?: any;
};

export type TPassportHr = {
  ppt_no: string;
  ppt_name: string;
  ppt_country: string;
  ppt_status: string;
  ppt_valid_from: Date;
  ppt_valid_to: Date;
  passport_with: string;
};
export type TContractHr = {
  contract_type: string;
  contract_start_date: Date;
  contract_end_date: Date | null;
  contract_renewable: string;
  contract_type_desc?: string;
};
export type TSponsorHr = {
  sponsor_id: string | number;
  visa_type: string;
  visa_valid_from: Date;
  visa_valid_to: Date | null;
};

export type TIsuranceHr = {
  ins_card_no: string;
  ins_card_issue_dt: Date;
  ins_card_exp_dt: Date;
  ins_card_type: string;
};

export type TILPHr = {
  labourcard_no: number;
  pasi_no: string;
  labourcard_valid_from: Date;
  labourcard_valid_to: Date;
  labourcard_status: string;
};

export type TAirfareHr = {
  airport_code: string;
  ticket_eligibility: string;
  ticket_dpend_adult: number;
  ta_no: number;
  tc_no: number;
  ti_no: number;
  ticket_eligible_period: number;
};
export type TTableHr = {
  Status: string;
  Designation: string;
  Division: string;
  Department: string;
  Section: string;
  Nationality: string;
  employee_code: string;
  alternate_id: string;
  rpt_name: string;
  join_date: Date;
  emp_status: string;
  labour_desg_code: string;
  div_name: string;
  dept_name: string;
  section_name: string;
  nationality: string;
  desg_name: string;
};

export type TGradeHr = {
  company_code: string;
  grade_code: string;
  grade_name: string;
  grade_short_name: string;
  ot_eligibility: string;
  airfare_entitlement: string;
  spouse_af_entitlement: string;
  dep_af_entitlement: string;
  medical_entitlement: string;
  spouse_med_entitlement: string;
  dep_med_entitlement: string;
  remarks: string;
  status: string;
  user_id: string;
  user_dt: Date;
  type: string;
  grade_status: string;
};

export type TDesgHr = {
  company_code: string;
  desg_code: string;
  desg_name: string;
  desg_short_name: string;
  remarks: string;
  status: string;
  user_id: string;
  user_dt: Date;
};

export type TFormalDesgHr = {
  company_code: string;
  labour_desg_code: string;
  labour_desg_name: string;
  labour_desg_short_name: string;
  remarks: string;
  status: string;
  updated_at?: Date;
  updated_by?: string;
  created_at?: Date;
  created_by?: string;
};
export type TCategoryHr = {
  company_code: string;
  category_code: string;
  category_name: string;
  category_short_name: string;
  remarks: string;
  status: string;
  updated_at?: string;
  created_at?: string;
  updated_by?: string;
  created_by?: string;
};

export type TBankHr = {
  bank_code: string;
  bank_name: string;
  bank_short_name: string;
  bank_addr1: string;
  bank_addr2: string;
  bank_addr3: string;
  country_code: string;
  main_bank_code: string;
  company_flag: string;
  comp_acct_code: string;
  company_code: string;
  phone: string;
  fax: string;
  email: string;
  remarks: string;
  status: string;
  updated_at?: Date;
  updated_by?: string;
  created_at?: Date;
  created_by?: string;
};

export type TSectionHr = {
  div_code: string;
  dept_code: string;
  section_code: string;
  section_name: string;
  section_short_name: string;
  sect_addr1: string;
  sect_addr2: string;
  sect_addr3: string;
  phone: string;
  fax: string;
  email: string;
  sect_head_id: string;
  remarks: string;
  status: string;
  user_id: string;
  user_dt: Date;
  enterprice_code: string;
  staff_cntrl_ac_group: string;
  staff_loan_ac_group: string;
  salary_expense_ac_code: string;
  expense_sub_type: string;
  expense_type: string;
};

export type TEmpStatusHr = {
  company_code: string;
  empstatus_code: string;
  empstatus_name: string;
  empstatus_short_desc: string;
  remarks: string;
  updated_at?: Date;
  updated_by?: string;
  created_at?: Date;
  created_by?: string;
};
export type TSponsorData = {
  sponsor_code: string;
  sponsor_name: string;
  sponsor_short_name: string;
  trade_license_no: string;
  trade_license_exp_date: Date;
  sponsor_address1: string;
  sponsor_address2: string;
  country_code: string;
  no_of_visa: number;
  no_of_visit_visa: number;
  sponsor_labor_no: string;
  sponsor_immgr_no: string;
  sponsor_immgr_dt: Date;
  labour_card_blocked: string;
  blocked_reason: string;
  remarks: string;
  status: string;
  company_code: string;
  updated_at?: Date;
  created_at?: Date;
  updated_by?: string;
  created_by?: string;
};
export type TAirport = {
  company_code: string;
  airport_code: string;
  airport_name: string;
  airport_short_name: string;
  adult_ticket_fair: number;
  remarks: string;
  status: string;
  fair_class: string;
  curr_code: string;
  ex_rate: number;
  fc_adult_fair: number;
  fc_child_fair: number;
  fc_infant_fair: number;
  destination_country: string;
  updated_at?: Date;
  updated_by?: string;
  created_at?: Date;
  created_by?: string;
};

export type TDivision = {
  company_code: string;
  div_code: string;
  div_name: string;
  div_short_name: string;
  div_address1: string;
  div_address2: string;
  div_address3: string;
  country_code: string;
  phone: string;
  fax: string;
  email: string;
  div_head_id: string;
  remarks: string;
  status: string;
  user_id: string;
  user_dt: Date;
  enterprice_code: string;
  payroll_date: Date;
  payroll_status: string;
  normal_working_hrs: number;
  day_off1: string;
  day_off2: string;
  hr_representative: string;
  pay_month: number;
  pay_year: number;
  payroll_calc_type: string;
  day_off1_half_day: string;
  day_off2_half_day: string;
  fin_year_start: Date;
  fin_year_end: Date;
  bank_name_inv: string;
  ac_code_inv: string;
  reference_no_inv: string;
  bank_address_inv: string;
  swift_code_inv: string;
  emp_document_path: string;
  payroll_cutoff_date: Date;
  payroll_day: number;
  emp_acgroup: string;
  emp_cnt: number;
  trn_no: string;
  comp_logo: string;
  logo_title: string;
  default_grade: string;
  employer_eid: string;
  payer_eid: string;
  payer_qid: string;
  payer_bank: string;
  payer_iban: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};
export type TContractTableHr = {
  contract_type: string;
  contract_start_date: Date;
  contract_end_date: Date | null;
  contract_renewable: string;
  contract_type_desc: string;
};

export type TEMPLOYEES = {
  EMPLOYEE_ID: string;
  EMPLOYEE_CODE: string;
  ALTERNATE_ID: string;
  RPT_NAME: string;
  JOIN_DATE: Date;
  DEPT_NAME: string;
  DIV_NAME: string;
  SECTION_NAME: string;
  DESG_NAME: string;
  NATIONALITY: string;
  EMP_STATUS: string;
  LABOUR_DESG_CODE: string;
  GRADE_CODE: string;
  GRADE_NAME: string;
  GENDER: string;
  MOBILE_NO: string;
  PAYMENT_MODE: string;
  CATEGORY_CODE: string;
  CATEGORY_NAME: string;
  AIRPORT_CODE: object;
  COMPANY_CODE: string;
  COMP_NAME: string;
  DIV_CODE: string;
  DEPT_CODE: string;
  SECTION_CODE: string;
  USER_ID: string;
  USER_DT: string;
  COMP_PAYROLL_DATE: string;
  CMP_PAYROLL_DAY: string;
  DIV_PAYROLL_DATE: string;
  INCLUDE_IN_PAYROLL: string;
  SALARY_BANK_CODE: string;
  SALARY_ACCT_NO: string;
  SAL_PROCESSED: object;
  PAY_MONTH: number;
  PAY_YEAR: number;
  SAL_ADVANCE: object;
  ADV_PAID: object;
  PROBATION_END_DATE: string;
  SEPARATION_EFF_DATE: object;
  PROBATION_CONFIRM_DATE: string;
  PASI_NO: string;
  PAYROLL_PROCESS: string;
  RESUME_DT: object;
  EMP_ACREF: string;
  PASSPORT_NO: string;
  ID_NO: string;
  MEMO_POSTED: string;
  DESTN_PORT: object;
  ADULT_FARE: object;
  CHILD_FARE: object;
  INFANT_FARE: object;
  TITLE: string;
  COMPANY_BANK_CODE: string;
  LABOUR_CARD_NO: string;
  PASSPORT_NAME: string;
  IBAN_NO: string;
  MAIN_BANK: string;
  EMP_PHOTO: object;
  DEPT_HEAD_EMPID: string;
  SUPERVISOR_EMPID: string;
  MANGR_EMPID: string;
  DOB: string;
  CURR_CODE: string;
  EX_RATE: string;
  PPT_COUNTRY: string;
  PPT_COUNTRY_NAME: string;
  PPT_VALID_FROM: Date;
  PPT_VALID_TO: Date;
  PPT_WITH: string;
  PPT_STATUS: string;
  CONTRACT_TYPE: string;
  CONTRACT_TYPE_DESC: string;
  CONTRACT_START_DATE: Date;
  CONTRACT_END_DATE: Date;
  CONTRACT_RENEW: string;
  SPONSOR_ID: string;
  SPONSOR_NAME: string;
  SPONSOR_VISA_TYPE: string;
  SPONSOR_VISA_FROM_DT: Date;
  SPONSOR_VISA_TO_DT: Date;
  INS_CARD_NO: string;
  INS_CARD_TYPE: string;
  INS_CARD_ISSUE_DT: Date;
  INS_CARD_EXP_DT: Date;
};
