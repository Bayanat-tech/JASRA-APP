import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection"; // your oracledb pool
import constants from "../../helpers/constants";

/**
 * Fetch purchase requests for the logged-in user
 */
export const getpfpurchaserequest = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  let connection: oracledb.Connection | undefined;
  try {
    console.log("Inside getpfpurchaserequest");

    const requestUser = req.user as IUser;

    connection = await oracleDb.getConnection();

    // Example query: fetch purchase requests assigned to the logged-in user
    const result = await connection.execute(
      `
      SELECT pr_request_id,
             pr_number,
             project_code,
             request_date,
             status
      FROM PURCHASE_REQUESTS
      WHERE created_by = :user_id
        AND ROWNUM <= 100
      ORDER BY request_date DESC
      `,
      {
        user_id: { val: requestUser.loginid, dir: oracledb.BIND_IN, type: oracledb.STRING },
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

  res.status(constants.STATUS_CODES.OK).json({
  success: true,
  data: result.rows,
});
  } catch (error: any) {
    console.error("Error fetching purchase requests:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing Oracle connection:", closeErr);
      }
    }
  }
};

