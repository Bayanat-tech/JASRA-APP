import { Response } from "express";
import * as fastCsv from "fast-csv";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { IAssetgroup } from "../../interfaces/wms/assetgroup_wms.interface";
import { assetgroupSchema } from "../../validation/wms/gm.validation";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";
import Assetgroup from "../../models/wms/assetgroup_wms.model";

export const createAssetgroup = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = assetgroupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { asset_group_code, company_code } = req.body;

    const assetgroup = await Assetgroup.findOne({
      where: {
        [Op.and]: [
          { company_code: company_code },
          { asset_group_code: asset_group_code },
        ],
      },
    });

    if (assetgroup) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ASSETGROUP_WMS.ASSETGROUP_ALREADY_EXISTS,
      });
      return;
    }
    const createAssetgroup = await Assetgroup.create({
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,

      ...req.body,
    });
    if (!createAssetgroup) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating company" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ASSETGROUP_WMS.ASSETGROUP_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updateAssetgroup = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = assetgroupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { asset_group_code, company_code } = req.body;

    const assetgroup = await Assetgroup.findOne({
      where: {
        [Op.and]: [
          { company_code: company_code },
          { asset_group_code: asset_group_code },
        ],
      },
    });

    if (!Assetgroup) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ASSETGROUP_WMS.ASSETGROUP_DOES_NOT_EXISTS,
      });
      return;
    }
    const createAssetgroup = await Assetgroup.update(
      {
        company_code,
        updated_by: requestUser.loginid,

        ...req.body,
      },
      {
        where: {
          [Op.and]: [
            { company_code: company_code },
            { asset_group_code: asset_group_code },
          ],
        },
      }
    );
    if (!createAssetgroup) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ASSETGROUP_WMS.ASSETGROUP_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const createBulkCountries = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = assetgroupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    req.body = req.body.map((Assetgroup: IAssetgroup) => ({
      ...Assetgroup,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    Assetgroup.bulkCreate(req.body, { ignoreDuplicates: true });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Assetgroup " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const exportAssetgroup = async (req: RequestWithUser, res: Response) => {
  try {
    let fetchedData: any[] = [],
      csvTransform: fastCsv.CsvFormatterStream<
        fastCsv.FormatterRow,
        fastCsv.FormatterRow
      >;

    fetchedData = await Assetgroup.findAll({
      where: { company_code: req.user.company_code },
    });
    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.MASTER.COUNTRY,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="Assetgroup.csv"`);

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
export const deleteCountries = async (req: RequestWithUser, res: Response) => {
  try {
    const countriesCode = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ASSETGROUP_WMS.SELECT_AT_LEAST_ONE_ASSETGROUP,
      });
      return;
    }
    const countriesDeleteResponse = await Assetgroup.destroy({
      where: {
        asset_group_code: countriesCode,
      },
    });
    if (countriesDeleteResponse === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: countriesDeleteResponse,
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ASSETGROUP_WMS.ASSETGROUP_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
