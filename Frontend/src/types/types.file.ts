export type TFile = {
  company_code: string;
  request_number?: string;
  extensions: string;
  sr_no?: number;
  file_name?: string;
  org_file_name: string;
  aws_file_locn: string;
  flow_level?: number;
  modules: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
  user_file_name?: string;
  employee_code?: string;
  attachment_sr_no?: number;
};
