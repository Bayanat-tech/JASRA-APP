export type TFlowmaster = {
  flow_code: string;
  flow_description: string;
  company_code?: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
};
export type Tsecrollmaster = {
  company_code?: string;
  role_id?: string;
  role_desc: string;
  remarks: string;
  updated_at?: Date;
  created_at?: Date;
  updated_by?: string;
  created_by?: string;
};
export type TSecmaster = {
  id: string;
  username: string;
  contact_no: string;
  userpass: string;
  email_id?: string;
  company_code?: string;
  loginid?: string;
  user_id?: string;
  user_code?: string;
  active_flag: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};
export type TSecmodulemaster = {
  company_code?: string;
  app_code: string;
  serial_no: string;
  level1: string;
  level2: string;
  level3: string;
  position: string;
  url_path: string;
  icon: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};
export type TCompanymaster = {
  company_code: string;
  company_name?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  country?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TReportmaster = {
  company_code: string;
  module: string;
  report_no?: number;
  reportname: string;
  reportid: string;
  isNew?: boolean;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};
