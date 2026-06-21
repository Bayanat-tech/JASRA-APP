export interface IHrSponsor {
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
}
