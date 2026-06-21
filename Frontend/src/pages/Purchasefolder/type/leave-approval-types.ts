export type TLeaveApproval = {
  SUPERVISOR: string;
  EMPLOYEE_NAME: string;
  DIVISION_HEAD: string;
  REQUEST_NUMBER: string;
  REQUEST_DATE: string;
  EMPLOYEE_CODE: string;
  LEAVE_TYPE: string;
  LEAVE_START_DATE: string;
  LEAVE_END_DATE: string;
  RESUME_DATE?: string;
  LEAVE_DAYS?: number;
  REMARKS?: string;
  CREATED_BY: string;
  COMPANY_CODE: string;
  UPDATED_BY: string;
  LAST_ACTION?: string;
  alternate_id?: string;
  HOD?: string;
  IMMEDIATE_SUPERVISOR?: string;
  DEPT_HEAD?: string;
  LEAVE_ALLOWANCE?: number;
  ADV_PAYMENT?: number;
  CAUSE_TYPE?: string;
  TRAVEL_DATE?: string;
  TRAVEL_END_DATE?: string;
  NAME_OF_REPLACEMENT?: string;
  CONTACT_DETAILS_DURING_LEAVE?: string;
  EMPLOYEE_ID?: string;
  // Add the new properties
  LEAVE_DOC_NO?: string;
  RESUME_WORK?: boolean;
  ACTUAL_RESUME_DATE?: string;
  DUTY_RESUMED_ON?: string;
  LEAVE_REQUEST_DATE?: string; // Use this for the request date in the leave resumption approval page
  EMPLOYEE_NAME_DISPLAY?: string; // Use this for displaying employee name in the leave resumption approval page
  NEXT_ACTION_BY_NAME?: string; // Use this for displaying next action by name
  LEAVE_TYPE_DESC?: string; // Use this for displaying leave type description
  FINAL_APPROVED?: string;
  DUTY_RESUME_DATE?: string;
  SENTBACK_HISTORY?: string;
  HALF_DAY?: boolean;
  NEXT_ACTION_BY?: string;
  CANCEL_REMARK?: string;
  AIR_ROUTE?: string;
  AIR_TICKET?: string;
  IMMEDIATE_SUPERVISOR_NAME: string;
  HOD_NAME: string;
  DEPT_HEAD_NAME: string;

};
