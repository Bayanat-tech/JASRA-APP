
import * as oracledb from "oracledb";
import { oracleDb, getRepository } from "../../database/connection";
import { LeaveRequestFlow } from "../../interfaces/leaveRequestFlow.interface";
import { notifyUser } from "../../helpers/functions";
import { TmpLeaveRequestFlow } from "../entities/JS_temp_leave_flow.entity";
import { TempLeaveFlowService } from "./templeaveflow.service";
import { Files_dltslms } from "./JS_Files_dlts.service";

// Add helper function for date handling
function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") {
    return date === "0000-00-00" ? null : date;
  }
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return null;
}

function formatDateTime(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") {
    // Handle existing datetime string
    if (date.includes(" ")) {
      const [datePart] = date.split(" ");
      return datePart;
    }
    return date === "0000-00-00" ? null : date;
  }
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }
  return null;
}

export interface LeaveResumeDatesUpdate {
  requestNumber: string;
  dutyResumeDate?: Date | null;
  actualResumeDate?: Date | null;
}

export const HrService = {
  getEmployeesUnder: async (supervisor_empid: string) => {
    try {
      const query = `
      SELECT * 
      FROM VW_HR_EMPLOYEE 
      WHERE
      EMP_STATUS IN ('P','C') 
      AND ( SUPERVISOR_EMPID = :supervisor_empid 
      OR DEPT_HEAD_EMPID = :supervisor_empid 
      OR MANGR_EMPID = :supervisor_empid )
    `;

      const bindParams = {
        supervisor_empid: supervisor_empid,
      };

      const result = await oracleDb.query(query, bindParams);

      if (!result || !result.rows || result.rows.length === 0) {
        console.warn(`No employees found under empid: ${supervisor_empid}`);
        return [];
      }

      return result.rows;
    } catch (error: any) {
      console.error(
        `Error fetching employees under empid ${supervisor_empid}:`,
        error.message,
      );
      return [];
    }
  },

  // getLeaveBalance: async (employeeId: string) => {
  //   const response = await axiosInstance.get(
  //     `/api/EmployeeLeave/leavebalance/${employeeId}`
  //   );
  //   return response.data;
  // },

  getLeaveEntitle: async (employeeId: string) => {
    console.log("leave register hit");
    try {
      const query = `
      SELECT * 
      FROM VW_HR_EMP_LEAVE_ENTITLE 
      WHERE EMPLOYEE_ID = :emp_id
    `;

      const bindParams = {
        emp_id: employeeId,
      };

      const result = await oracleDb.query(query, bindParams);

      if (!result || !result.rows || result.rows.length === 0) {
        console.warn(`No employees found under empid: ${employeeId}`);
        return [];
      }

      return result.rows;
    } catch (error: any) {
      console.error(
        `Error fetching employees under empid ${employeeId}:`,
        error.message,
      );
      return [];
    }
  },

  // getLeaveHistory: async (params: {
  //   employeeId?: string;
  //   leaveType?: string;
  //   leaveStartDateFrom?: string;
  //   leaveStartDateTo?: string;
  //   leaveEndDateFrom?: string;
  //   leaveEndDateTo?: string;
  //   orderBy?: string;
  // }) => {
  //   const response = await axiosInstance.get(
  //     "/api/EmployeeLeave/leavehistory",
  //     {
  //       params,
  //     }
  //   );
  //   return response.data;
  // },

  newValidaterequest: async (params: {
    leaveStartDate: string;
    employeeId: string;
    leaveType: string;
  }) => {
    const { leaveStartDate, employeeId, leaveType } = params;

    console.log("Input leaveStartDate:", leaveStartDate); // '12-11-2025' (DD-MM-YYYY)

    // Validate date format
    if (!/^\d{2}-\d{2}-\d{4}$/.test(leaveStartDate)) {
      throw new Error("Invalid date format. Expected DD-MM-YYYY");
    }

    // Validate date components
    const [day, month, year] = leaveStartDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new Error("Invalid date components");
    }

    // Your date is already in DD-MM-YYYY format, no conversion needed!
    const formattedDate = leaveStartDate; // Keep as '12-11-2025'

    const query = `
    DECLARE
      v_result VARCHAR2(10);
    BEGIN
      v_result := FN_UPDATE_REPORT_DATE(
        NULL,
        NULL,
        NULL,
         TO_DATE(:leaveDate, 'DD-MM-YYYY'),
        NULL
      );
      
      -- Store result in a temporary table to retrieve it
      INSERT INTO TEMP_FUNCTION_RESULT (RESULT_VALUE) VALUES (v_result);
      COMMIT;
    END;
  `;

    const bindParams = {
      leaveDate: formattedDate,
    };

    console.log("PL/SQL Block:", query);
    console.log("Bind Parameters:", bindParams);

    async function getLeaveBalances(employeeId: string, leaveType: string) {
      const balanceQuery = `
    SELECT NO_OF_LEAVES_AVAILABLE 
    FROM VW_HR_LEAVE_YEARLY_BALANCE 
    WHERE EMPLOYEE_ID = :employeeId 
    AND LEAVE_TYPE = :leaveType
  `;

      const bindParams = {
        employeeId: employeeId,
        leaveType: leaveType,
      };

      console.log("Requested Leave Balance Query:", balanceQuery);
      console.log("Balance Bind Parameters:", bindParams);

      try {
        const result = await oracleDb.query(balanceQuery, bindParams);

        if (result.rows.length === 0) {
          console.log(
            `No balance found for employee ${employeeId} and leave type ${leaveType}`,
          );
          return null;
        }

        const balance = result.rows[0]?.NO_OF_LEAVES_AVAILABLE;
        console.log(`Found balance for ${leaveType}:`, balance);

        return balance;
      } catch (error: any) {
        console.error("Error fetching requested leave balance:", error);
        return null;
      }
    }

    try {
      // First, ensure temp table exists
      await ensureTempTableExists();

      // Execute the function
      await oracleDb.query(query, bindParams);

      // Retrieve the result
      const resultQuery = `SELECT RESULT_VALUE as function_result FROM TEMP_FUNCTION_RESULT WHERE ROWNUM = 1`;
      const result = await oracleDb.query(resultQuery, {});
      const functionResult = result.rows[0]?.FUNCTION_RESULT;

      // Clean up
      await oracleDb.query(
        `DELETE FROM TEMP_FUNCTION_RESULT WHERE ROWNUM = 1`,
        {},
      );

      let leaveBalances = null;

      // If function returned "OK", then get leave balances
      if (functionResult === "OK") {
        leaveBalances = await getLeaveBalances(employeeId, leaveType);
      }

      return {
        success: true,
        leaveType: leaveType,
        functionResult: functionResult,
        leaveStartDate: leaveStartDate,
        formattedDate: formattedDate,
        availableBalance: leaveBalances,
        message: "Validation Successful",
      };
    } catch (error: any) {
      console.error("Error in newValidaterequest:", error);
      return {
        success: false,
        functionResult: null,
        leaveStartDate: leaveStartDate,
        message: `Validation failed: ${error.message}`,
      };
    }
  },
  
  JSLeaveDaysCount: async (params: {
    leaveStartDate: string;
    leaveEndDate: string;
    leaveType: string;
  }) => {
    const { leaveStartDate, leaveEndDate , leaveType} = params;

    const query = `
    DECLARE
     v_leave_days NUMBER;
     BEGIN
        v_leave_days := FUN_CALC_LEAVE_DAYS(
          TO_DATE(:leaveStartDate, 'DD-MM-YYYY'),
          TO_DATE(:leaveEndDate, 'DD-MM-YYYY'),
          :p_leaveType
        );
      :p_leave_days := v_leave_days;
      END;
    `;
    
    const bindParams = {
      leaveStartDate: leaveStartDate,
      leaveEndDate: leaveEndDate,
      p_leaveType: leaveType,
      p_leave_days: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
    };

    try {
      const result = await oracleDb.query(query, bindParams);
      const leaveDays = (result.outBinds as any).p_leave_days;

      return {
        success: true,
        leaveStartDate: leaveStartDate,
        leaveEndDate: leaveEndDate,
        leaveDays: leaveDays,
        leaveType: leaveType,
        message: "Leave days calculated successfully",
      };
    }catch (error: string | any) {
      console.error("Error calculating leave days:", error);
      return {
        success: false,
        leaveStartDate: leaveStartDate,
        leaveEndDate: leaveEndDate,
        leaveDays: null,
        leaveType: leaveType,
        message: "Failed to calculate leave days",
      };
    }
  },

  JSvalidateLeave: async (params: {
    companyCode: string;
    employeeId: string;
    leaveStartDate: string;
    leaveEndDate: string;
    leaveType: string;
    leaveDays: number;
  }) => {
    const {
      companyCode,
      employeeId,
      leaveStartDate,
      leaveEndDate,
      leaveType,
      leaveDays,
    } = params;

    const query = `
    DECLARE
      v_result VARCHAR2(4000);
    BEGIN
      v_result := FN_HR_LEAVE_VALIDATION_V1(
        :p_COMPANY_CODE,
        :p_EMPLOYEE_ID,
        TO_DATE(:p_LEAVE_START_DATE, 'DD-MM-YYYY'),
        TO_DATE(:p_LEAVE_END_DATE, 'DD-MM-YYYY'),
        :p_LEAVE_TYPE,
        :p_LEAVE_DAYS
      );
      :p_RESULT := v_result;
    END;
  `;

    const bindParams = {
      p_COMPANY_CODE: companyCode,
      p_EMPLOYEE_ID: employeeId,
      p_LEAVE_START_DATE: leaveStartDate,
      p_LEAVE_END_DATE: leaveEndDate,
      p_LEAVE_TYPE: leaveType,
      p_LEAVE_DAYS: leaveDays,
      p_RESULT: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 4000,
      },
    };

    try {
      const result = await oracleDb.query(query, bindParams);
      const rawResult: string = (result.outBinds as any).p_RESULT ?? "";

      const [statusCode, balanceStr] = rawResult.split("$$$");
      const availableBalance = parseFloat(balanceStr);
      const isSuccess = statusCode === "S";

      return {
        success: isSuccess,
        isValid: isSuccess,
        availableBalance: isNaN(availableBalance) ? null : availableBalance,
        message: isSuccess ? `Validation Successful` : `Validation Failed`,
        raw: rawResult, 
      };
    } catch (error: any) {
      console.error(
        "Error executing FN_HR_LEAVE_VALIDATION_V1:",
        error.message,
      );
      return {
        result: null,
        success: false,
        isValid: false,
        error:
          "Leave validation could not be completed. Please try again later.",
      };
    }
  },

  insertLeaveRequest: async (request: LeaveRequestFlow) => {
    try {
      if (request.finalApproved === "YES") {
        const tmpFormattedRequest: Partial<TmpLeaveRequestFlow> = {
          request_number: request.requestNumber || "",
          current_step: request.currentStep || "",
          company_code: request.companyCode || "",
          employee_code: request.employeeCode || "",
          leave_request_date: request.leaveRequestDate
            ? new Date(request.leaveRequestDate)
            : undefined,
          travel_date: request.travelDate
            ? new Date(request.travelDate)
            : undefined,
          leave_type: request.leaveType || "",
          leave_start_date: request.leaveStartDate
            ? new Date(request.leaveStartDate)
            : undefined,
          leave_end_date: request.leaveEndDate
            ? new Date(request.leaveEndDate)
            : undefined,
          leave_days: Number(request.leaveDays) || 0,
          leave_reason: request.leaveReason || "",
          days_adjusted: Number(request.daysAdjusted) || 0,
          half_day: request.halfDay || "",
          air_ticket: request.airTicket || "",
          air_ticket_self: request.airTicketSelf || "",
          air_ticket_wife: request.airTicketWife || "",
          air_ticket_children: Number(request.airTicketChildren) || 0,
          request_date: request.requestDate
            ? new Date(request.requestDate)
            : undefined,
          flow_code: request.flowCode || "",
          flow_level_initial: Number(request.flowLevelInitial) || 0,
          flow_level_running: Number(request.flowLevelRunning) || 0,
          flow_level_final: Number(request.flowLevelFinal) || 0,
          fa_uploaded: request.faUploaded || "",
          final_approved: "YES",
          create_user: request.createUser || "",
          create_date: request.createDate
            ? new Date(request.createDate)
            : undefined,
          last_updated: request.lastUpdated || "",
          last_action: request.lastAction || "",
          history_serial: Number(request.historySerial) || 0,
          cancel_flag: request.cancelFlag || "",
          cancel_user: request.cancelUser || "",
          cancel_date: request.cancelDate
            ? new Date(request.cancelDate)
            : undefined,
          cancel_remark: request.cancelRemark || "",
          remarks_histry: request.remarksHistry || "",
          remarks: request.remarks || "",
          description: request.description || "",
          comments: request.comments || "",
          mobile_app_update: request.mobileAppUpdate || "N",
          updated_by: request.updatedBy || "",
          created_by: request.createdBy || "",
          hod: request.hod || "",
          dept_head: request.deptHead || "",
          immediate_supervisor: request.immediateSupervisor || "",
          log_number: Number(request.logNumber) || 0,
          next_action_by: request.nextActionBy || "",
          leave_allowance: request.leaveAllowance || "",
          adv_payment: request.advPayment || "",
          cause_type: request.causeType || "",
          name_of_replacement: request.nameOfReplacement || "",
          contact_details_during_leave: request.contactDetailsDuringLeave || "",
          duty_resume_date: request.dutyResumeDate
            ? new Date(request.dutyResumeDate)
            : undefined,
          actual_resume_date: request.actualResumeDate
            ? new Date(request.actualResumeDate)
            : undefined,
          employee_name: request.employeeName || "",
        };

        const result =
          await TempLeaveFlowService.createTempLeaveRequestFlow(
            tmpFormattedRequest,
          );

        console.log("TMP DB Insert Result:", result);

        return result;
      } else {
        return;
      }
    } catch (error: any) {
      console.error("Error in insertLeaveRequest:", {
        message: error.message,
      });
      throw error;
    }
  },

