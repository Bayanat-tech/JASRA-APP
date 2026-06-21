export type TVPurchaserequestheader_Al = {
  request_number?: string; // Equivalent to `REQUEST_NUMBER` varchar(15)
  display_request_number?: string;
  request_date?: Date; // Equivalent to `REQUEST_DATE` datetime
  supplier?: string; // Equivalent to `SUPPLIER` varchar(10)
  description?: string; // Equivalent to `DESCRIPTION` mediumtext
  remarks?: string; // Equivalent to `REMARKS` mediumtext
  amount: number; // Equivalent to `AMOUNT` decimal(12,3)
  department_code?: string; // Equivalent to `DEPARTMENT_CODE` varchar(5)
  flow_code: string; // Equivalent to `FLOW_CODE` varchar(5)
  flow_level_initial: number; // Equivalent to `FLOW_LEVEL_INITIAL` int
  flow_level_running: number; // Equivalent to `FLOW_LEVEL_RUNNING` int
  flow_level_final: number; // Equivalent to `FLOW_LEVEL_FINAL` int
  company_code?: string; // Equivalent to `COMPANY_CODE` varchar(5)
  create_user?: string; // Equivalent to `CREATE_USER` varchar(10)
  create_date?: Date; // Equivalent to `CREATE_DATE` datetime
  fa_uploaded?: string; // Equivalent to `FA_UPLOADED` char(1)
  final_approved?: string; // Equivalent to `FINAL_APPROVED` varchar(3)
  purch_status: string; // Equivalent to `PURCH_STATUS` varchar(10)
  sort_order: bigint; // Equivalent to `SORT_ORDER` bigint
  call_type: bigint; // Equivalent to `CALL_TYPE` bigint
  last_action?: string; // Equivalent to `LAST_ACTION` varchar(20)
  last_updated?: string; // Equivalent to `LAST_UPDATED` varchar(10)
  history_status: string; // Equivalent to `HISTORY_STATUS` varchar(4)
  next_action_by?: string; // Equivalent to `NEXT_ACTION_BY` varchar(300)
  request_hod_user?: string; // Equivalent to `REQUEST_HOD_USER` varchar(20)
  user_dt?: Date; // Equivalent to `USER_DT` datetime
};

export type TItemdetails = {
  item_code: string; // Unique identifier for the item
  item_desp: string; // Item description
  item_group_desc: string; // Item group description
  item_group_code: string; // Item group code
  item_rate: number; // Rate of the item
  item_qty: number; // Quantity of the item
  currency_rate: number; // Currency exchange rate
  amount: number; // Total amount
  company_code: string; // Company identifier
  user_dt: string; // User date (consider Date type if needed)
  user_id: string; // User identifier
  request_number: string; // Purchase request number
  curr_code: string; // Currency code
  tx_cat_code: string; // Tax category code
  tx_compntcat_code_1: string; // Tax component category code 1
  tx_compnt_perc_1: number; // Tax component percentage 1
  tx_compnt_amt_1: number; // Tax component amount 1
  tx_compnt_lcuramt_1: number; // Tax component local currency amount 1
  tx_compnt_1_expmt: string; // Tax component exemption
  lcurr_amt: number; // Local currency amount
  allocated_approved_quantity: number; // Approved allocated quantity
  selected_item: string; // Selected item flag
  last_action: string; // Last action performed
  history_serial: number; // History serial number
  curr_name: string; // Currency name
  item_srno: string; // Item serial number
  supplier_part_code: string; // Supplier part code
  rate_methode: string; // Rate method
  item_canel: string; // Item cancellation flag
  tax_name: string; // Tax name
  cost_code: string; // Cost code
  capex: string; // Capital expenditure flag
};

export type TPrrequest = {
  header: {
    request_number?: string;
    request_date?: Date;
    description?: string;
    project_code?: string;
    company_code?: string;
    created_by?: string;
    updated_by?: string;
  };
  details: TItemdetails[]; // Always an array of item details
};

export type TBasicPrrequest_Al = {
  request_date: Date; // Date of the request (consider Date type if needed)
  ac_name: string; // Account name of the supplier
  supplier: string; // Supplier code
  description: string; // Description of the request
  remarks: string; // Additional remarks
  amount: number; // Total amount
  department_code: string; // Department code
  flow_code: string; // Flow code
  flow_level_initial: number; // Initial flow level
  flow_level_running: number; // Running flow level
  flow_level_final: number; // Final flow level
  company_code: string; // Company identifier
  user_dt: string; // User date (consider Date type if needed)
  user_id: string; // User identifier
  currency_rate: number; // Currency exchange rate
  fa_uploaded: string; // Flag indicating if FA is uploaded
  final_approved: string; // Flag indicating final approval
  remarks_histry: string; // History of remarks
  cancel_flag: boolean; // Flag indicating if the request is canceled
  tx_cat_code: string; // Tax category code
  tx_compntcat_code_1: string; // Tax component category code 1
  tx_compntcat_code_2: string; // Tax component category code 2
  tx_compntcat_code_3: string; // Tax component category code 3
  tx_compntcat_code_4: string; // Tax component category code 4
  tx_compnt_1_expmnt: string; // Tax component 1 experiment data
  create_user: string; // User who created the request
  create_date: string; // Creation date (consider Date type if needed)
  tx_cat_name: string; // Tax category name
  tx_compntcat_name: string; // Tax component category name
  curr_code: string; // Currency code
  po_amount: number; // Purchase order amount
  curr_name: string; // Currency name
  flow_description: string; // Flow description
  last_updated: string; // Last updated timestamp (consider Date type if needed)
  last_action: string; // Last action performed
  history_serial: number; // History serial number
  cost_code: string; // Cost code
  request_hod_user: string; // HOD user handling the request
};

export type TItemPrrequest_Al = {
  item_code: string; // Unique identifier for the item
  item_desp: string; // Item description
  item_group_desc: string; // Item group description
  item_group_code: string; // Item group code
  item_rate: number; // Item rate
  item_qty: number; // Item quantity
  currency_rate: number; // Currency exchange rate
  amount: number; // Total amount
  company_code: string; // Company identifier
  user_dt: string; // User date (consider Date type if needed)
  user_id: string; // User identifier
  request_number: string; // Purchase request number
  curr_code: string; // Currency code
  tx_cat_code: string; // Tax category code
  tx_compntcat_code_1: string; // Tax component category code 1
  tx_compnt_perc_1: number; // Tax component percentage
  tx_compnt_amt_1: number; // Tax component amount
  tx_compnt_lcuramt_1: number; // Tax component local currency amount
  tx_compnt_1_expmt: string; // Tax component exemption
  lcurr_amt: number; // Local currency amount
  allocated_approved_quantity: number; // Approved quantity allocation
  selected_item: string; // Selected item flag
  last_action: string; // Last action performed
  history_serial: number; // History serial number
  curr_name: string; // Currency name
  item_srno: number; // Item serial number
  supplier_part_code: string; // Supplier part code
  rate_methode: string; // Rate method
  item_canel: string; // Item cancel flag
  tax_name: string; // Tax category name
  cost_code: string; // Cost code
  capex: boolean; // Capital expenditure flag
  supplier: string; // Supplier name
};

export type TPrTermCondition_Al = {
  tsupplier: string; // Supplier name
  remarks: string;
  dlvr_term: string;
  payment_terms: string;
  quatation_reference: string;
};

export type TPurchaserequestPf_Al = TBasicPrrequest_Al & {
  company_code: string;
  request_number?: string;
  items: TItemPrrequest_Al[]; // Array of item requests
  Termscondition: TPrTermCondition_Al[]; // Array of item requests
};
