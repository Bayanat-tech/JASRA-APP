export type TcustomerMastertypes = {
  cust_code: string;
  cust_name: string;
  cust_add1: string;
  cust_add2: string;
  cust_add3: string;
  pincode: number | string;
  phone_number: number | string;
  email_id: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
  company_code: string;
};