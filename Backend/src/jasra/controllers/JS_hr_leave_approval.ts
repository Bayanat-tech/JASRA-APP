import oracledb from 'oracledb';
import { oracleDb } from "../../database/connection";
import { Request, Response } from "express";
import constants from "../../helpers/constants";
import { HrService } from "../service/JS_hr.service";
import { TLeaveApproval } from "../../interfaces/Hr/hr_leave_approval";
import { notifyUser } from "../../helpers/functions";
import { sendLeaveNotifications } from '../../controllers/HR/sendLeaveNotifications';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function toOracleDate(dateInput?: string | Date | null): string | null {
  if (!dateInput) return null;

  try {
    let dateObj: Date;

    if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else if (typeof dateInput === "string") {
      const cleanDate = dateInput.replace(/T.+/, "");
      const [year, month, day] = cleanDate.split("-").map(Number);

      if (!year || !month || !day) {
        console.error("Invalid date components:", { year, month, day });
        return null;
      }

      dateObj = new Date(year, month - 1, day);

      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date object created from:", dateInput);
        return null;
      }
    } else {
      console.error("Unsupported date input type:", typeof dateInput);
      return null;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error converting date:", dateInput, error);
    return null;
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryOnError<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const errorCode = error.errorNum || error.code;
    const retryableErrors = [60, 12514, 12505, 12154]; // deadlock, listener not reached, etc.
    if (retries > 0 && (retryableErrors.includes(errorCode) || error.message?.includes('NJS-040'))) {
      console.warn(`[retryOnError] Retrying operation due to error ${errorCode}: ${error.message}`);
      await sleep(RETRY_DELAY);
      return retryOnError(operation, retries - 1);
    }
    throw error;
  }
}

// export async function upsertLeaveApproval(
//   data: TLeaveApproval
// ): Promise<string> {
//   const { requestNumber, finalApproved } = await oracleDb.withTransaction(
//     async (connection: oracledb.Connection) => {
//       // perform insert or update
//       const exists = await recordExists(
//         data.REQUEST_NUMBER,
//         data.COMPANY_CODE,
//         connection
//       );
//       console.log("record exists:", exists);

//       if (exists) {
//         console.log("update path");
//         await updateLeaveApproval(data, connection);
//       } else {
//         console.log("insert path");
//         await insertLeaveApproval(data, connection);
//       }

//       let finalReq =
//         data.REQUEST_NUMBER && data.REQUEST_NUMBER.trim() !== ""
//           ? data.REQUEST_NUMBER
//           : null;

//       // 1) Try GT_SESSION_INFO (existing approach)
//       if (!finalReq) {
//         try {
//           const codeRes: any = await connection.execute(
//             `SELECT code FROM GT_SESSION_INFO WHERE session_id = SYS_CONTEXT('USERENV','SESSIONID') AND ROWNUM = 1`,
//             {},
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//           );
//           finalReq = codeRes.rows?.[0]?.CODE || null;
//           console.log("Derived request number from GT_SESSION_INFO:", finalReq);
//         } catch (err) {
//           console.warn("Failed to read GT_SESSION_INFO for request number:", err);
//         }
//       }

//       // 2) Fallback: query the newly inserted row inside the same transaction
//       if (!finalReq) {
//         try {
//           const fallbackSql = `
//             SELECT REQUEST_NUMBER FROM (
//               SELECT REQUEST_NUMBER
//               FROM LEAVE_REQUEST_FLOW
//               WHERE COMPANY_CODE = :company_code
//                 AND NVL(CREATED_BY, :created_by) = :created_by
//                 AND NVL(EMPLOYEE_CODE, :employee_code) = :employee_code
//               ORDER BY CREATED_AT DESC
//             ) WHERE ROWNUM = 1
//           `;

//           const bindsFallback = {
//             company_code: data.COMPANY_CODE,
//             created_by: data.CREATED_BY || data.UPDATED_BY || "",
//             employee_code: data.EMPLOYEE_CODE || "",
//           };

//           const fallbackRes: any = await connection.execute(fallbackSql, bindsFallback, {
//             outFormat: oracledb.OUT_FORMAT_OBJECT,
//           });

//           finalReq = fallbackRes.rows?.[0]?.REQUEST_NUMBER || null;
//           console.log("Derived request number from LEAVE_REQUEST_FLOW fallback:", finalReq, bindsFallback);
//         } catch (fbErr) {
//           console.warn("Fallback query for request number failed:", fbErr);
//         }
//       }

//       finalReq = finalReq || "";

//       const sql = `
//         SELECT TRIM(FINAL_APPROVED) AS FINAL_APPROVED
//         FROM LEAVE_REQUEST_FLOW
//         WHERE REQUEST_NUMBER = :req
//           AND COMPANY_CODE   = :comp
//         FETCH FIRST 1 ROWS ONLY
//       `;

//       const binds = { req: finalReq, comp: data.COMPANY_CODE };
//       console.log("Checking FINAL_APPROVED from DB with same txn:", binds);

//       const res = await connection.execute<{ FINAL_APPROVED?: string }>(
//         sql,
//         binds,
//         { outFormat: oracledb.OUT_FORMAT_OBJECT }
//       );

//       const dbFlag = res.rows?.[0]?.FINAL_APPROVED ?? null;
//       const normalizedFlag = (dbFlag ?? data.FINAL_APPROVED ?? "")
//         .toString()
//         .trim()
//         .toUpperCase();

//       return {
//         requestNumber: finalReq,
//         finalApproved: normalizedFlag === "YES",
//       };
//     }
//   );

