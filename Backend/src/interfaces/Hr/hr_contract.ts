export interface IHrContract {
  company_code: string;
  contract_type: string;
  contract_type_desc: string;
  contract_type_short_desc: string;
  remarks: string;
  status: string;
  updated_at?: Date;
  created_at?: Date;
  updated_by?: string;
  created_by?: string;
}
