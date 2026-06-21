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
    // const { loginid1 } = requestUser;
    const { doc_id } = req.query;
    const { loginId } = req.query;
    const CEO_CODE = "00001";
    const leaveInfoQuery = `
      SELECT LEAVE_TYPE, LEAVE_DAYS
      FROM VW_HR_LEAVE_REQUEST_FLOW
      WHERE REQUEST_NUMBER = :doc_id
    `;

    const leaveInfoResult = await oracleDb.query(leaveInfoQuery, { doc_id });

    const leaveData = leaveInfoResult.rows?.[0];

    const isCeoFlow =
      leaveData &&
      ["AL", "ANNUAL"].includes(String(leaveData.LEAVE_TYPE).toUpperCase()) &&
      Number(leaveData.LEAVE_DAYS) < 20;

    console.log("CEO FLOW:", isCeoFlow);
    console.log("All query parameters:", req.query);
    console.log("requestUser", requestUser);
    console.log("doc_id:", doc_id);
    console.log("loginid from user:", loginId);
    console.log("loginid type:", typeof loginId);

    if (!doc_id || typeof doc_id !== "string") {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid or missing document ID",
      });
    }

    const roleQuery = `
      SELECT HOD, DEPT_HEAD, IMMEDIATE_SUPERVISOR,
             LENGTH(HOD) as HOD_LENGTH,
             LENGTH(DEPT_HEAD) as DEPT_HEAD_LENGTH, 
             LENGTH(IMMEDIATE_SUPERVISOR) as IMMEDIATE_SUPERVISOR_LENGTH
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

    const HOD = roleData.HOD?.trim();
    const DEPT_HEAD = roleData.DEPT_HEAD?.trim();
    const IMMEDIATE_SUPERVISOR = roleData.IMMEDIATE_SUPERVISOR?.trim();

    // const paddedLoginId = loginid.padStart(5, '0');
    // console.log("Padded loginid:", paddedLoginId, "length:", paddedLoginId.length);

    const isCaseA = IMMEDIATE_SUPERVISOR !== DEPT_HEAD && DEPT_HEAD === HOD;

    const isCaseB = IMMEDIATE_SUPERVISOR !== DEPT_HEAD && DEPT_HEAD !== HOD;

    const isCaseC = IMMEDIATE_SUPERVISOR === DEPT_HEAD && DEPT_HEAD !== HOD;

    const isCaseD = IMMEDIATE_SUPERVISOR === DEPT_HEAD && DEPT_HEAD === HOD;

    console.log({ isCaseA, isCaseB, isCaseC, isCaseD });

    console.log("Comparison results with padded loginid:");
    console.log(
      "paddedLoginId === HOD:",
      loginId === HOD,
      `(${loginId} === ${HOD})`,
    );
    console.log(
      "paddedLoginId === DEPT_HEAD:",
      loginId === DEPT_HEAD,
      `(${loginId} === ${DEPT_HEAD})`,
    );
    console.log(
      "paddedLoginId === IMMEDIATE_SUPERVISOR:",
      loginId === IMMEDIATE_SUPERVISOR,
      `(${loginId} === ${IMMEDIATE_SUPERVISOR})`,
    );

    let roleBasedQuery = "";
    const queryParams = { doc_id };

    if (loginId === HOD) {
      console.log("User is HOD");

      roleBasedQuery = `
    SELECT V.CREATED_BY AS login_id, S.USERNAME
    FROM VW_HR_LEAVE_REQUEST_FLOW V
    JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
    WHERE V.REQUEST_NUMBER = :doc_id

    UNION

    SELECT V.IMMEDIATE_SUPERVISOR, S.USERNAME
    FROM VW_HR_LEAVE_REQUEST_FLOW V
    JOIN SEC_LOGIN S ON V.IMMEDIATE_SUPERVISOR = S.LOGINID1
    WHERE V.REQUEST_NUMBER = :doc_id

    UNION

    SELECT V.DEPT_HEAD, S.USERNAME
    FROM VW_HR_LEAVE_REQUEST_FLOW V
    JOIN SEC_LOGIN S ON V.DEPT_HEAD = S.LOGINID1
    WHERE V.REQUEST_NUMBER = :doc_id
  `;

      if (isCeoFlow) {
        roleBasedQuery += `
      UNION

      SELECT S.LOGINID1, S.USERNAME
      FROM SEC_LOGIN S
      WHERE S.LOGINID1 = '${CEO_CODE}'
    `;
      }
    } else if (loginId === DEPT_HEAD) {
      console.log("User is DEPT_HEAD");

      roleBasedQuery = `
    SELECT V.CREATED_BY AS login_id, S.USERNAME
    FROM VW_HR_LEAVE_REQUEST_FLOW V
    JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
    WHERE V.REQUEST_NUMBER = :doc_id

    UNION

    SELECT V.IMMEDIATE_SUPERVISOR, S.USERNAME
    FROM VW_HR_LEAVE_REQUEST_FLOW V
    JOIN SEC_LOGIN S ON V.IMMEDIATE_SUPERVISOR = S.LOGINID1
    WHERE V.REQUEST_NUMBER = :doc_id
  `;

      if (isCeoFlow) {
        roleBasedQuery += `
      UNION

      SELECT S.LOGINID1, S.USERNAME
      FROM SEC_LOGIN S
      WHERE S.LOGINID1 = '${CEO_CODE}'
    `;
      }
    } else if (loginId === CEO_CODE) {
      console.log("User is CEO");

      if (isCaseA) {
        roleBasedQuery = `
      SELECT V.CREATED_BY AS login_id, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id

      UNION 

      SELECT V.IMMEDIATE_SUPERVISOR, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.IMMEDIATE_SUPERVISOR = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;
      } else if (isCaseB) {
        roleBasedQuery = `
      SELECT V.CREATED_BY AS login_id, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id

      UNION

      SELECT V.IMMEDIATE_SUPERVISOR, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.IMMEDIATE_SUPERVISOR = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id

      UNION

      SELECT V.DEPT_HEAD, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.DEPT_HEAD = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;
      } else if (isCaseC) {
        roleBasedQuery = `
      SELECT V.CREATED_BY AS login_id, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id

      UNION

      SELECT V.IMMEDIATE_SUPERVISOR, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.IMMEDIATE_SUPERVISOR = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;
      } else if (isCaseD) {
        roleBasedQuery = `
      SELECT V.CREATED_BY AS login_id, S.USERNAME
      FROM VW_HR_LEAVE_REQUEST_FLOW V
      JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
      WHERE V.REQUEST_NUMBER = :doc_id
    `;
      }
    } else if (loginId === IMMEDIATE_SUPERVISOR) {
      console.log("User is IMMEDIATE_SUPERVISOR");
      roleBasedQuery = `
        SELECT V.CREATED_BY AS login_id, S.USERNAME
        FROM VW_HR_LEAVE_REQUEST_FLOW V
        JOIN SEC_LOGIN S ON V.CREATED_BY = S.LOGINID1
        WHERE V.REQUEST_NUMBER = :doc_id
      `;
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
