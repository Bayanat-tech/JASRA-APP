export type TCategory = {
  company_code?: string;
  category_code: string;
  category_name: string;
  category_short_name: string;
  remarks?: string;
  status: string;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
};

export type KPIName = {
  company_code?: string;
  serial_no: string;
  kpi_name: string;
};
export type Operation = {
  company_code?: string;
  serial_no: string;
  operation_name: string;
};

