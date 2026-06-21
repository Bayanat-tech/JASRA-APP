import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { harmonizeSchema } from "../../validation/wms/gm.validation";
import { HarmonizeService } from "../../services/WMS/harmonize.service";

export const createHarmonize = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = harmonizeSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { harm_code, company_code } = req.body;

    // Check if harmonize with same code and company already exists
    const harmonizeExists = await HarmonizeService.checkHarmonizeExists(
      harm_code,
      company_code
    );

    if (harmonizeExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HARMONIZE_WMS.HARMONIZE_ALREADY_EXISTS,
      });
      return;
    }

    // Transform request body to match service structure
    const createHarmonize = await HarmonizeService.createHarmonize({
      harmDesc: req.body.harm_desc || "",
      companyCode: company_code,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid,
      shortDesc: req.body.short_desc,
      uom: req.body.uom,
      permitReqd: req.body.permit_reqd,
      unit: req.body.unit,
    });

    if (!createHarmonize) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating harmonize code" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HARMONIZE_WMS.HARMONIZE_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateHarmonize = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = harmonizeSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { harm_code, company_code } = req.body;

    // Check if harmonize exists
    const harmonizeExists = await HarmonizeService.checkHarmonizeExists(
      harm_code,
      company_code
    );

    if (!harmonizeExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HARMONIZE_WMS.HARMONIZE_DOES_NOT_EXISTS,
      });
      return;
    }

    // Transform request data to match service structure
    const updateData = {
      harmDesc: req.body.harm_desc,
      shortDesc: req.body.short_desc,
      uom: req.body.uom,
      permitReqd: req.body.permit_reqd,
      unit: req.body.unit,
      updatedBy: requestUser.loginid,
    };

    const updated = await HarmonizeService.updateHarmonize(
      harm_code,
      company_code,
      updateData
    );

    if (!updated) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating harmonize code" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HARMONIZE_WMS.HARMONIZE_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteHarmonizeCodes = async (req: RequestWithUser, res: Response) => {
  try {
    const harmonizeCodes = req.body;

    if (!harmonizeCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HARMONIZE_WMS.SELECT_AT_LEAST_ONE_HARMONIZE,
      });
      return;
    }

    const deleted = await HarmonizeService.deleteHarmonizeCodes(harmonizeCodes);

    if (!deleted) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete harmonize codes",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HARMONIZE_WMS.HARMONIZE_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
