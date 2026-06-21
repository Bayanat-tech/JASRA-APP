export interface ISmscompanymaster {
  id?: number;
  company_code?: string;
  company_name: string;
  address?: string;
  city?: string;
  country?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IServicemaster {
  id?: number;
  service_code?: string;
  service_name?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISmsSegmentmaster {
  id?: number;
  segment_code?: string;
  segment_name?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISmsSalesmaster {
  id?: number;
  sales_code?: string;
  sales_name?: string;
  contact_no?: string;
  email?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISmsReasonmaster {
  id?: number;
  reason_code?: string;
  lost_reason?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISmsDealmaster {
  id?: number;
  status_code?: string;
  deal_status?: string;
  status_percentage?: number;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISmsProbabilitymaster {
  id?: number;
  probability_code?: string;
  deal_probability?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISmsSalesRequestmaster {
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
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}
