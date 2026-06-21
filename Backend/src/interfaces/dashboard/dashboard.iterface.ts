export interface IOutboundDashboard {
  company_code: string;
  prin_code: string;
  site_code: string;
  txn_date: Date;
  order_no: string;
  quantity: number;
  prin_group: string;
}

export interface IInboundDashboard {
  company_code: string;
  prin_code: string;
  site_code: string;
  txn_date: Date;
  container_no: string;
  quantity: number;
  prin_group: string;
}

export interface IReturnDashboard {
  company_code: string;
  prin_code: string;
  site_code: string;
  txn_date: Date;
  container_no: string;
  quantity: number;
  prin_group: string;
}

export interface IJobListingDashboard {
  company_code: string;
  prin_code: string;
  job_no: string;
  job_date: Date;
  job_type: string;
  dept_code: string;
  prin_group: string;
  job_class: string;
  confirm_date: Date;
  ind_freight: string;
  prin_name: string;
  dept_name: string;
  user_id: string;
  inv_no: string;
  inv_date: Date;
  grn_no: bigint;
  grn_date: Date;
  dn_no: bigint;
  dn_date: Date;
  act_bill_amt: number;
  canceled: string;
  cancel_date?: Date;
  confirmed: string;
  invoiced: string;
}
