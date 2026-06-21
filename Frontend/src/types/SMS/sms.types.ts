export type TSmsCompanymaster = {
  company_code?: string;
  company_name?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TSmsServicemaster = {
  service_code?: string;
  service_name?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TSmsSegmentmaster = {
  segment_code?: string;
  segment_name?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TSmsSalesmaster = {
  sales_code?: string;
  sales_name?: string;
  contact_no?: string;
  email?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TSmsReasonmaster = {
  reason_code?: string;
  lost_reason?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TSmsDealmaster = {
  status_code?: string;
  deal_status?: string;
  status_percentage?: number;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TSmsProbabilitymaster = {
  probability_code?: string;
  deal_probability?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type TsalesRequestmaster = {
  sr_no?: number;
  sales_name?: string;
  company_name?: string;
  service_offered?: string;
  segment?: string;
  contact_name?: string;
  contact_number?: number;
  deal_desc?: string;
  deal_ref?: string;
  deal_date?: Date;
  deal_size?: number;
  deal_probability?: string;
  deal_status?: string;
  weighted_forecast?: number;
  lost_reason?: string;
  status_update?: string;
  project_closing_date?: Date;
  next_action?: string;
  note?: string;
  isNew?: boolean;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};
