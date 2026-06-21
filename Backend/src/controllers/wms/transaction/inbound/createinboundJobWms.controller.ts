import { Response } from "express";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { IUser } from "../../../../interfaces/user.interface";
import { createInboundSchema } from "../../../../validation/wms/transaction/createinbound.validation";
import constants from "../../../../helpers/constants";
import { IJobInboundWms } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";
import * as fastCsv from "fast-csv";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import { InboundJobWmsService } from "../../../../services/WMS/transaction/inbound/inboundJobWms.service";

export const getInboundJob = async (req: RequestWithUser, res: Response) => {
  try {
    const { job_no } = req.params;
    const { prin_code } = req.query;
    console.log("check prin value:", req.query);
    console.log("job_no from params:", job_no);
    
    const createInboundjob = await InboundJobWmsService.findOne({
      company_code: req.user.company_code,
      prin_code: prin_code as string,
      job_no: job_no as string,
    });

    if (!createInboundjob) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "shipment Item " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: createInboundjob,
    });
    return;
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};
export const createInboundjob = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("inside inbound create", req.body);
    const requestUser: IUser = req.user;
    const { error } = createInboundSchema(
      req.body,
      false,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const response = await InboundJobWmsService.create({
      ...req.body,
      company_code: requestUser.company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    
    console.log("response", response);
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to create inbound job" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: ` ${req.body.job_no} ${req.body.job_type === 'EXP' ? 'Outbound Job' : 'Inbound Job'} ${constants.MESSAGES.CREATED_SUCCESSFULLY}`,
    });

    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const GetsingleInboundjob = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    console.log("inside inbound edit");
    const requestUser: IUser = req.user;
    console.log(requestUser);

    const { job_no } = req.params;
    const { prin_code } = req.query;

    const { error } = createInboundSchema(
      req.body,
      false,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const createInboundjobResponse = await InboundJobWmsService.findOne({
      company_code: requestUser.company_code,
      prin_code: prin_code as string,
      job_no: job_no as string,
    });

    if (!createInboundjobResponse) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.NOT_FOUND,
      });
      return;
    }
    
    const updatedRecord = await InboundJobWmsService.update(
      {
        company_code: requestUser.company_code,
        prin_code: prin_code as string,
        job_no: job_no as string,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );
    
    if (!updatedRecord) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to update inbound job" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Inbound Job " + constants.MESSAGES.UPDATED_SUCCESSFULLY,
      data: updatedRecord,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const cancelInboundJob = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { job_no, prin_code } = req.body; // Get both from body

    // Validate required fields
    if (!prin_code) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "prin_code is required",
      });
      return;
    }

    if (!job_no) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "job_no is required",
      });
      return;
    }

    // Check if inbound job exists
    const existingJob = await InboundJobWmsService.findOne({
      company_code: requestUser.company_code,
      prin_code: prin_code,
      job_no: job_no,
    });

    if (!existingJob) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Inbound Job " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }

    // Check if already cancelled
    if (existingJob.canceled === 'Y') {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Inbound Job is already cancelled",
      });
      return;
    }

    // Cancel the job
    const cancelledJob = await InboundJobWmsService.cancel(
      {
        company_code: requestUser.company_code,
        prin_code: prin_code,
        job_no: job_no,
      },
      requestUser.loginid
    );

    if (!cancelledJob) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to cancel inbound job",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: `Inbound Job ${job_no} ${constants.MESSAGES.UPDATED_SUCCESSFULLY}`,
      data: cancelledJob,
    });
    return;
  } catch (error: any) {
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

// export const deleteShipmentItem = async (
//   req: RequestWithUser,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { shipment_details } = req.body;
//     const requestUser = req.user;
//     if (shipment_details.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide at least one shipment item to delete",
//       });
//     }

//     await Promise.all(
//       shipment_details.map(
//         async (shipmentDetail: {
//           prin_code: string;
//           job_no: string;
//           //packdet_no: number;
//         }) => {
//           const { prin_code, job_no } = shipmentDetail;

//           return await ShipmentDetailsInboundWms.destroy({
//             where: {
//               prin_code,
//               job_no,
//               //packdet_no,
//               company_code: requestUser.company_code,
//             },
//           });
//         }
//       )
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Deleted successfully",
//     });
//   } catch (error: any) {
//     res
//       .status(constants.STATUS_CODES.BAD_REQUEST)
//       .json({ success: false, message: error.message });
//     return;
//   }
// };
// export const createBulkShipmentDetails = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   try {
//     const requestUser: IUser = req.user;

//     const { error } = shipmentDetailsSchema(
//       req.body,
//       true,
//       requestUser.company_code
//     );
//     if (error) {
//       res
//         .status(constants.STATUS_CODES.BAD_REQUEST)
//         .json({ success: false, message: error.message });
//       return;
//     }
//     req.body = req.body.map((shipmentDetail: IShipmentDetails) => ({
//       ...shipmentDetail,
//       updated_by: requestUser.loginid,
//       created_by: requestUser.loginid,
//     }));

//     ShipmentDetailsInboundWms.bulkCreate(req.body, { ignoreDuplicates: true });

//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       message: "Shipment Details " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
//     });
//     return;
//   } catch (error: any) {
//     res
//       .status(constants.STATUS_CODES.BAD_REQUEST)
//       .json({ success: false, message: error.message });
//     return;
//   }
// };
// export const exportShipmentDetails = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   try {
//     let csvTransform: fastCsv.CsvFormatterStream<
//       fastCsv.FormatterRow,
//       fastCsv.FormatterRow
//     >;
//     let fetchedData: any[] = [];

//     const filter: ISearch = req.query.filter
//       ? JSON.parse(req.query.filter)
//       : {};

//     let insideQuery: any = [],
//       outsideQuery = {
//         [Op.and]: [{ company_code: req.user.company_code }],
//       };

//     outsideQuery = getSearchFilterQuery({
//       insideQuery,
//       filter: filter.search,
//       outsideQuery,
//     });
//     fetchedData = await ShipmentDetailsInboundWms.findAll({
//       where: outsideQuery,
//     });
//     csvTransform = fastCsv.format({
//       headers: WmsCsvHeaders.TANSACTION.INBOUND.SHIPMENT_DETAIL,
//     });

//     // Set headers for CSV response before streaming
//     res.setHeader("Content-Type", "text/csv");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="shipment_details.csv"`
//     );

//     // Write data to the CSV stream
//     fetchedData.forEach((eachData) => {
//       const plainData = eachData.get({ plain: true });
//       csvTransform.write(plainData); // Write each row to the CSV stream
//     });

//     // End the CSV stream and pipe it to the response
//     csvTransform.end(); // Complete the CSV data transformation
//     csvTransform.pipe(res); // Pipe CSV data into the HTTP response
//   } catch (error: any) {
//     console.error("Export Error:", error); // Log the error for debugging
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// has context menu
