import { Response } from "express";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { Op, QueryTypes } from "sequelize";
import { IUser } from "../../../../interfaces/user.interface";
import {
  packingDetailsSchema,
  qualityClearanceSchema,
  shipmentDetailsSchema,
} from "../../../../validation/wms/transaction/inbound.validation";
import constants from "../../../../helpers/constants";
import Product from "../../../../models/wms/product_wms.model";
//import { Op } from "sequelize";
import oracledb from "oracledb";
import { oracleDb } from "../../../../database/connection";
import Country from "../../../../models/wms/warehouse_wms.model";
import PackingDetailsInboundWms from "../../../../models/wms/transaction/inbound/packingDetails_wms.model";
import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import * as fastCsv from "fast-csv";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";
import { getSearchFilterQuery } from "../../../../helpers/functions";

export const getPackingDetail = async (req: RequestWithUser, res: Response) => {
  try {
    const { prin_code, packdet_no, job_no } = req.query;

    const { clearance } = req.body;
    console.log(clearance);

    const packingDetails = await PackingDetailsInboundWms.findOne({
      where: {
        prin_code,
        packdet_no,
        job_no,
        company_code: req.user.company_code,

      },
    });

    if (!packingDetails) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Packing Item " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }
    const productInfo = await Product.findOne({
      where: {
        prod_code: packingDetails.dataValues.prod_code,
        company_code: req.user.company_code,
      },
    });
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        ...packingDetails.dataValues,
        prod_name: productInfo?.dataValues.prod_name,
        uom_count: productInfo?.dataValues.uom_count,
        uppp: productInfo?.dataValues.uppp,
      },
    });
    return;
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};
export const createPackingItem = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = packingDetailsSchema(
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
    if (!!req.body.prod_code) {
      const productResponse = await Product.findOne({
        where: {
          [Op.and]: [
            { company_code: requestUser.company_code },
            { prod_code: req.body.prod_code },
          ],
        },
      });
      if (!productResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Product " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }
    if (!!req.body.country_code) {
      const countryResponse = await Country.findOne({
        where: {
          [Op.and]: [
            { company_code: requestUser.company_code },
            { country_code: req.body.country_code },
          ],
        },
      });
      if (!countryResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Country " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }
    const response = await PackingDetailsInboundWms.create({
      ...req.body,
      packdet_no: "",
      company_code: requestUser.company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Packing Details " + constants.MESSAGES.CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

////////////////////////////////////////////////////////

//   export const updateQualityclearance = async (
//   req: RequestWithUser,
//   res: Response
//   ) => {
//   try {
//     const requestUser: IUser = req.user;
//     const { packdet_no } = req.params;
//     const { prin_code, job_no } = req.query;

//     const { error } = packingDetailsSchema(
//       req.body,
//       false,
//       requestUser.company_code
//     );
//     if (error) {
//       res
//         .status(constants.STATUS_CODES.BAD_REQUEST)
//         .json({ success: false, message: error.message });
//       return;
//     }

//     const packingResponse = await PackingDetailsInboundWms.findOne({
//       where: {
//         [Op.and]: [
//           { company_code: requestUser.company_code },
//           { packdet_no },
//           { prin_code },
//           { job_no },
//         ],
//       },
//     });
//     if (!packingResponse) {
//       res.status(constants.STATUS_CODES.NOT_FOUND).json({
//         success: false,
//         message: "Packing " + constants.MESSAGES.NOT_FOUND,
//       });
//       return;
//     }
//     if (!!req.body?.prod_code) {
//       const productResponse = await Product.findOne({
//         where: {
//           [Op.and]: [
//             { company_code: requestUser.company_code },
//             { prod_code: req.body.prod_code },
//           ],
//         },
//       });
//       if (!productResponse) {
//         res.status(constants.STATUS_CODES.NOT_FOUND).json({
//           success: false,
//           message: "Product " + constants.MESSAGES.NOT_FOUND,
//         });
//         return;
//       }
//     }

//     if (!!req.body?.country_code) {
//       const countryResponse = await Country.findOne({
//         where: {
//           [Op.and]: [
//             { company_code: requestUser.company_code },
//             { country_code: req.body.country_code },
//           ],
//         },
//       });
//       if (!countryResponse) {
//         res.status(constants.STATUS_CODES.NOT_FOUND).json({
//           success: false,
//           message: "Country " + constants.MESSAGES.NOT_FOUND,
//         });
//         return;
//       }
//     }

//     const response = await PackingDetailsInboundWms.update(
//       {
//         ...req.body,
//         packdet_no: Number(packdet_no),
//         updated_by: requestUser.loginid,
//       },
//       {
//         where: {
//           [Op.and]: [
//             { company_code: requestUser.company_code },
//             { packdet_no },
//             { prin_code },
//             { job_no },
//           ],
//         },
//       }
//     );
//     if (!response) {
//       res
//         .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
//         .json({ success: false, message: response });
//       return;
//     }
//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       message: "Packing Details " + constants.MESSAGES.UPDATED_SUCCESSFULLY,
//     });
//     return;
//   } catch (error: any) {
//     res
//       .status(constants.STATUS_CODES.BAD_REQUEST)
//       .json({ success: false, message: error.message });
//     return;
//   }
// };

export const updateQualityclearance = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    //const requestUser: IUser = req.user;
    //const { packdet_no } = req.params;
    //const { prin_code, job_no } = req.query;

    console.log(req.query);

    const { job_no } = req.query;

    console.log(job_no);
    const { prin_code } = req.query;

    console.log(prin_code);

    const { error } = qualityClearanceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    console.log(req.body);

    const {
      packdet_no,
      truck_condition,
      container_condition,
      container_type,
      ref_box_temp,
      prod_temp,
      prod_con_acceptance,
    } = req.body;

    // Initiating transaction
    await sequelize.transaction(async (t) => {
      // Updating packing time and saving it to local storage
      const toggledPackets = await PackingDetailsInboundWms.update(
        { clearance: "Y" },
        {
          where: {
            [Op.and]: [
              { company_code: req.user.company_code },
              { prin_code },
              { job_no },
              { packdet_no },
            ],
          },
          transaction: t,
        }
      );
      

      // Check if the update affected any rows
      if (toggledPackets[0] > 0) {
        // Calling stored procedure or running query

        const result: any = await sequelize.query(
          `UPDATE TI_CONTAINER
           SET truck_condition = :VS_TRUCK_CONDITION, 
               container_condition = :VS_CONTAINER_CONDITION, 
               container_type = :VS_CONTAINER_TYPE,
               ref_box_temp = :VS_REF_BOX_TEMP,
               prod_temp = :VS_PROD_TEMP,
               prod_con_acceptance = :VS_PROD_CON_ACCEPTANCE
           WHERE prin_code = :principal_code AND job_no = :VS_job_no AND company_code = :vs_company_code`,
          {
            replacements: {
              vs_company_code: req.user.company_code,
              principal_code: prin_code,
              VS_job_no: job_no,
              VS_TRUCK_CONDITION: truck_condition,
              VS_CONTAINER_CONDITION: container_condition,
              VS_REF_BOX_TEMP: ref_box_temp,
              VS_PROD_TEMP: prod_temp,
              VS_PROD_CON_ACCEPTANCE: prod_con_acceptance,
              VS_CONTAINER_TYPE: container_type,
              VS_USER: req.user.loginid,
            },
            type: QueryTypes.RAW,
            transaction: t,
          }
        );

        // const result1: any = await sequelize.query(
        //   `UPDATE TI_PACKDET
        //    SET CLEARANCE = 'Y', 
        //        CLEARED_DATE = CURRENT_TIMESTAMP
        //    WHERE company_code = :vs_company_code AND prin_code = :principal_code AND job_no = :VS_job_no`,
        //   {
        //     replacements: {
        //       vs_company_code: req.user.company_code,
        //       principal_code: prin_code,
        //       VS_job_no: job_no,
        //       VS_TRUCK_CONDITION: truck_condition,
        //       VS_CONTAINER_CONDITION: container_condition,
        //       VS_REF_BOX_TEMP: ref_box_temp,
        //       VS_PROD_TEMP: prod_temp,
        //       VS_PROD_CON_ACCEPTANCE: prod_con_acceptance,
        //       VS_CONTAINER_TYPE: container_type,
        //       VS_USER: req.user.loginid,
        //     },
        //     type: QueryTypes.RAW,
        //     transaction: t,
        //   }
        // );

        // If query executed successfully, update PackingDetailsInboundWms
        if (result) {
          await PackingDetailsInboundWms.update(
            { selected: "N" },
            {
              where: {
                [Op.and]: [
                  { company_code: req.user.company_code },
                  { prin_code },
                  { job_no },
                  { packdet_no },
                ],
              },
              transaction: t,
            }
          );
        }
      }
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Clearance processed successfully",
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

////////////////////////////////////////////////////////

export const deletePackingItem = async (
  req: RequestWithUser,
  res: Response
): Promise<any> => {
  try {
    const { packing_details } = req.body;
    const requestUser = req.user;
    if (packing_details.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one packing item to delete",
      });
    }

    await Promise.all(
      packing_details.map(
        async (packingDetail: {
          prin_code: string;
          job_no: string;
          packdet_no: number;
        }) => {
          const { prin_code, job_no, packdet_no } = packingDetail;

          return await PackingDetailsInboundWms.destroy({
            where: {
              prin_code,
              job_no,
              packdet_no,
              company_code: requestUser.company_code,
            },
          });
        }
      )
    );

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const createBulkPAckingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = packingDetailsSchema(
      req.body,
      true,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    req.body = req.body.map((packingDetail: IPackingDetails) => ({
      ...packingDetail,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    PackingDetailsInboundWms.bulkCreate(req.body, { ignoreDuplicates: true });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Packing Details " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const exportPackingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;
    let fetchedData: any[] = [];

    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    let insideQuery: any = [],
      outsideQuery = {
        [Op.and]: [{ company_code: req.user.company_code }],
      };

    outsideQuery = getSearchFilterQuery({
      insideQuery,
      filter: filter.search,
      outsideQuery,
    });
    fetchedData = await PackingDetailsInboundWms.findAll({
      where: outsideQuery,
    });
    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.INBOUND.PACKING_DETAIL,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="packing_details.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      const plainData = eachData.get({ plain: true });
      csvTransform.write(plainData); // Write each row to the CSV stream
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end(); // Complete the CSV data transformation
    csvTransform.pipe(res); // Pipe CSV data into the HTTP response
  } catch (error: any) {
    console.error("Export Error:", error); // Log the error for debugging
    res.status(400).json({ success: false, message: error.message });
  }
};
