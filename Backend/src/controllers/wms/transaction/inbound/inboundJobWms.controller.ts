/**
 * @fileoverview Controller for handling inbound job operations in WMS
 * @imports Required dependencies and models
 */
import { Response } from "express";
import constants from "../../../../helpers/constants";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { IUser } from "../../../../interfaces/user.interface";
import { InboundJobWmsService } from "../../../../services/WMS/transaction/inbound/inboundJobWms.service";
import { AppDataSource } from "../../../../database/connection"; // Update with your TypeORM DataSource

// Initialize service
const inboundJobWmsService = new InboundJobWmsService();

/**
 * @function getInboundJob
 * @description Retrieves a single inbound job by job number
 * @param {RequestWithUser} req - Express request object with user data
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with job data or error
 */
// export const getInboundJob = async (req: RequestWithUser, res: Response) => {
//   try {
//     console.log("Fetching inbound job with params:", req.params);
//     const { job_no } = req.params;

//     // Add validation
//     if (!job_no) {
//       res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//         success: false,
//         message: "Job number is required",
//       });
//       return;
//     }

//     console.log("Attempting to fetch job with job_no:", job_no);
    
//     // Query database for job data
//     const jobdata = await inboundJobWmsService.getInboundJobByJobNo(job_no);

//     if (!jobdata) {
//       res.status(constants.STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         message: "Job Data " + constants.MESSAGES.DOES_NOT_EXISTS,
//       });
//       return;
//     }
//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       data: jobdata,
//     });
//     return;
//   } catch (error: unknown) {
//     const knownError = error as { message: string };
//     console.error("Error in getInboundJob:", knownError.message);
//     console.error("Full error stack:", error);
//     console.error("Job number attempted:", req.params.job_no);
    
//     // Check if it's a database column error
//     if (knownError.message.includes("ORA-00904") || knownError.message.includes("invalid identifier")) {
//       res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
//         success: false, 
//         message: "Database configuration error: Column name mismatch. Please check the InboundJobWms entity definition.",
//         error: knownError.message
//       });
//       return;
//     }
    
//     res
//       .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
//       .json({ success: false, message: knownError.message });
//   }
// };

/**
 * @function getReports
 * @description Retrieves GRN reports with pagination, filtering and sorting
 * @param {RequestWithUser} req - Express request object with user data
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with formatted report data or error
 */
// export const getReports = async (req: RequestWithUser, res: Response) => {
//   try {
//     // Extract request parameters and setup pagination
//     const requestUser: IUser = req.user;
//     const { prin_code, job_no } = req.query;
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
    
//     console.log("Fetching GRN reports with params:", { prin_code, job_no, page, limit });
//     const filter: ISearch = req.query.filter
//       ? JSON.parse(req.query.filter)
//       : {};

//     // Fetch data using service
//     const result = await inboundJobWmsService.getGrnReports(
//       requestUser.company_code,
//       prin_code as string,
//       job_no as string,
//       page,
//       limit,
//       filter
//     );

//     // Send formatted response
//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       totalCount: result.totalCount,
//       data: result.data,
//     });
//   } catch (error: any) {
//     console.error("Error in getReports:", error.message);
//     res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getTallyProductData = async (
  req: RequestWithUser,
  res: Response
) => {
  const requestUser: IUser = req.user;
  const uniqueCode = req.query.prin_code as string;
  const uniqueCode2 = req.query.job_no as string;
  const uniqueCode3 = req.query.container_no as string;
  
  try {
    console.log("Fetching tally product data with params:", { uniqueCode, uniqueCode2, uniqueCode3 });
    const fetchedData = await inboundJobWmsService.getTallyProductData(
      uniqueCode,
      uniqueCode2,
      uniqueCode3
    );

    res.status(200).json({
      success: true,
      data: fetchedData,
    });
    return;
  } catch (error: any) {
    console.error("Error in getTallyProductData:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
