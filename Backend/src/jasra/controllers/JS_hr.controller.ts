import { Response } from "express";
import constants from "../../helpers/constants";
import { ISearch, RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";

// import { IHrBank } from "../../interfaces/Hr/hr_bank";

import { In /*, FindOptionsWhere, FindManyOptions */ } from "typeorm";

// import { getSearchFilterQuery } from "../../helpers/functions";
// import { HrAirport } from "../../models/Hr/hr_airport";
// import { HrBank } from "../../models/Hr/hr_bank";
// import { Categorymaster } from "../../models/Hr/hr_category";
// import { HrContract } from "../../models/Hr/hr_contract";
// import { HrDepartment } from "../../models/Hr/hr_department";
// import { HrDesignation } from "../../models/Hr/hr_designation";
// import { HrDivision } from "../../models/Hr/hr_division";
// import { HrEmpStatus } from "../../models/Hr/hr_employee_status";
// import { HrGrade } from "../../models/Hr/hr_grade";
// import { KpiNamemaster } from "../../models/Hr/hr_kpiname";
// import { HrLabourDesignation } from "../../models/Hr/hr_labour_designation";
// import { Leavetype } from "../../models/Hr/hr_leavetype";
// import { OperationMaster } from "../../models/Hr/hr_operation";
// import { HrPaycomponent } from "../../models/Hr/hr_paycomponents";
// import { HrSection } from "../../models/Hr/hr_section";
// import { HrSponsor } from "../../models/Hr/hr_sponsor";
// import { HrViewEmp } from "../../views/hr/hr_view_employee";
import { oracleDb, TypeORMService } from "../../database/connection";

// ===========================================================================
//  ✅ ADDED: sort / filter whitelists + filter SQL builder
//  These field names must match the `field:` values used in the frontend
//  columnDefs (which in turn must match column names in the view).
// ===========================================================================
const ALLOWED_SORT_FIELDS: Record<string, string> = {
  REQUEST_NUMBER: "REQUEST_NUMBER",
  REQUEST_DATE: "REQUEST_DATE",
  LEAVE_START_DATE: "LEAVE_START_DATE",
  LEAVE_END_DATE: "LEAVE_END_DATE",
  LEAVE_TYPE: "LEAVE_TYPE",
  LEAVE_TYPE_DESC: "LEAVE_TYPE_DESC",
  EMPLOYEE_CODE: "EMPLOYEE_CODE",
  EMPLOYEE_NAME_DISPLAY: "EMPLOYEE_NAME_DISPLAY",
  NEXT_ACTION_BY_NAME: "NEXT_ACTION_BY_NAME",
  REMARKS: "REMARKS"
};

const ALLOWED_FILTER_COLUMNS = new Set<string>([
  "REQUEST_NUMBER",
  "REQUEST_DATE",
  "LEAVE_START_DATE",
  "LEAVE_END_DATE",
  "LEAVE_TYPE",
  "LEAVE_TYPE_DESC",
  "EMPLOYEE_CODE",
  "EMPLOYEE_NAME_DISPLAY",
  "NEXT_ACTION_BY_NAME",
  "REMARKS"
]);

/**
 * Builds a parameterised `AND (... AND ...)` clause from the frontend's
 * filter.search payload. Returns empty string if nothing valid is present.
 */
function buildFilterSql(search: any): { sql: string; binds: Record<string, any> } {
  const clauses: string[] = [];
  const binds: Record<string, any> = {};
  if (!Array.isArray(search)) return { sql: "", binds };

  search.forEach((group: any, gi: number) => {
    if (!Array.isArray(group)) return;
    group.forEach((clause: any, ci: number) => {
      const col = String(clause?.field_name ?? "").toUpperCase();
      if (!ALLOWED_FILTER_COLUMNS.has(col)) return; // 🔒 whitelist

      const key = `f_${gi}_${ci}`;
      const op = String(clause?.operator ?? "equals").toLowerCase();
      const val = clause?.field_value;

      switch (op) {
        case "contains":
          clauses.push(`UPPER(${col}) LIKE :${key}`);
          binds[key] = `%${String(val).toUpperCase()}%`;
          break;
        case "not_contains":
          clauses.push(`UPPER(${col}) NOT LIKE :${key}`);
          binds[key] = `%${String(val).toUpperCase()}%`;
          break;
        case "starts_with":
          clauses.push(`UPPER(${col}) LIKE :${key}`);
          binds[key] = `${String(val).toUpperCase()}%`;
          break;
        case "ends_with":
          clauses.push(`UPPER(${col}) LIKE :${key}`);
          binds[key] = `%${String(val).toUpperCase()}`;
          break;
        case "equals":
          clauses.push(`UPPER(${col}) = :${key}`);
          binds[key] = String(val).toUpperCase();
          break;
        case "not_equals":
          clauses.push(`UPPER(${col}) <> :${key}`);
          binds[key] = String(val).toUpperCase();
          break;
        case "gt":
          clauses.push(`${col} > :${key}`);
          binds[key] = val;
          break;
        case "gte":
          clauses.push(`${col} >= :${key}`);
          binds[key] = val;
          break;
        case "lt":
          clauses.push(`${col} < :${key}`);
          binds[key] = val;
          break;
        case "lte":
          clauses.push(`${col} <= :${key}`);
          binds[key] = val;
          break;
        case "between": {
          const from = Array.isArray(val) ? val[0] : val;
          const to = Array.isArray(val) ? val[1] : val;
          clauses.push(`${col} BETWEEN :${key}_from AND :${key}_to`);
          binds[`${key}_from`] = from;
          binds[`${key}_to`] = to;
          break;
        }
        case "is_null":
          clauses.push(`${col} IS NULL`);
          break;
        case "is_not_null":
          clauses.push(`${col} IS NOT NULL`);
          break;
        default:
          break;
      }
    });
  });

  return {
    sql: clauses.length ? ` AND (${clauses.join(" AND ")})` : "",
    binds
  };
}

export const getHrMaster = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { masters } = req.params;
    const requestUser: IUser = req.user;
    const uniqueCode = req.query.code;

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    switch (masters) {
      // =====================================================================
      // LEAVE FLOW (kept active)
      // =====================================================================
      case "Pg_Leave_flow":
      case "Pg_leave_flow_Rejected":
      case "Pg_leave_flow_close":
      case "Pg_leave_flow_cancel":
      case "Pg_leave_flow_InProgress": {
        // ---------- ✅ CHANGED: clamp page/limit for infinite scroll ----------
        const page = Math.max(Number(req.query.page) || 1, 1);
        const requestedLimit = Number(req.query.limit) || 20;
        const maxLimit = 100; // safety cap per fetch
        const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);
        const offset = (page - 1) * limit;

        const loginid = req.query.code as string;

        if (!requestUser?.company_code || !loginid) {
          console.error("Missing company_code or loginid");
          res.status(400).json({ success: false, message: "Invalid request" });
          return;
        }

        const bindParams: any = {
          company_code: requestUser.company_code,
          loginid: loginid
        };

        let whereConditions = "";

        switch (masters) {
          case "Pg_Leave_flow":
            whereConditions = `
              company_code = :company_code
              AND LAST_ACTION NOT IN ('REJECTED', 'CANCEL')
              AND (
                   (NEXT_ACTION_BY = :loginid AND FINAL_APPROVED <> 'YES')
                   OR
                   (IMMEDIATE_SUPERVISOR = :loginid
                    AND ACTUAL_RESUME_DATE IS NOT NULL
                    AND RESUME_DATE_APPROVED = 'NO')
                  )
            `;
            break;

          case "Pg_leave_flow_Rejected":
            whereConditions = `
              company_code = :company_code
              AND LAST_ACTION = 'REJECTED'
              AND (
                    CREATED_BY = :loginid
                    OR IMMEDIATE_SUPERVISOR = :loginid
                    OR HOD = :loginid
                    OR DEPT_HEAD = :loginid
                    OR EXISTS (
                        SELECT 1
                        FROM ms_hr_employee e
                        JOIN ms_hr_department d
                            ON d.DEPT_CODE = e.DEPT_CODE
                            AND d.DIV_CODE = e.DIV_CODE
                        WHERE e.EMPLOYEE_ID = CREATED_BY
                          AND d.LEAVE_FINAL_APPROVER = :loginid
                    )
              )
            `;
            break;

          case "Pg_leave_flow_close":
            whereConditions = `
              company_code = :company_code
              AND FINAL_APPROVED = 'YES'
              AND LAST_ACTION NOT IN ('REJECTED', 'CANCEL')
              AND (
                    CREATED_BY = :loginid
                    OR IMMEDIATE_SUPERVISOR = :loginid
                    OR HOD = :loginid
                    OR DEPT_HEAD = :loginid
                    OR EXISTS (
                        SELECT 1
                        FROM ms_hr_employee e
                        JOIN ms_hr_department d
                            ON d.DEPT_CODE = e.DEPT_CODE
                            AND d.DIV_CODE = e.DIV_CODE
                        WHERE e.EMPLOYEE_ID = CREATED_BY
                          AND d.LEAVE_FINAL_APPROVER = :loginid
                    )
              )
            `;
            break;

          case "Pg_leave_flow_cancel":
            whereConditions = `
              company_code = :company_code
              AND LAST_ACTION = 'CANCEL'
              AND (
                    CREATED_BY = :loginid
                    )
            `;
            break;

          case "Pg_leave_flow_InProgress":
            console.log(
              "Pg_leave_flow_InProgress",
              "Hit router for Pg_leave_flow_InProgress"
            );
            whereConditions = `
              company_code = :company_code
              AND LAST_ACTION IN ('SUBMITTED','SENTBACK')
              AND FINAL_APPROVED <> 'YES'
              AND NEXT_ACTION_BY NOT IN (
                  SELECT EMPLOYEE_ID
                  FROM VW_HR_EMPLOYEE
                  WHERE EMPLOYEE_ID = :loginid
              )
              AND (
                  :loginid IN (
                      SELECT NEXT_ACTION_BY
                      FROM LEAVE_REQUEST_FLOW_HISTRY
                  )
                  OR CREATED_BY = :loginid
              )
              AND (
                  CREATED_BY = :loginid
                  OR HOD = :loginid
                  OR DEPT_HEAD = :loginid
                  OR IMMEDIATE_SUPERVISOR = :loginid
                  OR EXISTS (
                      SELECT 1
                      FROM ms_hr_employee e
                      JOIN ms_hr_department d
                          ON d.DEPT_CODE = e.DEPT_CODE
                          AND d.DIV_CODE = e.DIV_CODE
                      WHERE e.EMPLOYEE_ID = CREATED_BY
                        AND d.LEAVE_FINAL_APPROVER = :loginid
                  )
              )
            `;
            break;
        }

        // ---------- ✅ ADDED: dynamic ORDER BY from filter.sort ----------
        const requestedSort = String(filter?.sort?.field_name ?? "").toUpperCase();
        const orderByColumn = ALLOWED_SORT_FIELDS[requestedSort] ?? "REQUEST_NUMBER";
        const orderDirection =
          !requestedSort || !ALLOWED_SORT_FIELDS[requestedSort]
            ? "DESC"
            : filter?.sort?.desc === false
            ? "ASC"
            : "DESC";

        // ---------- ✅ ADDED: filter SQL from filter.search ----------
        const { sql: filterSql, binds: filterBinds } = buildFilterSql(
          (filter as any)?.search
        );

        const finalWhere = whereConditions + filterSql;
        const finalBinds = { ...bindParams, ...filterBinds };

        try {
          // ---------- COUNT (same WHERE incl. filter) ----------
          const countQuery = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM VW_HR_LEAVE_REQUEST_FLOW
            WHERE ${finalWhere}
          `;

          console.log("Count Query:", countQuery);
          console.log("Bind Params:", finalBinds);

          const countResult = await oracleDb.query(countQuery, finalBinds);
          const totalCount = Number(
            countResult?.rows?.[0]?.TOTAL_COUNT ??
              countResult?.rows?.[0]?.total_count ??
              countResult?.rows?.[0]?.TOTALCOUNT ??
              0
          );

          // ---------- PAGE ----------
          // ✅ CHANGED: `limit` interpolated, not bound.
          // Oracle 12c+ does NOT allow a bind variable in FETCH NEXT.
          const fetchQuery = `
            SELECT *
            FROM VW_HR_LEAVE_REQUEST_FLOW
            WHERE ${finalWhere}
            ORDER BY ${orderByColumn} ${orderDirection}
            OFFSET :offset ROWS FETCH NEXT ${limit} ROWS ONLY
          `;

          const fetchParams = {
            ...finalBinds,
            offset
          };

          console.log("Fetch Query:", fetchQuery);
          console.log("Fetch Params:", fetchParams);

          const fetchedData = await oracleDb.query(fetchQuery, fetchParams);

          res.status(constants.STATUS_CODES.OK).json({
            success: true,
            data: {
              tableData: fetchedData.rows,
              count: totalCount
            }
          });
        } catch (error) {
          console.error(`Error in ${masters}:`, error);
          res.status(500).json({ success: false, message: "Server Error" });
        }
        return;
      }

      // =====================================================================
      // LEAVE FLOW REQUEST DETAIL (kept active)
      // =====================================================================
      case "Leaveflow_request": {
        const request_number = req.query.code as string;

        const whereConditions = `company_code = :company_code ${
          request_number ? "AND request_number = :request_number" : ""
        }`;

        const bindParams: any = {
          company_code: requestUser.company_code
        };

        if (request_number) {
          bindParams.request_number = request_number;
        }

        try {
          const fetchQuery = `
            SELECT *
            FROM VW_HR_LEAVE_REQUEST_FLOW
            WHERE ${whereConditions}
            ORDER BY request_number ASC
          `;
          console.log("Leaveflow_request Query:", fetchQuery);
          console.log("Leaveflow_request Params:", bindParams);

          const fetchedData = await oracleDb.query(fetchQuery, bindParams);

          console.log("fetchedData.rows", fetchedData.rows);

          res.status(constants.STATUS_CODES.OK).json({
            success: true,
            data: {
              tableData: fetchedData.rows,
              count: fetchedData.rows.length
            }
          });
          return;
        } catch (error) {
          console.error("Error in Leaveflow_request:", error);
          res.status(500).json({ success: false, message: "Server Error" });
          return;
        }
      }

      // =====================================================================
      // TEMPORARILY DISABLED — all master cases (unchanged)
      // =====================================================================
      /*
      ... your commented master cases stay exactly as they are ...
      */

      default: {
        res
          .status(400)
          .json({ success: false, message: "Invalid request type" });
        return;
      }
    }
  } catch (error: any) {
    console.error(error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error occurred while fetching data"
    });
  }
};

// Delete master data with optional pagination based on the `master` type.
export const deleteHrMaster = async (req: RequestWithUser, res: Response) => {
  try {
    const { master } = req.params;
    const requestUser: IUser = req.user;
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      throw new Error("IDs are required");
    }

    throw new Error(`Master type not supported: ${master}`);
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
    return;
  }
};