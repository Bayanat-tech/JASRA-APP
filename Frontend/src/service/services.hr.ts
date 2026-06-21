import axiosServices from 'utils/axios';
import { AxiosError } from 'axios';
import { formatDateOnly } from 'utils/dateFormatter';
// import useAuth from 'hooks/useAuth';


export interface IHrEmployee {
  EMAIL: any;
  IMMEDIATE_SUPERVISOR: any;
  DEPT_HEAD: any;
  HOD: any;
  SUPERVISOR_EMPID: any;
  DEPT_HEAD_EMPID: any;
  MANGR_EMPID: any;
  EMPLOYEE_ID: string;
  EMPLOYEE_CODE: string;
  ALTERNATE_ID: string;
  RPT_NAME: string;
  SUPERVISOR_NAME?: string;
  DEPT_HEAD_NAME?: string;
  MANAGER_NAME?: string;
}

export interface ILeaveHistory {
  COMPANY_CODE: string;
  COMPANY_NAME: string;
  DIV_CODE: string;
  DIV_NAME: string;
  DEPT_CODE: string;
  DEPT_NAME: string;
  EMP_STATUS: string;
  SECTION_CODE: string;
  SECTION_NAME: string;
  EMPLOYEE_ID: string;
  EMPLOYEE_CODE: string;
  ALTERNATE_ID: string;
  RPT_NAME: string;
  LEAVE_REQUEST_DATE: string;
  HDR_LVE_SLNO: number;
  LVE_DOC_NO: string;
  LEAVE_TYPE: string;
  LEAVE_TYPE_DESC: string;
  DOC_TYPE: string;
  LEAVE_START_DATE: string;
  LEAVE_END_DATE: string;
  LEAVE_DAYS: number;
  HALF_DAY: string;
  REQ_LEAVE_FROM_DT: string;
  REQ_LEAVE_TO_DT: string;
  APPROVAL_STATUS: string;
  VERIFIED_STATUS: string;
  APPROVED_ON: string;
  APPROVED_BY: any;
  VERIFIED_ON: string;
  VERIFIED_BY: string;
  CANCEL_DATE: any;
  CANCELLD_BY: any;
  ACTUAL_RESUME_DATE: string;
  DUTY_RESUME_DATE: string;
  RESUME_APPROVED_BY: any;
}

interface ILeaveHistoryParams {
  employeeId: string;
  leaveType?: string;
  leaveStartDateFrom?: string;
  leaveEndDateTo?: string;
}

export interface IValidateLeaveParams {
  companyCode: string;
  employeeId: string;
  leaveStartDate: string;
  leaveEndDate: string;
  leaveType: string;
  leaveDays: number;
}

export interface IValidateLeaveResponse {
  validationResult: any;

  success: boolean;
  isValid: boolean;
  message?: string;
  validationErrors?: string[];
  availableBalance?: number;
  requiredBalance?: number;
  overlappingLeaves?: Array<{
    leaveDocNo: string;
    leaveType: string;
    startDate: string;
    endDate: string;
  }>;
}

// Interface for error response structure
// interface IErrorResponse {
//   message?: string;
//   error?: string;
//   details?: string;
// }

export interface ILeaveDaysParams {
  leaveStartDate: string ;
  leaveEndDate: string;
  leaveType: string;
  companycode: string;
}

// const {user} = useAuth();
class HrRequestService {


