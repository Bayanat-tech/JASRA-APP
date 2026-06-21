export type TPeriodwiseAccount = {
  as_on: Date;
  age_1: number;
  age_2: number;
  age_3: number;
  age_4: number;
  age_5: number;
  age_6: number;
  div_code: string;
  ac_code?: string[];
  group_code?: string[];
};
export type TAccountDetailsAccounts = {
  ac_code: string;
  ac_name: string;
};
export type TGroupDetailAccounts = {
  l4_code: string;
  l4_description: string;
};
export type TPeriodWiseReport = {
  d_age1: number;
  d_age2: number;
  d_age3: number;
  d_age4: number;
  d_age5: number;
  d_age6: number;
  dataArray: TPeriodDataArray[];
};
type TPeriodDataArray = {
  isHeading: true;
  l4_code: string;
  l4_description: string;
  ac_code: string;
  ac_name: string;
  credit_amount: string;
  inv_date: string;
  age_30: string;
  age_60: string;
  age_90: string;
  age_120: string;
  age_160: string;
  age_200: string;
  age_above: string;
  un_allocated_amt: string;
  credit_period: string;
  dept_code: string;
  salesman_code: string;
  salesman_name: string;
  isTotal: boolean;
  age_below: string;
  age_1: string;
  age_2: string;
  age_3: string;
  age_4: string;
  age_5: string;
  grandTotal: boolean;
};

