export interface IDepartment {
  dept_code: string;
  dept_name: string;
  inv_flag?: string;
  jobno_seq?: number;
  invno_seq?: number;
  company_code?: string;
  operation_type?: string;
  div_code?: number;
  ac_div_code?: number;
  dept_email?: string;
  dn_email?: string;
  grn_email?: string;
  inv_gen?: string;
  inb_oub_related?: string;
  inv_prefix?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}
