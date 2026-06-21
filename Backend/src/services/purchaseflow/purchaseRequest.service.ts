import { oracleDb } from "../../database/connection";

export class MessageBoxService {
  static async fetchMessageBox(
    userId: string, 
    companyCode: string
) {
    return await oracleDb.query(
      `
      SELECT 
        MESSAGE_BOX,
        MESSAGE_TYPE
      FROM GT_SESSION_MESSAGEBOX
      WHERE USER_ID = :userId
      AND COMPANY_CODE = :companyCode
      `,
      {
        replacements: { userId, companyCode }
      }
    );
  }
}
