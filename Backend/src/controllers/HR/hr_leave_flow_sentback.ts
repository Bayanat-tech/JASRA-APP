import { Request, Response } from "express";
import { oracleDb } from "../../database/connection";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";

export const getRequestFlowUsers = async (
  req: RequestWithUser,
  res: Response,
) => {
  try {
    const requestUser: IUser = req.user;
    const { doc_id } = req.query;
    const { loginId } = req.query;

    if (!doc_id || typeof doc_id !== "string") {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid or missing document ID",
      });
    }

    const dynamic_Ceoid = `SELECT d.LEAVE_FINAL_APPROVER
            FROM MS_HR_DEPARTMENT d
            JOIN MS_HR_EMPLOYEE e
              ON d.DIV_CODE = e.DIV_CODE
             AND d.DEPT_CODE = e.DEPT_CODE
            WHERE e.EMPLOYEE_ID =  (SELECT EMPLOYEE_CODE FROM LEAVE_REQUEST_FLOW WHERE REQUEST_NUMBER = :doc_id)`;

    const ceoResult = await oracleDb.query(dynamic_Ceoid, { doc_id });
    const CEO_CODE = ceoResult.rows?.[0]?.LEAVE_FINAL_APPROVER || "00001";

    console.log("CEO_CODE", CEO_CODE, "ceoResult", ceoResult);

    console.log("All query parameters:", req.query);
    console.log("requestUser", requestUser);
    console.log("doc_id:", doc_id);
    console.log("loginid from user:", loginId);
    console.log("loginid type:", typeof loginId);

    const roleQuery = `
      SELECT HOD, DEPT_HEAD, IMMEDIATE_SUPERVISOR, ENGINEER,
             LENGTH(HOD) as HOD_LENGTH,
             LENGTH(DEPT_HEAD) as DEPT_HEAD_LENGTH, 
             LENGTH(IMMEDIATE_SUPERVISOR) as IMMEDIATE_SUPERVISOR_LENGTH ,
             LENGTH(ENGINEER) AS ENGINEER_LENGTH
      FROM VW_HR_LEAVE_REQUEST_FLOW
      WHERE REQUEST_NUMBER = :doc_id
    `;

    const roleResult = await oracleDb.query(roleQuery, { doc_id });

    if (!roleResult.rows || roleResult.rows.length === 0) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Request number not found",
      });
    }

    const roleData = roleResult.rows[0];

    console.log(
      "HOD from DB:",
      roleData.HOD,
      "type:",
      typeof roleData.HOD,
      "length:",
      roleData.HOD_LENGTH,
    );
    console.log(
      "DEPT_HEAD from DB:",
      roleData.DEPT_HEAD,
      "type:",
      typeof roleData.DEPT_HEAD,
      "length:",
      roleData.DEPT_HEAD_LENGTH,
    );
    console.log(
      "IMMEDIATE_SUPERVISOR from DB:",
      roleData.IMMEDIATE_SUPERVISOR,
      "type:",
      typeof roleData.IMMEDIATE_SUPERVISOR,
      "length:",
      roleData.IMMEDIATE_SUPERVISOR_LENGTH,
    );
    console.log(
      "ENGINEER from DB:",
      roleData.ENGINEER,
      "type:",
      typeof roleData.ENGINEER,
      "length:",
      roleData.ENGINEER_LENGTH,
    );

    const HOD = roleData.HOD?.trim();
    const DEPT_HEAD = roleData.DEPT_HEAD?.trim();
    const IMMEDIATE_SUPERVISOR = roleData.IMMEDIATE_SUPERVISOR?.trim();
    const ENGINEER = roleData.ENGINEER?.trim();

    console.log("Comparison results:");
    console.log("loginId === HOD:", loginId === HOD, `(${loginId} === ${HOD})`);
    console.log(
      "loginId === DEPT_HEAD:",
      loginId === DEPT_HEAD,
      `(${loginId} === ${DEPT_HEAD})`,
    );
    console.log(
      "loginId === IMMEDIATE_SUPERVISOR:",
      loginId === IMMEDIATE_SUPERVISOR,
      `(${loginId} === ${IMMEDIATE_SUPERVISOR})`,
    );
    console.log(
      "loginId === ENGINEER:",
      loginId === ENGINEER,
      `(${loginId} === ${ENGINEER})`,
    );
    console.log(
      "loginId === CEO_CODE:",
      loginId === CEO_CODE,
      `(${loginId} === ${CEO_CODE})`,
    );

    // Hierarchy: CREATED_BY -> IMMEDIATE_SUPERVISOR -> ENGINEER -> DEPT_HEAD -> HOD -> CEO
    // CEO is always the final approver and always sees everyone below him.

    const CREATED_BY_UNION = `
      SELECT V.CREATED_BY AS login_id, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;

    const SUPERVISOR_UNION = `
      SELECT V.IMMEDIATE_SUPERVISOR, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.IMMEDIATE_SUPERVISOR = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;

    const ENGINEER_UNION = `
      SELECT V.ENGINEER, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.ENGINEER = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;

    const DEPT_HEAD_UNION = `
      SELECT V.DEPT_HEAD, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.DEPT_HEAD = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;

    const HOD_UNION = `
      SELECT V.HOD, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.HOD = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;

    const CEO_UNION = `
      SELECT S.LOGINID1, S.USERNAME
      FROM SEC_LOGIN S
      WHERE S.LOGINID1 = '${CEO_CODE}'
    `;

    let roleBasedQuery = "";
    const queryParams = { doc_id };

    if (loginId === CEO_CODE) {
      console.log("User is CEO");
      // CEO is the final approver — sees everyone under him.
      roleBasedQuery = [
        CREATED_BY_UNION,
        SUPERVISOR_UNION,
        ENGINEER_UNION,
        DEPT_HEAD_UNION,
        HOD_UNION,
      ].join(" UNION ");
    } else if (loginId === HOD) {
      console.log("User is HOD");
      roleBasedQuery = [
        CREATED_BY_UNION,
        SUPERVISOR_UNION,
        ENGINEER_UNION,
        DEPT_HEAD_UNION,
        CEO_UNION,
      ].join(" UNION ");
    } else if (loginId === DEPT_HEAD) {
      console.log("User is DEPT_HEAD");
      roleBasedQuery = [
        CREATED_BY_UNION,
        SUPERVISOR_UNION,
        ENGINEER_UNION,
        CEO_UNION,
      ].join(" UNION ");
    } else if (loginId === ENGINEER) {
      console.log("User is ENGINEER");
      roleBasedQuery = [CREATED_BY_UNION, SUPERVISOR_UNION].join(" UNION ");
    } else if (loginId === IMMEDIATE_SUPERVISOR) {
      console.log("User is IMMEDIATE_SUPERVISOR");
      roleBasedQuery = CREATED_BY_UNION;
    } else {
      console.log("User is NOT authorized");
      return res.status(constants.STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: "User is not authorized to view this request flow",
      });
    }

    console.log("Executing query:", roleBasedQuery);
    console.log("With parameters:", queryParams);

    const usersInFlow = await oracleDb.query(roleBasedQuery, queryParams);

    return res.status(constants.STATUS_CODES.OK).json({
      success: false,
      data: usersInFlow.rows,
    });
  } catch (error: unknown) {
    const knownError = error as { message: string };
    console.error("Error in getRequestFlowUsers:", knownError);
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: knownError.message || "Internal server error",
    });
  }
};