export interface ISmscompanymaster {
  id?: number;
  company_name: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISmsServicemaster {
  id?: number;
  service_name: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Add similar interfaces for other masters
export interface ISmsSegmentmaster {
  id?: number;
  segment_name: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISmsSalesmaster {
  id?: number;
  sales_name: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISmsReasonmaster {
  id?: number;
  reason: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISmsDealmaster {
  id?: number;
  deal_status: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ISmsProbabilitymaster {
  id?: number;
  probability: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}