updateLeaveResume: async (request: LeaveResumeDatesUpdate): Promise<any> => {
    try {
      const result = await TempLeaveFlowService.updateTempLeaveRequestFlow(
        request.requestNumber,
        {
          duty_resume_date: request.dutyResumeDate ? new Date(request.dutyResumeDate) : undefined,
          actual_resume_date: request.actualResumeDate ? new Date(request.actualResumeDate) : undefined,
        }
      );
      console.log("TMP DB Update Result:", result);

      return result;

    } catch (error: any) {
      console.error("Error in updateLeaveResume:", {
        message: error.message,
        payload: request,
      });

      const apiError = error?.response?.data ?? error;
      const apiMessage =
        (apiError && (apiError.message || apiError.error)) ||
        error?.message ||
        String(error);

      const detailedErrorText =
        typeof apiError === "string" ? apiError : JSON.stringify(apiError, null, 2);

      const notifPayload = {
        event: "HR_API_ERROR",
        message: `test Failed to update resume dates for RequestNumber: ${request.requestNumber}\nError: ${apiMessage}`,
        subject: "HR DB updateResumeDates Failed",
        request_users: "Sagar.b@bayanattechnology.com,Sandeep.dandekar@bayanattechnology.com,arun.colaco@bayanattechnology.com,rohan.yadav@bayanattechnology.com",
        cc: "prem@bayanattechnology.com",
        htmlMessage: `
          <h3>HR DB updateResumeDates Failed</h3>
          <p><strong>Request Number:</strong> ${request.requestNumber}</p>
          <p><strong>Error Message:</strong> ${apiMessage}</p>
          <h4>Error Details</h4>
          <pre>${detailedErrorText}</pre>
          <h4>Payload Sent</h4>
          <pre>${JSON.stringify(request, null, 2)}</pre>
        `,
      };

      try {
        await notifyUser(notifPayload);
        console.log("notifyUser sent for updateLeaveResume failure");
      } catch (notifErr) {
        console.error("notifyUser failed for updateLeaveResume:", notifErr);
      }

      throw error;
    }
  },

  // getLeaveRequestsWithErpDoc: async (employeeCode: string) => {
  //   const response = await axiosInstance.get(
  //     `/api/EmployeeLeave/GET_LEAVE_REQUESTS_WITH_ERP_DOC`,
  //     {
  //       params: { employee_code: employeeCode },
  //     }
  //   );
  //   return response.data;
  // },

  insertUploadedFileEmployee: async (data: Record<string, any>) => {
    const requiredFields = ["REQUEST_NUMBER", "SR_NO", "ORG_FILE_NAME", "AWS_FILE_LOCN", "EXTENSIONS", "USER_FILE_NAME"];
    const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    try {
      console.log("Sending File Data Payload:", data);

      const response = await Files_dltslms.insertFiles_dltslms(data);

      console.log("Inserted file record:", response);

      return response;
    } catch (error: any) {
      console.error("Error inserting into UPLOADED_FILES_DLTS_LMS:", {
        payload: data,
        message: error.message,
      });

      throw new Error(`Failed to insert uploaded file data: ${error.message}`);
    }
  },

};


// Helper function to ensure temp table exists
async function ensureTempTableExists(): Promise<void> {
  const createTableQuery = `
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE TEMP_FUNCTION_RESULT (
          RESULT_VALUE VARCHAR2(100),
          CREATED_DATE DATE DEFAULT SYSDATE
        )
      ';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN -- table already exists
          RAISE;
        END IF;
    END;
  `;

  try {
    await oracleDb.query(createTableQuery, {});
  } catch (error: any) {
    // Ignore "table already exists" errors
    if (!error.message?.includes("-955")) {
      console.error("Error creating temp table:", error);
    }
  }
}