  async getEmployees(loginId?: string): Promise<IHrEmployee[]> {
    try {
      // Create config object with params if loginId is provided
      const config = loginId ? { params: { loginid: loginId } } : {};

      const response = await axiosServices.get('/api/hr/gm/jsemployees', config);

      console.log('Full API response:', response);

      if (response.data && Array.isArray(response.data?.data)) {
        return response.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('Unexpected response structure:', response.data);
      return [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching HR employees:', axiosError.message);

      if (axiosError.response) {
        console.error('Response error:', axiosError.response.status, axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request);
      }

      return [];
    }
  }

  async getSupervisorEmployees(supervisor_empid?: string): Promise<IHrEmployee[]> {
    try {
      // Create config object with params if loginId is provided
      const config = supervisor_empid ? { params: { supervisor_empid: supervisor_empid } } : {};

      const response = await axiosServices.get('/api/hr/gm/employees', config);

      console.log('Full API response:', response);

      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('Unexpected response structure:', response.data);
      return [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching HR employees:', axiosError.message);

      if (axiosError.response) {
        console.error('Response error:', axiosError.response.status, axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request);
      }

      return [];
    }
  }

  async LeaveDaysCount({
      leaveStartDate,
      leaveEndDate,
      leaveType,
      companycode
    }: ILeaveDaysParams) {
      const response = await axiosServices.get("/api/hr/gm/leaveDaysCount", {
        params: {
          leaveStartDate: formatDateOnly(leaveStartDate),
          leaveEndDate: formatDateOnly(leaveEndDate),
          leaveType: leaveType,
          companycode : companycode,
        },
      });

      return response.data;
  }

  async getLeaveBalance(employeeId: string): Promise<any> {
    try {
      const response = await axiosServices.get(`/api/hr/gm/leavebalance/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw error;
    }
  }

  async getLeaveHistory(params: ILeaveHistoryParams): Promise<ILeaveHistory[]> {
    try {
      const { employeeId, leaveType, leaveStartDateFrom, leaveEndDateTo } = params;

      // Build query parameters object
      const queryParams: Record<string, string> = {};

      if (employeeId) queryParams.employeeId = employeeId;
      if (leaveType) queryParams.leaveType = leaveType;
      if (leaveStartDateFrom) queryParams.leaveStartDateFrom = leaveStartDateFrom;
      if (leaveEndDateTo) queryParams.leaveEndDateTo = leaveEndDateTo;

      const response = await axiosServices.get(`/api/hr/gm/leaveentitle/${employeeId}`, {
        params: queryParams
      });

      console.log('Leave history API response:', response);

      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('Unexpected leave history response structure:', response.data);
      return [];
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Error fetching leave history:', axiosError.message);

      if (axiosError.response) {
        console.error('Response error:', axiosError.response.status, axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request);
      }

      return [];
    }
  }

  async getValidateLeave(params: IValidateLeaveParams): Promise<IValidateLeaveResponse> {
    // Extract leaveDays from params before try-catch
    const { companyCode, employeeId, leaveStartDate, leaveEndDate, leaveType, leaveDays } = params;
    const requestedDays = leaveDays; // Store in local variable

    try {
      // Format dates to dd-mm-yyyy format
      const formatDate = (dateInput: string | Date): string => {
        try {
          // Return as is if already in correct format
          if (typeof dateInput === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
            return dateInput;
          }

          // Convert from YYYY-MM-DD to DD-MM-YYYY
          if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const [year, month, day] = dateInput.split('-');
            return `${day}-${month}-${year}`;
          }

          // Handle Date objects and other formats
          const date = new Date(dateInput);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date: ${dateInput}`);
          }

          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();

          return `${day}-${month}-${year}`;
        } catch (error) {
          console.error('Date formatting error:', error);
          throw new Error(`Failed to format date: ${dateInput}`);
        }
      };

      // Build query parameters
      const queryParams = {
        companyCode,
        employeeId,
        leaveStartDate: formatDate(leaveStartDate),
        leaveEndDate: formatDate(leaveEndDate),
        leaveType,
        leaveDays: requestedDays.toString()
      };

      console.log('Validate leave request:', { queryParams, leaveType });

      const response = await axiosServices.get('/api/hr/gm/validateleave', {
        params: queryParams,
        timeout: 30000
      });

      console.log('Validate leave response for', leaveType, ':', response.data);

      // Parse the response based on different formats
      return this.parseValidationResponse(response.data, leaveType, requestedDays);
    } catch (error: unknown) {
      console.error('Error validating leave:', error);
      return this.handleValidationError(error, requestedDays);
    }
  }

