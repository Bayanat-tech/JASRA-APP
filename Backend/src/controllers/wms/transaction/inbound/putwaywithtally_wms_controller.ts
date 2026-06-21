import { Response } from "express";
import oracledb from "oracledb";
import { oracleDb } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { RequestWithUser } from "../../../../interfaces/common.interface";

export const Putawaywithpalletid = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  const { prin_code, job_no, prod_code, packdet_no, pallet_id, location_from } = req.body;

  let connection: oracledb.Connection | undefined;

  try {
    console.log('beforesandeep flag');
    connection = await oracleDb.getConnection();
    await connection.execute("BEGIN NULL; END;"); // Ensure connection

    const replacementsFlag = {
      p_flag: "Y",
      p_company_code: req.user.company_code,
      p_prin_code: prin_code,
      p_job_no: job_no,
      p_prod_code: prod_code,
      p_packdet_no: packdet_no,
      p_pallet_id: pallet_id,
      p_location_code: location_from,
    };
    console.log('before flag');
    // Log each variable clearly
console.log("Calling SP_UPDATE_FLAG_BF_SP_PUT_TALLY with:");
console.log("p_flag:", replacementsFlag.p_flag);
console.log("p_company_code:", replacementsFlag.p_company_code);
console.log("p_prin_code:", replacementsFlag.p_prin_code);
console.log("p_job_no:", replacementsFlag.p_job_no);
console.log("p_prod_code:", replacementsFlag.p_prod_code);
console.log("p_packdet_no:", replacementsFlag.p_packdet_no);
console.log("p_pallet_id:", replacementsFlag.p_pallet_id);
console.log("p_location_code:", replacementsFlag.p_location_code);

// Optional: log the entire object at once
console.log("Full replacementsFlag object:", JSON.stringify(replacementsFlag, null, 2));
    // Step 1: Set flag = 'Y'
    await connection.execute(
      `BEGIN SP_UPDATE_FLAG_BF_SP_PUT_TALLY(
          :p_flag, :p_company_code, :p_prin_code, :p_job_no, 
          :p_prod_code, :p_packdet_no, :p_pallet_id, :p_location_code
        ); END;`,
      replacementsFlag
    );

    try {
        console.log('after flag');
      // Step 2: Call Putaway procedure
      await connection.execute(
        `BEGIN SP_PUTAWAY_MADINA_WITHTALLY(
          :vs_company_code, :principal_code, :vs_job_no
        ); END;`,
        {
          vs_company_code: req.user.company_code,
          principal_code: prin_code,
          vs_job_no: job_no,
        }
      );

      // Commit if everything succeeds
      await connection.commit();

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: "Putaway with pallet id processed successfully",
      });
    } catch (putawayError) {
           console.log('error after flag');
      // Step 3: Rollback flag = 'N' if putaway fails
      await connection.execute(
        `BEGIN SP_UPDATE_FLAG_BF_SP_PUT_TALLY(
            :p_flag, :p_company_code, :p_prin_code, :p_job_no, 
            :p_prod_code, :p_packdet_no, :p_pallet_id, :p_location_code
          ); END;`,
        { ...replacementsFlag, p_flag: "N" }
      );

      await connection.rollback();
      throw putawayError;
    }
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message || "Error processing putaway with pallet id",
    });
  } finally {
    if (connection) await connection.close();
  }
};
