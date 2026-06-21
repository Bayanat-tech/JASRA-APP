export interface IActivity {
  activity_code: string;
  activity: string;
  wip_code: string;
  income_code: string;
  cost: number;
  bill: number;
  company_code: string;
  activity_group_code: string;
  activity_subgroup_code: string;
  start_point: string;
  end_point: string;
  vtype: string;
  freeze_flag: string;
  budget_cost: number;
  apptn_house: string;
  apptn_app_on: string;
  exp_sub_type: string;
  exp_code: string;
  tx_compnt_1_perc: number;
  tx_compnt_2_perc: number;
  tx_compnt_3_perc: number;
  tx_compnt_4_perc: number;
  tx_compnt_1_expmt: string;
  tx_compnt_2_expmt: string;
  tx_compnt_3_expmt: string;
  tx_compnt_4_expmt: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IActivityKPI {
  prin_code: string;
  job_type: string;
  act_code: string;
  cust_code?: string | null;
  exp_hours: number;
  company_code: string;
  updated_at?: Date;
  updated_by?: string | null;
  created_by?: string | null;
  created_at?: Date;
}
