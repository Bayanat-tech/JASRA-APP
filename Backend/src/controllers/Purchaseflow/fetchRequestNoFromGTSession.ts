import { Request, Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../database/connection";
import { IUser } from "../../interfaces/user.interface";

interface SessionRow {
  CODE: string;
}

export const fetchRequestNoFromGTSession = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    // Extract authenticated user from request 
    const requestUser: IUser = req.user as IUser;
    
    if (!requestUser || !requestUser.loginid) {
      res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
      return;
    }
    
    const userId = requestUser.loginid;

    connection = await oracleDb.getConnection();

    const result = await connection.execute<SessionRow>(
      `SELECT code 
       FROM GT_SESSION_INFO_OTHER 
       WHERE USER_ID = :userId
      `,
      { userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const sessionData = result.rows?.[0];

    if (sessionData?.CODE) {
      res.status(200).json({ success: true, data: sessionData.CODE });
    } else {
      res.status(404).json({
        success: false,
        message: "Request number not found in session.",
      });
    }
  } catch (error) {
    console.error("Error querying GT_SESSION_INFO table:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    if (connection) await connection.close();
  }
};