//   sendLeaveNotifications(requestNumber, data.COMPANY_CODE).catch((err) => {
//     console.error("sendLeaveNotifications failed for", requestNumber, err);
//   });

//   if (finalApproved) {
//     console.log('Triggering background processing for approved leave (post-commit)');
//     processApprovedLeaveRequestsForSingleRecord(requestNumber, data.COMPANY_CODE)
//       .catch((error) => {
//         console.error('Background processing failed:', error);
//       });
//   }

//   return requestNumber;
// }

export async function upsertLeaveApproval(
  data: TLeaveApproval
): Promise<{ requestNumber: string; uuid: string }> {
  const uuid = data.UUID || generateUUID();
  
  const { requestNumber, finalApproved } = await oracleDb.withTransaction(
    async (connection: oracledb.Connection) => {
      let finalReq = data.REQUEST_NUMBER;
      
      if (!finalReq && data.LAST_ACTION === 'SAVEASDRAFT') {
        const draftCheck = await connection.execute(
          `SELECT REQUEST_NUMBER 
           FROM LEAVE_REQUEST_FLOW 
           WHERE UUID = :uuid 
             AND COMPANY_CODE = :company_code
             AND ROWNUM = 1`,
          {
            uuid: { val: uuid },
            company_code: { val: data.COMPANY_CODE }
          },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        const draftRows: any[] = (draftCheck.rows as any[]) || [];
        if (draftRows.length > 0 && draftRows[0]) {
          finalReq = draftRows[0].REQUEST_NUMBER ?? draftRows[0].request_number ?? null;
          console.log("Found existing draft by UUID:", { uuid, requestNumber: finalReq });
        }
      }
      
      const dataWithUUID = {
        ...data,
        REQUEST_NUMBER: finalReq || data.REQUEST_NUMBER,
        UUID: uuid
      };
      
      const exists = await recordExists(
        dataWithUUID.REQUEST_NUMBER,
        dataWithUUID.COMPANY_CODE,
        connection
      );
      console.log("Record exists check:", exists, "for request:", dataWithUUID.REQUEST_NUMBER);

      if (exists) {
        console.log("Update path for:", dataWithUUID.REQUEST_NUMBER);
        await updateLeaveApproval(dataWithUUID, connection);
      } else {
        console.log("Insert path with UUID:", uuid);
        await insertLeaveApproval(dataWithUUID, connection);
        
        if (!dataWithUUID.REQUEST_NUMBER) {
          try {
            const newReqResult: any = await connection.execute(
              `SELECT REQUEST_NUMBER 
               FROM LEAVE_REQUEST_FLOW 
               WHERE UUID = :uuid 
                 AND COMPANY_CODE = :company_code
                 AND ROWNUM = 1`,
              {
                uuid: { val: uuid },
                company_code: { val: data.COMPANY_CODE }
              },
              { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            const rows: any[] = (newReqResult.rows as any[]) || [];
            if (rows.length > 0 && rows[0]) {
              const candidate = rows[0].REQUEST_NUMBER ?? rows[0].request_number;
              if (candidate != null) {
                finalReq = String(candidate);
                console.log("Retrieved trigger-generated REQUEST_NUMBER:", finalReq);
              }
            }
          } catch (err) {
            console.warn("Failed to retrieve new REQUEST_NUMBER:", err);
          }
        }
      }

      if (!finalReq) {
        finalReq = dataWithUUID.REQUEST_NUMBER;
        
        if (!finalReq) {
          try {
            const codeRes: any = await connection.execute(
              `SELECT code FROM GT_SESSION_INFO 
               WHERE session_id = SYS_CONTEXT('USERENV','SESSIONID') 
               AND ROWNUM = 1`,
              {},
              { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            finalReq = codeRes.rows?.[0]?.CODE || null;
          } catch (err) {
            console.warn("GT_SESSION_INFO lookup failed:", err);
          }
        }
      }

      finalReq = finalReq || "";

      const sql = `
        SELECT TRIM(FINAL_APPROVED) AS FINAL_APPROVED
        FROM LEAVE_REQUEST_FLOW
        WHERE REQUEST_NUMBER = :req
          AND COMPANY_CODE   = :comp
        FETCH FIRST 1 ROWS ONLY
      `;

      const binds = { req: finalReq, comp: data.COMPANY_CODE };
      const res = await connection.execute<{ FINAL_APPROVED?: string }>(
        sql,
        binds,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const dbFlag = res.rows?.[0]?.FINAL_APPROVED ?? null;
      const normalizedFlag = (dbFlag ?? data.FINAL_APPROVED ?? "")
        .toString()
        .trim()
        .toUpperCase();

      return {
        requestNumber: finalReq,
        finalApproved: normalizedFlag === "YES",
      };
    }
  );

  sendLeaveNotifications(requestNumber, data.COMPANY_CODE).catch((err) => {
    console.error("sendLeaveNotifications failed for", requestNumber, err);
  });

  if (finalApproved) {
    console.log('Triggering background processing for approved leave');
    processApprovedLeaveRequestsForSingleRecord(requestNumber, data.COMPANY_CODE)
      .catch((error) => {
        console.error('Background processing failed:', error);
      });
  }

  return { requestNumber, uuid };
}

export async function processApprovedLeaveRequestsForSingleRecord(
  requestNumber: string,
  companyCode: string
): Promise<void> {
  try {

    await processApprovedLeaveRequests({
      specificRequestNumber: requestNumber,
      specificCompanyCode: companyCode,
    });
  } catch (error) {
    console.error("Error processing single record:", {
      requestNumber,
      companyCode,
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as any).message
          : String(error),
    });
  }
}

async function recordExists(
  requestNumber: string,
  companyCode: string,
  connection: any
): Promise<boolean> {
  const sql = `
    SELECT COUNT(*) AS cnt 
    FROM LEAVE_REQUEST_FLOW 
    WHERE REQUEST_NUMBER = :request_number 
    AND COMPANY_CODE = :company_code
  `;

  const result = await oracleDb.query(
    sql,
    {
      request_number: { val: requestNumber },
      company_code: { val: companyCode },
    },
    connection
  );

  return (result.rows?.[0]?.CNT || 0) > 0;
}

  async function updateLeaveApproval(data: TLeaveApproval, connection: any) {
    console.log('date end',data.TRAVEL_END_DATE)
  const sql = `
  UPDATE LEAVE_REQUEST_FLOW
  SET
    EMPLOYEE_NAME = NVL(:employee_name, EMPLOYEE_NAME),
    EMPLOYEE_CODE = NVL(:employee_code, EMPLOYEE_CODE),
    HALF_DAY = NVL(:half_day, HALF_DAY),
    DUTY_RESUME_DATE = CASE 
      WHEN :duty_resume_date IS NOT NULL 
      THEN TO_DATE(:duty_resume_date, 'YYYY-MM-DD') 
      ELSE DUTY_RESUME_DATE 
    END,
    ACTUAL_RESUME_DATE = CASE 
      WHEN :actual_resume_date IS NOT NULL 
      THEN TO_DATE(:actual_resume_date, 'YYYY-MM-DD') 
      ELSE ACTUAL_RESUME_DATE 
    END,
    LEAVE_ALLOWANCE = NVL(:leave_allowance, LEAVE_ALLOWANCE),
    ADV_PAYMENT = NVL(:adv_payment, ADV_PAYMENT),
    CAUSE_TYPE = NVL(:cause_type, CAUSE_TYPE),

    TRAVEL_DATE = CASE 
      WHEN :travel_date IS NOT NULL 
      THEN TO_DATE(:travel_date, 'YYYY-MM-DD') 
      ELSE NULL
    END,

    TRAVEL_END_DATE = CASE 
      WHEN :travel_end_date IS NOT NULL 
      THEN TO_DATE(:travel_end_date, 'YYYY-MM-DD') 
      ELSE NULL
    END,

    NAME_OF_REPLACEMENT = NVL(:name_of_replacement, NAME_OF_REPLACEMENT),
    CONTACT_DETAILS_DURING_LEAVE = NVL(:contact_details_during_leave, CONTACT_DETAILS_DURING_LEAVE),
    REMARKS = NVL(:remarks, REMARKS),
    HOD = NVL(:hod, HOD),
    IMMEDIATE_SUPERVISOR = NVL(:immediate_supervisor, IMMEDIATE_SUPERVISOR),
    DEPT_HEAD = NVL(:dept_head, DEPT_HEAD),

    REQUEST_DATE = CASE 
      WHEN :request_date IS NOT NULL 
      THEN TO_DATE(:request_date, 'YYYY-MM-DD') 
      ELSE REQUEST_DATE 
    END,

    LEAVE_TYPE = NVL(:leave_type, LEAVE_TYPE),

    LEAVE_START_DATE = CASE 
      WHEN :leave_start_date IS NOT NULL 
      THEN TO_DATE(:leave_start_date, 'YYYY-MM-DD') 
      ELSE LEAVE_START_DATE 
    END,

    LEAVE_END_DATE = CASE 
      WHEN :leave_end_date IS NOT NULL 
      THEN TO_DATE(:leave_end_date, 'YYYY-MM-DD') 
      ELSE LEAVE_END_DATE 
    END,

    LEAVE_DAYS = NVL(:leave_days, LEAVE_DAYS),
    LAST_ACTION = NVL(:last_action, LAST_ACTION),
    NEXT_ACTION_BY = NVL(:next_action_by, NEXT_ACTION_BY),
    SENTBACK_HISTORY = NVL(:sentback_history, SENTBACK_HISTORY),
    CANCEL_REMARK = NVL(:cancel_remark, CANCEL_REMARK),
    AIR_TICKET = NVL(:air_ticket, AIR_TICKET),
    AIR_ROUTE = NVL(:air_route, AIR_ROUTE),

    UPDATED_BY = :updated_by,
    UPDATED_AT = SYSTIMESTAMP,
    UUID = NVL(:uuid, UUID)

  WHERE COMPANY_CODE = :company_code
    AND REQUEST_NUMBER = :request_number
`;

const params = {
  employee_name: { val: data.EMPLOYEE_NAME },
  half_day: { val: data.HALF_DAY || 'N' },
  duty_resume_date: { val: data.DUTY_RESUME_DATE || null, type: oracledb.STRING },
  actual_resume_date: { val: data.ACTUAL_RESUME_DATE || null, type: oracledb.STRING },
  leave_allowance: { val: data.LEAVE_ALLOWANCE },
  adv_payment: { val: data.ADV_PAYMENT },
  cause_type: { val: data.CAUSE_TYPE },
  
    travel_date: { val: toOracleDate(data.TRAVEL_DATE) || "" },
    travel_end_date: { val: toOracleDate(data.TRAVEL_END_DATE) || "" },

  name_of_replacement: { val: data.NAME_OF_REPLACEMENT },
  contact_details_during_leave: { val: data.CONTACT_DETAILS_DURING_LEAVE },
  remarks: { val: data.REMARKS },
  hod: { val: data.HOD },
  immediate_supervisor: { val: data.IMMEDIATE_SUPERVISOR },
  dept_head: { val: data.DEPT_HEAD },

  request_date: { val: data.REQUEST_DATE || null, type: oracledb.STRING },
  employee_code: { val: data.EMPLOYEE_CODE },
  leave_type: { val: data.LEAVE_TYPE },

  leave_start_date: { val: data.LEAVE_START_DATE || null, type: oracledb.STRING },
  leave_end_date: { val: data.LEAVE_END_DATE || null, type: oracledb.STRING },

  leave_days: { val: data.LEAVE_DAYS },
  last_action: { val: data.LAST_ACTION },
  updated_by: { val: data.UPDATED_BY },

  company_code: { val: data.COMPANY_CODE },
  request_number: { val: data.REQUEST_NUMBER },

  next_action_by: { val: data.NEXT_ACTION_BY || null },
  sentback_history: { val: data.SENTBACK_HISTORY || null },
  cancel_remark: { val: data.CANCEL_REMARK || null },

  air_route: { val: data.AIR_ROUTE || null },
  air_ticket: { val: data.AIR_TICKET || null },
  uuid: { val: data.UUID },
};


    console.log("Update parameters:", JSON.stringify(params, null, 2));
    console.log("Update sql:", sql); 
    
    const result = await oracleDb.query(sql, params, connection);
    console.log("Update sql result:", result); 
  }

const formatDate = (date: string | number | Date | undefined) => {
  if (!date) return null;

  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  const parsedDate = new Date(date);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split("T")[0];
  }

  return null;
};

async function insertLeaveApproval(data: TLeaveApproval, connection: any) {
  console.log(
    "before date conversion",
    data.LEAVE_START_DATE,
    data.LEAVE_END_DATE
  );
  const leaveStartDate = toOracleDate(data.LEAVE_START_DATE);
  if (!leaveStartDate) {
    throw new Error("LEAVE_START_DATE is required and must be a valid date");
  }

  const leaveEndDate = toOracleDate(data.LEAVE_END_DATE);
  if (!leaveEndDate) {
    throw new Error("LEAVE_END_DATE is required and must be a valid date");
  }
  console.log(
    "after date conversion",
    data.LEAVE_START_DATE,
    data.LEAVE_END_DATE
  );

  const sql = `
 INSERT INTO LEAVE_REQUEST_FLOW (
    EMPLOYEE_NAME, HALF_DAY, DUTY_RESUME_DATE, ACTUAL_RESUME_DATE,
    LEAVE_ALLOWANCE, ADV_PAYMENT, CAUSE_TYPE, TRAVEL_DATE,TRAVEL_END_DATE,
    NAME_OF_REPLACEMENT, CONTACT_DETAILS_DURING_LEAVE, REMARKS,
    FLOW_CODE, HOD, UPDATED_BY, IMMEDIATE_SUPERVISOR, DEPT_HEAD,
    COMPANY_CODE, REQUEST_NUMBER, REQUEST_DATE,
    EMPLOYEE_CODE, LEAVE_TYPE, LEAVE_START_DATE, LEAVE_END_DATE,
    LEAVE_DAYS, AIR_TICKET, AIR_ROUTE, LAST_ACTION, CURRENT_STEP, 
    FLOW_LEVEL_INITIAL, FLOW_LEVEL_RUNNING, CREATE_USER, CREATE_DATE,
    CREATED_BY, CREATED_AT, FLOW_LEVEL_FINAL, UUID
) VALUES (
    :employee_name, :half_day,
    CASE WHEN :duty_resume_date IS NOT NULL THEN TO_DATE(:duty_resume_date, 'YYYY-MM-DD') ELSE NULL END,
    CASE WHEN :actual_resume_date IS NOT NULL THEN TO_DATE(:actual_resume_date, 'YYYY-MM-DD') ELSE NULL END,
    :leave_allowance, :adv_payment, :cause_type,
    CASE WHEN :travel_date IS NOT NULL THEN TO_DATE(:travel_date, 'YYYY-MM-DD') ELSE NULL END,
     CASE WHEN :travel_end_date IS NOT NULL THEN TO_DATE(:travel_date, 'YYYY-MM-DD') ELSE NULL END,
    :name_of_replacement, :contact_details_during_leave, :remarks,
    :flow_code, :hod, :updated_by, :immediate_supervisor, :dept_head,
    :company_code, :request_number,
    TO_DATE(:request_date, 'YYYY-MM-DD'),
    :employee_code, :leave_type,
    TO_DATE(:leave_start_date, 'YYYY-MM-DD'),
    TO_DATE(:leave_end_date, 'YYYY-MM-DD'),
    :leave_days, :air_ticket, :air_route, :last_action, 1, 1, 4, :create_user, SYSDATE,
    :created_by, SYSDATE, 4, :uuid
)
`;

  const params = {
    employee_name: { val: data.EMPLOYEE_NAME },
    half_day: { val: data.HALF_DAY || "N" },
    duty_resume_date: { val: toOracleDate(data.DUTY_RESUME_DATE) || null },
    actual_resume_date: { val: toOracleDate(data.ACTUAL_RESUME_DATE) || null },
    leave_allowance: { val: data.LEAVE_ALLOWANCE },
    adv_payment: { val: data.ADV_PAYMENT },
    cause_type: { val: data.CAUSE_TYPE },
    travel_date: { val: toOracleDate(data.TRAVEL_DATE) || "" },
    travel_end_date: { val: toOracleDate(data.TRAVEL_END_DATE) || "" },
    name_of_replacement: { val: data.NAME_OF_REPLACEMENT },
    contact_details_during_leave: { val: data.CONTACT_DETAILS_DURING_LEAVE },
    remarks: { val: data.REMARKS },
    flow_code: { val: "004" },
    hod: { val: data.HOD },
    updated_by: { val: data.UPDATED_BY },
    immediate_supervisor: { val: data.IMMEDIATE_SUPERVISOR },
    dept_head: { val: data.DEPT_HEAD },
    company_code: { val: data.COMPANY_CODE },
    request_number: { val: data.REQUEST_NUMBER },
    request_date: {
      val: toOracleDate(data.REQUEST_DATE) || leaveStartDate || "",
    },
    employee_code: { val: data.EMPLOYEE_CODE },
    leave_type: { val: data.LEAVE_TYPE },
    leave_start_date: { val: leaveStartDate },
    leave_end_date: { val: leaveEndDate },
    leave_days: { val: data.LEAVE_DAYS },
    last_action: { val: data.LAST_ACTION },
    air_route: { val: data.AIR_ROUTE || null },
    air_ticket: { val: data.AIR_TICKET || null },

    create_user: { val: data.UPDATED_BY },
    created_by: { val: data.CREATED_BY },
    uuid: { val: data.UUID },

  };

  console.log("Parameters for insert:", JSON.stringify(params, null, 2));

console.log("📋 TOAD-READY SQL:");
console.log("--------------------------------------------------");
console.log(`INSERT INTO LEAVE_REQUEST_FLOW (
  EMPLOYEE_NAME, HALF_DAY, DUTY_RESUME_DATE, ACTUAL_RESUME_DATE,
  LEAVE_ALLOWANCE, ADV_PAYMENT, CAUSE_TYPE, TRAVEL_DATE,
  NAME_OF_REPLACEMENT, CONTACT_DETAILS_DURING_LEAVE, REMARKS, 
  FLOW_CODE, HOD, UPDATED_BY, IMMEDIATE_SUPERVISOR, DEPT_HEAD,
  COMPANY_CODE, REQUEST_NUMBER, REQUEST_DATE,
  EMPLOYEE_CODE, LEAVE_TYPE, LEAVE_START_DATE, LEAVE_END_DATE,
  LEAVE_DAYS, AIR_TICKET, AIR_ROUTE,LAST_ACTION, CURRENT_STEP, FLOW_LEVEL_INITIAL, FLOW_LEVEL_RUNNING, CREATE_USER, CREATE_DATE,
  CREATED_BY, CREATED_AT, FLOW_LEVEL_FINAL
) VALUES (
  '${data.EMPLOYEE_NAME}', '${data.HALF_DAY || "N"}', 
  ${data.DUTY_RESUME_DATE ? `TO_DATE('${toOracleDate(data.DUTY_RESUME_DATE)}', 'YYYY-MM-DD')` : 'NULL'},
  ${data.ACTUAL_RESUME_DATE ? `TO_DATE('${toOracleDate(data.ACTUAL_RESUME_DATE)}', 'YYYY-MM-DD')` : 'NULL'},
  '${data.LEAVE_ALLOWANCE}', '${data.ADV_PAYMENT}', '${data.CAUSE_TYPE}',
  ${data.TRAVEL_DATE ? `TO_DATE('${toOracleDate(data.TRAVEL_DATE)}', 'YYYY-MM-DD')` : 'NULL'},
  '${data.NAME_OF_REPLACEMENT}', '${data.CONTACT_DETAILS_DURING_LEAVE}', '${data.REMARKS}', 
  '004', '${data.HOD}', '${data.UPDATED_BY}', '${data.IMMEDIATE_SUPERVISOR}', '${data.DEPT_HEAD}',
  '${data.COMPANY_CODE}', '${data.REQUEST_NUMBER}',
  TO_DATE('${toOracleDate(data.REQUEST_DATE) || leaveStartDate}', 'YYYY-MM-DD'),
  '${data.EMPLOYEE_CODE}', '${data.LEAVE_TYPE}',
  TO_DATE('${leaveStartDate}', 'YYYY-MM-DD'),
  TO_DATE('${leaveEndDate}', 'YYYY-MM-DD'),
  ${data.LEAVE_DAYS}, '${data.LAST_ACTION}', 1, 1, 4, '${data.UPDATED_BY}', SYSDATE, 
  '${data.CREATED_BY}', SYSDATE, 4
)`);
console.log("--------------------------------------------------");

  try {
    await oracleDb.query(sql, params, connection);
  } catch (error: any) {
    console.error("Insert error:", error);
    if (error.message.includes("ORA-01400")) {
      throw new Error(`Required field cannot be null: ${error.message}`);
    }
    throw error;
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// === Express handler ===
export const upsertLeaveApprovalHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: TLeaveApproval = req.body;

    const requiredFields: (keyof TLeaveApproval)[] = [
      "COMPANY_CODE",
      "REQUEST_NUMBER",
      "EMPLOYEE_CODE",
      "LEAVE_TYPE",
      "LEAVE_START_DATE",
      "LEAVE_END_DATE",
      "REQUEST_DATE",
      "CREATED_BY",
      "UPDATED_BY",
    ];

    console.log("Upsert Leave Approval Request Data:", data);


    const leaveApprovalData: TLeaveApproval = {
      ...data,
    };

    const requestNumber = await upsertLeaveApproval(leaveApprovalData);
    console.log("LAST_ACTION", leaveApprovalData.LAST_ACTION); 

    let messageType = '';

    if (leaveApprovalData.LAST_ACTION === 'SAVEASDRAFT') {
      messageType = 'Saved as draft';
    } else if (leaveApprovalData.LAST_ACTION === 'SENTBACK') {
      messageType = 'Sent back';
    } else if (leaveApprovalData.LAST_ACTION === 'REJECTED') {
      messageType = 'Rejected';
    } else if (leaveApprovalData.LAST_ACTION === 'CANCEL') {
      messageType = 'Cancelled';
    } else if (leaveApprovalData.LAST_ACTION === 'SUBMITTED') {
      messageType = 'Submitted';
    } else {
      messageType = 'Updated';
    }


    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: `${messageType} successfully.`,
      request_number: requestNumber,
    });
  } catch (error: any) {
    console.error("Upsert Leave Approval Error:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to upsert leave approval.",
    });
  }
};

const oq = (s: string) => s.replace(/'/g, "''"); 

export async function processApprovedLeaveRequests(options?: {
  specificRequestNumber?: string;
  specificCompanyCode?: string;
}): Promise<void> {
  try {
    console.log("Starting to process approved leave requests...", options);

    let whereClause = "WHERE FINAL_APPROVED = 'YES'";

    if (options?.specificRequestNumber && options?.specificCompanyCode) {
      const rn = oq(options.specificRequestNumber);
      const cc = oq(options.specificCompanyCode);
      whereClause += ` AND REQUEST_NUMBER = '${rn}' AND COMPANY_CODE = '${cc}'`;
      console.log("Using specific record filter (inlined):", {
        requestNumber: rn,
        companyCode: cc,
      });
    }

    const fileDataResult = await oracleDb.query(
      `SELECT 
        REQUEST_NUMBER, SR_NO, ORG_FILE_NAME, AWS_FILE_LOCN, EXTENSIONS, USER_FILE_NAME
      FROM UPLOADED_FILES_DLTS_VH
      WHERE REQUEST_NUMBER = :requestNumber AND (FILE_TRANSFER != 'Y' OR FILE_TRANSFER IS NULL)`,
      { requestNumber: { val: options?.specificRequestNumber } }
    );
    const fileData: any[] = fileDataResult.rows || fileDataResult;

    for (const file of fileData) {
      try {
        await HrService.insertUploadedFileEmployee(file);
      } catch (error: any) {
        console.error(
          `Failed to send file data for REQUEST_NUMBER: ${options?.specificRequestNumber}`,
          error
        );

        const detailedError =
          error?.response?.data ??
          error?.response ??
          error?.message ??
          String(error);

        const detailedErrorText =
          typeof detailedError === "string"
            ? detailedError
            : JSON.stringify(detailedError, null, 2);

        const notifPayload = {
          event: "HR_API_ERROR",
          message: `Failed to upload file to HR for Request: ${options?.specificRequestNumber}\nError: ${error?.message || "Unknown error"}\n\nDetails: ${detailedErrorText}`,
          subject: "HR API File Upload Failed",
          request_users: "Rohan.Yadav@bayanattechnology.com",
          htmlMessage: `
            <h3>HR API File Upload Failed</h3>
            <p><strong>Request Number:</strong> ${options?.specificRequestNumber}</p>
            <p><strong>Error Message:</strong> ${error?.message || "Unknown error"}</p>
            <p><strong>Error Details:</strong></p>
            <pre>${detailedErrorText}</pre>
            <p><strong>File Details:</strong></p>
            <pre>${JSON.stringify(file, null, 2)}</pre>
          `,
        };

        try {
          console.log("notifyUser payload (HR file upload):", notifPayload);
          const notifResult: any = await notifyUser(notifPayload);
          console.log("notifyUser result (HR file upload):", notifResult);
        } catch (notifErr) {
          console.error("notifyUser failed (HR file upload):", notifErr);
        }

        return;
      }
    }

    if (fileData.length > 0) {
      await oracleDb.query(
        `UPDATE UPLOADED_FILES_DLTS_VH 
         SET FILE_TRANSFER = 'Y' 
         WHERE REQUEST_NUMBER = :requestNumber`,
        { requestNumber: { val: options?.specificRequestNumber } }
      );
    }

    const approvedRequests = await oracleDb.query(
      `
      SELECT
        NVL(REQUEST_NUMBER, '') AS "requestNumber",
        NVL(COMPANY_CODE, '') AS "companyCode",
        NVL(EMPLOYEE_CODE, '') AS "employeeCode",
        TO_CHAR(LEAVE_REQUEST_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "leaveRequestDate",
        TO_CHAR(TRAVEL_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "travelDate",
        NVL(LEAVE_TYPE, '') AS "leaveType",
        TO_CHAR(LEAVE_START_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "leaveStartDate",
        TO_CHAR(LEAVE_END_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "leaveEndDate",
        NVL(LEAVE_DAYS, 0) AS "leaveDays",
        NVL(LEAVE_REASON, '') AS "leaveReason",
        NVL(DAYS_ADJUSTED, 0) AS "daysAdjusted",
        NVL(HALF_DAY, '') AS "halfDay",
        NVL(AIR_TICKET, '') AS "airTicket",
        NVL(AIR_TICKET_SELF, '') AS "airTicketSelf",
        NVL(AIR_TICKET_WIFE, '') AS "airTicketWife",
        NVL(AIR_TICKET_CHILDREN, 0) AS "airTicketChildren",
        TO_CHAR(REQUEST_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "requestDate",
        NVL(FLOW_CODE, '') AS "flowCode",
        NVL(FLOW_LEVEL_INITIAL, 0) AS "flowLevelInitial",
        NVL(FLOW_LEVEL_RUNNING, 0) AS "flowLevelRunning",
        NVL(FLOW_LEVEL_FINAL, 0) AS "flowLevelFinal",
        NVL(FA_UPLOADED, '') AS "faUploaded",

        CASE WHEN UPPER(TRIM(FINAL_APPROVED)) = 'YES' THEN 'YES' ELSE 'NO' END
                                                                     AS "finalApproved",

        NVL(CREATE_USER, '') AS "createUser",
        TO_CHAR(CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "createDate",
        NVL(LAST_UPDATED, '') AS "lastUpdated",
        NVL(LAST_ACTION, '') AS "lastAction",
        NVL(HISTORY_SERIAL, 0) AS "historySerial",
        NVL(CANCEL_FLAG, '') AS "cancelFlag",
        NVL(CANCEL_USER, '') AS "cancelUser",
        TO_CHAR(CANCEL_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "cancelDate",
        NVL(CANCEL_REMARK, '') AS "cancelRemark",
        NVL(REMARKS_HISTRY, '') AS "remarksHistry",
        NVL(REMARKS, '') AS "remarks",
        NVL(DESCRIPTION, '') AS "description",
        NVL(COMMENTS, '') AS "comments",
        NVL(MOBILE_APP_UPDATE, 'N') AS "mobileAppUpdate",
        TO_CHAR(UPDATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS "updatedAt",
        NVL(UPDATED_BY, '') AS "updatedBy",
        NVL(CREATED_BY, '') AS "createdBy",
        TO_CHAR(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS "createdAt",
        NVL(HOD, '') AS "hod",
        NVL(DEPT_HEAD, '') AS "deptHead",
        NVL(IMMEDIATE_SUPERVISOR, '') AS "immediateSupervisor",
        NVL(LOG_NUMBER, 0) AS "logNumber",
        NVL(NEXT_ACTION_BY, '') AS "nextActionBy",
        NVL(LEAVE_ALLOWANCE, '') AS "leaveAllowance",
        NVL(ADV_PAYMENT, '') AS "advPayment",
        NVL(CAUSE_TYPE, '') AS "causeType",
        NVL(NAME_OF_REPLACEMENT, '') AS "nameOfReplacement",
        NVL(CONTACT_DETAILS_DURING_LEAVE, '') AS "contactDetailsDuringLeave",
        TO_CHAR(DUTY_RESUME_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "dutyResumeDate",
        TO_CHAR(ACTUAL_RESUME_DATE, 'YYYY-MM-DD HH24:MI:SS') AS "actualResumeDate",
        NVL(EMPLOYEE_NAME, '') AS "employeeName",

        /* keep if you still need flags downstream */
        NVL(DATA_TRANSFER, 'N') AS "dataTransfer",
        NVL(DATE_FLAG, 'N') AS "dateFlag"

      FROM LEAVE_REQUEST_FLOW
      ${whereClause}
        AND NVL(NULLIF(TRIM(DATA_TRANSFER), ''), 'N') = 'N'
      `,
    );

    console.log(`Found ${approvedRequests.rows?.length || 0} records to INSERT`);

    for (const request of approvedRequests.rows || []) {
      try {
        await HrService.insertLeaveRequest(request);
        const rn = oq(request.requestNumber);
        const cc = oq(request.companyCode);
        await oracleDb.query(
          `UPDATE LEAVE_REQUEST_FLOW
             SET DATA_TRANSFER = 'Y',
                 UPDATED_AT = SYSTIMESTAMP
           WHERE REQUEST_NUMBER = '${rn}'
             AND COMPANY_CODE = '${cc}'`
        );

        console.log(`Inserted/marked transferred: ${request.requestNumber}`);
      } catch (error: any) {
        console.error("Failed to insert request:", {
          requestNumber: request.requestNumber,
          error: error.message,
          fullError: error?.response?.data ?? error,
        });

        const detailedError =
          error?.response?.data ??
          error?.response ??
          error?.message ??
          String(error);

        const detailedErrorText =
          typeof detailedError === "string"
            ? detailedError
            : JSON.stringify(detailedError, null, 2);

        const notifPayload = {
          event: "HR_API_ERROR",
          message: `Failed to transfer leave request to HR \nRequestNumber: ${request.requestNumber}\nCompanyCode: ${request.companyCode}\nError: ${error?.message || "Unknown error"}\n\nDetails: ${detailedErrorText}`,
          subject: "HR API Leave Transfer Failed",
          request_users: "Rohan.Yadav@bayanattechnology.com",
          htmlMessage: `
            <h3>HR API Leave Transfer Failed</h3>
            <p><strong>Request Number:</strong> ${request.requestNumber}</p>
            <p><strong>Company Code:</strong> ${request.companyCode}</p>
            <p><strong>Error Message:</strong> ${error?.message || "Unknown error"}</p>
            <p><strong>Error Details:</strong></p>
            <pre>${detailedErrorText}</pre>
            <p><strong>Request Payload:</strong></p>
            <pre>${JSON.stringify(request, null, 2)}</pre>
          `,
        };

        try {
          console.log("notifyUser payload (HR leave transfer):", notifPayload);
          const notifResult: any = await notifyUser(notifPayload);
          console.log("notifyUser result (HR leave transfer):", notifResult);
        } catch (notifErr) {
          console.error("notifyUser failed (HR leave transfer):", notifErr);
        }
      }
    }

    const resumeRequests = await oracleDb.query(
      `SELECT
          REQUEST_NUMBER                                   AS "requestNumber",
          COMPANY_CODE                                     AS "companyCode",
          TO_CHAR(DUTY_RESUME_DATE,   'YYYY-MM-DD')        AS "dutyResumeDate",
          TO_CHAR(ACTUAL_RESUME_DATE, 'YYYY-MM-DD')        AS "actualResumeDate",
          NVL(DATE_FLAG, 'N')                              AS "dateFlag",
          NVL(DATA_TRANSFER, 'N')                          AS "dataTransfer"
       FROM LEAVE_REQUEST_FLOW
       ${whereClause}
         AND (DUTY_RESUME_DATE IS NOT NULL OR ACTUAL_RESUME_DATE IS NOT NULL)
         AND NVL(DATE_FLAG, 'N') != 'Y'
         AND NVL(DATA_TRANSFER, 'N') = 'Y'`
    );

    console.log(
      `Found ${resumeRequests.rows?.length || 0} records with resume dates to update`
    );

    for (const r of resumeRequests.rows || []) {
      const hasDuty = !!r.dutyResumeDate;
      const hasActual = !!r.actualResumeDate;
      if (!hasDuty && !hasActual) {
        console.log(`Skipping resume API; no dates present for ${r.requestNumber}`);
        continue;
      }

      try {
        await HrService.updateLeaveResume({
          requestNumber: r.requestNumber,
          dutyResumeDate: hasDuty ? new Date(r.dutyResumeDate) : null,
          actualResumeDate: hasActual ? new Date(r.actualResumeDate) : null,
        });

        const rn = oq(r.requestNumber);
        const cc = oq(r.companyCode);
        await oracleDb.query(
          `UPDATE LEAVE_REQUEST_FLOW
             SET DATE_FLAG  = 'Y',
                 UPDATED_AT = SYSTIMESTAMP
           WHERE REQUEST_NUMBER = '${rn}'
             AND COMPANY_CODE   = '${cc}'`
        );

        console.log(`Updated resume dates for: ${r.requestNumber}`);
      } catch (error: any) {
        console.error('Failed to update resume dates:', {
          requestNumber: r.requestNumber,
          error: error.message,
        });
      }
    }

    const status = await oracleDb.query(
      `SELECT COUNT(*) AS total,
              COUNT(CASE WHEN NVL(DATA_TRANSFER,'N')='Y' THEN 1 END) AS inserted,
              COUNT(CASE WHEN NVL(DATE_FLAG,'N')='Y'    THEN 1 END) AS resumed
         FROM LEAVE_REQUEST_FLOW
         ${whereClause}`
    );
    console.log('Post-processing status:', status.rows?.[0] || {});
  } catch (error) {
    console.error("Error in processApprovedLeaveRequests:", error);
    throw error;
  }
};

export const saveFileHR = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { request_number, files } = req.body;

  if (!request_number) {
    return res.status(400).json({
      success: false,
      message: "request_number is required.",
    });
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "files must be a non-empty array.",
    });
  }

  const duplicateRecords: string[] = [];
  const successfulRecords: { org_file_name: string; sr_no: number }[] = [];

  try {
    for (const file of files) {
      const { org_file_name } = file;

      const duplicateCheckResult = await oracleDb.query(
        `SELECT COUNT(*) AS COUNT 
         FROM UPLOADED_FILES_DLTS_VH 
         WHERE request_number = :request_number AND org_file_name = :org_file_name`,
        {
          request_number: { val: request_number },
          org_file_name: { val: org_file_name },
        }
      );

      const count = duplicateCheckResult.rows?.[0]?.COUNT || 0;

      if (count > 0) {
        duplicateRecords.push(org_file_name);
        continue;
      }

      const {
        company_code,
        file_name,
        extensions,
        aws_file_locn,
        flow_level,
        modules,
        updated_by,
        created_by,
        user_file_name,
      } = file;

      await oracleDb.query(
        `INSERT INTO UPLOADED_FILES_DLTS_VH (
          company_code, request_number, file_name, extensions, org_file_name,
          aws_file_locn, flow_level, modules, updated_by, created_by, 
          user_file_name, created_at, updated_at
        ) VALUES (
          :company_code, :request_number, :file_name, :extensions, :org_file_name,
          :aws_file_locn, :flow_level, :modules, :updated_by, :created_by,
          :user_file_name, SYSDATE, SYSDATE
        )`,
        {
          company_code: { val: company_code || null },
          request_number: { val: request_number },
          file_name: { val: file_name || null },
          extensions: { val: extensions || null },
          org_file_name: { val: org_file_name || null },
          aws_file_locn: { val: aws_file_locn || null },
          flow_level: { val: flow_level || null },
          modules: { val: modules || null },
          updated_by: { val: updated_by || null },
          created_by: { val: created_by || null },
          user_file_name: { val: user_file_name || null },
        }
      );

      // Fetch SR_NO
      const srNoResult = await oracleDb.query(
        `SELECT SR_NO 
         FROM UPLOADED_FILES_DLTS_VH 
         WHERE request_number = :request_number 
         AND org_file_name = :org_file_name 
         ORDER BY created_at DESC 
         FETCH FIRST 1 ROW ONLY`,
        {
          request_number: { val: request_number },
          org_file_name: { val: org_file_name },
        }
      );

      const sr_no = srNoResult.rows?.[0]?.SR_NO;
      if (sr_no) {
        successfulRecords.push({ org_file_name, sr_no });
      }
    }

    return res.status(200).json({
      success: true,
      message: "File data processed successfully.",
      data: {
        successfulRecords,
        duplicateRecords,
      },
    });
  } catch (error) {
    console.error("Error storing file data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while storing file data.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
