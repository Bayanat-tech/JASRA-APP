
export interface IPrincipaljob {
  company_code: string;
  prin_code: string;
  prin_name: string;
  }

  export interface IDepartmentjob {
    company_code: string;
    dept_code: string;
    dept_name: string;
    }
  
   export interface IDivisionjob {
      company_code: string;
      div_code: string;
      div_name: string;
      }
      
export interface IPrincipalWms {
  company_code: string;
  prin_code: string;
  prin_name: string;
  prin_addr1?: string;
  prin_addr2?: string;
  prin_addr3?: string;
  prin_addr4?: string;
  prin_city?: string;
  country_code: string;
  tax_country_code?: string;
  tax_country_sn?: string;
  territory_code: string;
  sector_code?: string;
  prin_email1?: string;
  prin_email2?: string;
  prin_email3?: string;
  prin_telno1?: string;
  prin_telno2?: string;
  prin_telno3?: string;
  prin_faxno1?: string;
  prin_faxno2?: string;
  prin_faxno3?: string;
  prin_ref1?: string;
  prin_status?: string;
  acc_email?: string;
  prin_dept_code?: string;

  prin_acref?: string;
  trn_no?: string;
  trn_exp_date?: Date;
  prin_invdate?: Date;
  curr_code?: string;
  prin_infze?: string;
  credit_limit?: number;
  creditdays?: number;
  creditdays_freight?: number;
  prin_lic_no?: string;
  prin_lic_type?: string;
  comm_reg_no?: Date;
  comm_reg_exp_date?: Date;
  prin_imp_code?: string;
  parent_prin_code?: string;
  files?: string[];

  pick_wave?: string;
  pick_wave_qty_sort?: string;
  pick_wave_ign_min_exp?: string;

  pref_site?: string;
  pref_loc_from?: string;
  pref_loc_to?: string;
  pref_aisle_from?: string;
  pref_aisle_to?: string;
  pref_col_from?: number;
  pref_col_to?: number;
  pref_ht_from?: number;
  pref_ht_to?: number;
  prin_siteind?: string;
  service_date?: Date;
  storage_type?: string;
  default_foc?: string;

  under_value?: string;
  auto_insert_billactivity?: string;
  prin_charge?: string;
  prin_pricechk?: string;
  prin_landedpr?: string;
  auto_job?: string;
  validate_lotno?: string;
  storage_productwise?: string;
  dir_shpmnt?: string;
  validate_expdate?: string;
  minperiod_exppick?: number;
  rcpt_exp_limit?: number;
  perpectual_confirm_allow?: string;
  automate_activity?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}
export interface IPrincipalContactDetlWMs {
  prin_code: string;
  company_code: string;
  prin_cont1: string;
  prin_cont2: string;
  prin_cont3: string;
  prin_cont_telno1: string;
  prin_cont_telno2: string;
  prin_cont_telno3: string;
  prin_cont_email1: string;
  prin_cont_email2: string;
  prin_cont_email3: string;
  prin_cont_faxno1: string;
  prin_cont_faxno2: string;
  prin_cont_faxno3: string;
  prin_cont_ref1: string;
  updated_by: string;
  created_by?: string;
  updated_at?: Date;
  created_at?: Date;
}
export interface IPrincipalWmsView {
  company_code: string;
  prin_code: string;
  user_id: string;
  prin_name: string;
  prin_city: string;
  prin_addr1: string;
  prin_status: string;
  prin_group: string;
  prin_groupName: string;
}
