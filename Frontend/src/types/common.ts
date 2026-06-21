export type TPair<T extends string> = {
  label: string;
  value: string;
} & {
  [K in T]?: any;
};
export type TMsCompanyInfo = {
  company_code: string;
  company_name: string;
  age_1: number;
  age_2: number;
  age_3: number;
  age_4: number;
  age_5: number;
  ac_fy_period: string;
};

export type TDataSelection = {
  is_mounted: boolean;
  selected: { label: string; value: string };
  data: {
    ac_name?: string;
    bank_ac_name?: string;
    ac_payee?: string;
    curr_name?: string;
    div_name?: string;
    [key: string]: any;
  };
};
