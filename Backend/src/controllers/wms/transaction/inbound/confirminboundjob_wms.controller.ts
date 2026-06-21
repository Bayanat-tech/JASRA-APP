import oracledb from "oracledb";
import { oracleDb } from "../../../../database/connection";
import { Response } from "express";
import constants from "../../../../helpers/constants";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { ConfirmInboundjobService } from "../../../../services/WMS/confirmInboundjob.service";
// import ConfirmInboundInboundWms from "../../../../models/wms/transaction/inbound/confirmInboundjob_wms.model";


/**
 * @function getconfirmInboundjob
 * @description Fetch a confirm inbound job record from Oracle using TypeORM
 */
export const getconfirmInboundjob = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { prin_code, job_no } = req.query;
    const company_code = req.user.company_code;

    console.log("Fetching confirm inbound job:", { prin_code, job_no });

    // Use TypeORM service
    const confirminbound = await ConfirmInboundjobService.findByJobNo(
      prin_code as string,
      job_no as string,
      company_code
    );

    if (!confirminbound) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Confirm Job " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: confirminbound,
    });
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: knownError.message,
    });
  }
};

/**
 * @function confirmInboundjob
 * @description Executes Oracle UPDATE + Stored Procedure for inbound confirmation
 */
export const confirmInboundjob = async (
  req: RequestWithUser,
  res: Response
) => {
  let connection: oracledb.Connection | null = null;

  try {
    console.log("Starting confirmInboundjob process...");
    const { job_no } = req.params;
    const { prin_code } = req.query;
    const company_code = req.user.company_code;
    const user_id = req.user.loginid;

    console.log("Job No:", job_no);
    console.log("Principal:", prin_code);
    console.log("Company Code:", company_code);

    connection = await oracleDb.getConnection();

    // Start a transaction
    await connection.execute("SAVEPOINT before_confirm");

    /**
     * Step 1️⃣: Update TT_BATCH
     */
    const updateQuery = `
      UPDATE TT_BATCH
      SET CONFIRMED = 'N',
          SELECTED = 'Y',
          ALLOCATED = 'Y'
      WHERE JOB_NO = :job_no
    `;

    console.log('Executing TT_BATCH update...');
    await connection.execute(updateQuery, { job_no }, { autoCommit: false });
    console.log("TT_BATCH update completed.");

    /**
     * Step 2️⃣: Call the Oracle stored procedure
     */
    const callProc = `
      BEGIN
        SP_PUTAWAY_CONFIRM_NORMAL(:vs_company_code, :principal_code, :vs_job_no, SYSDATE);
      END;
    `;

    console.log("Calling stored procedure SP_PUTAWAY_CONFIRM_NORMAL...");
    await connection.execute(callProc, {
      vs_company_code: company_code,
      principal_code: prin_code,
      vs_job_no: job_no,
    });

    // Commit all updates + procedure
    await connection.commit();
    console.log("Transaction committed successfully.");

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Job Confirmation successfully",
    });
  } catch (error: any) {
    console.error("Oracle Confirm Inbound Error:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message || "Error confirming inbound job.",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing Oracle connection:", closeError);
      }
    }
  }
};
