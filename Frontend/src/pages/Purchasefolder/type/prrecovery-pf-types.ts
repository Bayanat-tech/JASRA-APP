export type PurchaseRecoveryData = {
  request_number: string;
  recovery_flag: string;
  request_date: Date;
  description: string;
  amount: number;
  recovery_party_code: string;
  recovery_date: Date;
  recovery_remark: string;
  recovery_confirm: string;
  ac_name: string;
  emp_name: string;
  supplier: string;
  company_code: string;
  history_serial: string;
  type_of_pr: string;
  project_name: string;
  ac_code: string;  // Add this field if missing
  alternate_id: string;  // Add this field if missing
};
