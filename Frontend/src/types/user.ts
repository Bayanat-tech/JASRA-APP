import { I18n } from './config';

export type TUser = {
  company_code: string;
  loginid: string;
  email_id: string;
  username: string;
  status: string;
  contact_name?: string;
  contact_no?: string;
  contact_email?: string;
  updated_at: Date;
  updated_by: string;
  created_by: string;
  created_at: Date;
  userpass: string;
  no_of_days?: number;
  active_flag: string;
  lang_pref: I18n;
};