  private parseValidationResponse(responseData: any, leaveType: string, requestedDays: number): IValidateLeaveResponse {
    // Handle string format response (e.g., "S$$$24.06")
    if (responseData?.validationResult && typeof responseData.validationResult === 'string') {
      return this.parseStringFormatResponse(responseData.validationResult, leaveType, requestedDays);
    }

    // Handle direct string response
    if (typeof responseData === 'string') {
      return this.parseStringFormatResponse(responseData, leaveType, requestedDays);
    }

    // Handle structured object response
    if (responseData && typeof responseData === 'object') {
      return this.parseStructuredResponse(responseData, leaveType, requestedDays);
    }

    // Handle boolean response
    if (typeof responseData === 'boolean') {
      return {
        success: true,
        isValid: responseData,
        message: responseData ? 'Leave validation passed' : 'Leave validation failed',
        availableBalance: responseData ? requestedDays : 0,
        validationErrors: responseData ? [] : ['Validation failed'],
        requiredBalance: requestedDays,
        overlappingLeaves: [],
        validationResult: responseData
      };
    }

    console.warn('Unexpected response format:', responseData);
    return {
      success: false,
      isValid: false,
      message: 'Unexpected response format from server',
      availableBalance: 0,
      validationErrors: ['Cannot parse validation response'],
      requiredBalance: requestedDays,
      overlappingLeaves: [],
      validationResult: responseData
    };
  }

  private parseStringFormatResponse(responseString: string, leaveType: string, requestedDays: number): IValidateLeaveResponse {
    // Handle formats like: "S$$$24.06", "E$$$0", "SUCCESS", "FAILED"
    const isValid = responseString.startsWith('S') || responseString.includes('SUCCESS');

    // Extract balance from format: "S$$$24.06" or similar
    const balanceMatch = responseString.match(/\d+\.?\d*/);
    const availableBalance = balanceMatch ? parseFloat(balanceMatch[0]) : 0;

    return {
      success: true,
      isValid,
      message: isValid
        ? `Available ${leaveType} balance: ${availableBalance} days`
        : `Insufficient ${leaveType} balance: ${availableBalance} days`,
      availableBalance,
      validationErrors: isValid ? [] : ['Insufficient leave balance'],
      requiredBalance: requestedDays,
      overlappingLeaves: [],
      validationResult: responseString
    };
  }

  private parseStructuredResponse(responseObj: any, leaveType: string, requestedDays: number): IValidateLeaveResponse {
    // Extract data from nested structure or direct properties
    const data = responseObj.data || responseObj;

    const availableBalance = data.availableBalance ?? data.balance ?? data.leaveBalance ?? data.remainingBalance ?? 0;

    const isValid = data.isValid ?? responseObj.isValid ?? responseObj.success ?? availableBalance >= requestedDays;

    const message =
      data.message ??
      responseObj.message ??
      (isValid
        ? `Available ${leaveType} balance: ${availableBalance} days`
        : `Insufficient ${leaveType} balance: ${availableBalance} days`);

    const validationErrors = data.validationErrors ?? responseObj.validationErrors ?? (isValid ? [] : ['Validation failed']);

    const overlappingLeaves = data.overlappingLeaves ?? responseObj.overlappingLeaves ?? [];

    return {
      success: true,
      isValid,
      message,
      availableBalance,
      validationErrors: Array.isArray(validationErrors) ? validationErrors : [validationErrors],
      requiredBalance: data.requiredBalance ?? requestedDays,
      overlappingLeaves: Array.isArray(overlappingLeaves) ? overlappingLeaves : [],
      validationResult: responseObj
    };
  }

  private handleValidationError(error: unknown, requestedDays: number): IValidateLeaveResponse {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // Server responded with error status
      const status = axiosError.response.status;
      const errorData = axiosError.response.data as any;

      const errorMessage = errorData?.message || errorData?.error || errorData?.details || `Server error: ${status}`;

      return {
        success: false,
        isValid: false,
        message: errorMessage,
        availableBalance: 0,
        validationErrors: [errorMessage],
        requiredBalance: requestedDays,
        overlappingLeaves: [],
        validationResult: null
      };
    }

    if (axiosError.request) {
      // No response received
      return {
        success: false,
        isValid: false,
        message: 'No response received from validation server',
        availableBalance: 0,
        validationErrors: ['Network connection error'],
        requiredBalance: requestedDays,
        overlappingLeaves: [],
        validationResult: null
      };
    }

    // Other errors
    return {
      success: false,
      isValid: false,
      message: axiosError.message || 'Failed to validate leave request',
      availableBalance: 0,
      validationErrors: ['Validation service unavailable'],
      requiredBalance: requestedDays,
      overlappingLeaves: [],
      validationResult: null
    };
  }
}

const HrRequestServiceInstance = new HrRequestService();
export default HrRequestServiceInstance;
