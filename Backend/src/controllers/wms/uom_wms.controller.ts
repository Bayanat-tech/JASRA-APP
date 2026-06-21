import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { uomSchema } from "../../validation/wms/gm.validation";
import { UomService } from "../../services/WMS/uom.service";

// Create a new UOM
export const createUom = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = uomSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { uom_code, uom_name, company_code } = req.body;

    // Check duplicate
    const duplicate = await UomService.findDuplicate({ uom_code, uom_name });
    if (duplicate) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOM_WMS.UOM_ALREADY_EXISTS,
      });
    }

    // Create UOM
    const newUom = await UomService.createUom({
      ...req.body,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!newUom) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating UOM",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOM_WMS.UOM_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Update existing UOM
export const updateUom = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = uomSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { uom_code } = req.body;

    const existingUom = await UomService.findByCode(uom_code);
    if (!existingUom) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOM_WMS.UOM_DOES_NOT_EXISTS,
      });
    }

    const updated = await UomService.updateUom(uom_code, {
      ...req.body,
      updated_by: requestUser.loginid,
    });

    if (!updated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating UOM",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOM_WMS.UOM_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete multiple UOMs
export const deleteUoms = async (req: RequestWithUser, res: Response) => {
  try {
    const uomCodes: string[] = req.body;

    if (!Array.isArray(uomCodes) || !uomCodes.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOM_WMS.SELECT_AT_LEAST_ONE_UOM,
      });
    }

    let deletedCount = 0;

    for (const code of uomCodes) {
      const exists = await UomService.findByCode(code);
      if (exists) {
        const deleted = await UomService.deleteUom(code);
        if (deleted) deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOM_WMS.UOM_DOES_NOT_EXISTS,
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOM_WMS.UOM_DELETED_SUCCESSFULLY,
      deletedCount,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
