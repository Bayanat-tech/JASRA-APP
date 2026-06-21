export type TProjectmaster = {
  project_code?: string; // varchar(15): Unique identifier for the project (optional)
  project_name?: string; // varchar(200): Name of the project (optional)
  company_code?: string; // varchar(5): Company code (optional)
  updated_at?: Date; // datetime: Timestamp for the last update (optional)
  updated_by?: string; // varchar(50): User who last updated the record (optional)
  created_by?: string; // varchar(20): User who created the record (optional)
  created_at?: Date; // datetime: Timestamp for when the record was created (optional)
  div_code?: string; // Required field for division code
  contact_person?: string; // Prefix for project number (optional)
  store_name?: string; // Required field indicating project/department flag
  // project_type: string; // Field to indicate the type of project
  total_project_cost: number; // Field for total project cost (up to 10 digits, 2 decimal places)
  facility_mgr_name: string; // varchar(100): Name of the facility manager
  facility_mgr_email: string; // Email address of the facility manager
  facility_mgr_phone: string; // Phone number of the facility manager
  project_date_from?: Date; // Start date of the project (optional)
  project_date_to?: Date; // End date of the project (optional)
  alternate_id?: string;
  contact_number?: string; // Phone number of the contact person (optional)"
};

export type TVProjectmaster = {
  project_code: string; // varchar(15): Unique identifier for the project (optional)
  project_name?: string; // varchar(200): Name of the project (optional)
  company_code?: string; // varchar(5): Company code (optional)
  updated_at?: Date; // datetime: Timestamp for the last update (optional)
  updated_by?: string; // varchar(50): User who last updated the record (optional)
  created_by?: string; // varchar(20): User who created the record (optional)
  created_at?: Date; // datetime: Timestamp for when the record was created (optional)
  div_code?: string; // Required field for division code
  div_name: string; // Required field for division name
  prno_pre_fix?: string; // Prefix for project number (optional)
  flag_proj_department?: string; // Required field indicating project/department flag
  project_type: string; // Field to indicate the type of project
  total_project_cost: number; // Field for total project cost (up to 10 digits, 2 decimal places)
  facility_mgr_name: string; // varchar(100): Name of the facility manager
  facility_mgr_email: string; // Email address of the facility manager
  facility_mgr_phone: string; // Phone number of the facility manager
  project_date_from?: Date; // Start date of the project (optional)
  project_date_to?: Date; // End date of the project (optional)
};
