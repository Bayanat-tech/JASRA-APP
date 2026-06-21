export interface IAccountLevelFourAttributes {
  company_code: string;
  l4_code: string;
  l4_description: string;
  l4_type: string;
  l4_job: string;
  l4_dept: string;
  l4_bill: string;
  l4_pl_code: string;
  l3_code: string;
}
export interface IAccountLevelThreeAttributes {
  company_code: string;
  l3_code: string;
  l3_description: string;
  l2_code: string;
  updated_at?: Date;
  created_at?: Date;
  updated_by: string;
  created_by: string;
}
export interface IAccountLevelTwoAttributes {
  company_code: string;
  l2_code: string;
  l2_description: string;
  l1_code: string;
  updated_at?: Date;
  created_at?: Date;
  updated_by: string;
  created_by: string;
}
export interface IAccountFinanceAttributes {
  company_code: string;
  ac_code: string;
  ac_name: string;
  country_code: string;
  territory_code: string;
  address_1: string;
  address_2: string;
  address_3: string;
  phone: string;
  fax: string;
  e_mail: string;
  contact_person: string;
  mobile_no: string;
  exp_alloc: string;
  l4_code: string;
  curr_code: string;
  ac_type: string;
  ac_active: string;
  credit_period: number;
  credit_amount: number;
  ac_closed_reason: string;
  exp_type_code: string;
  pl_bl_code: string;
  ac_status: string;
  dept_code: string;
  exp_subtype_code: string;
  bank_ac_code: string;
  bank_name: string;
  bank_swift: string;
  salesman_code: string;
  sector_code: string;
  exp_type_code_back: string;
  exp_subtype_code_back: string;
  contract_expry_date: Date;
  bi_main_group: string;
  bi_sub_group: string;
  bi_exp_type: string;
  bi_pl_bs_ind: string;
  bi_dept: string;
  trn_no: string;
  ac_infze: string;
  tax_registrd: string;
  city_name: string;
  tax_country_code: string;
  rcm_apply: string;
  approved_by: string;
  approved_date: Date;
  cr_no: string;
  apprval_factor: string;
  request_number: string;
  updated_at?: Date;
  updated_by: string;
  created_by: string;
  created_at?: Date;
}
export interface IVwAcMasterAttributes {
  company_code: string;
  ac_code: string;
  ac_name: string;
  l4_code: string;
  l4_description: string;
  l3_code: string;
  l3_description: string;
  l2_code: string;
  l2_description: string;
  PL_BL_CODE: string;
  created_by: string;
  created_at?: Date;
  updated_by: string;
  updated_At?: Date;
  // sort_order: number;
}

 export interface IAccountFinancePLSetup {
   company_code: string;
   pl_code: string;
   pl_name: string;
   pl_type: string;
   h_code: string;
 }

 export interface IAccountFinanceBLSetup {
   company_code: string;
   bl_code: string;
   bl_name: string;
   bl_type: string;
   h_code: string;
   prv_code: string;
 }
