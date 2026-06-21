import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { uocSchema } from "../../validation/wms/gm.validation";
import { ActivityUOCService } from "../../services/WMS/uoc.service";

export const createUoc = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = uocSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { charge_code, charge_type, company_code, description, activity_group_code } = req.body;

    const uocExists = await ActivityUOCService.checkActivityUOCExists(
      company_code,
      charge_type,
      charge_code
    );

    if (uocExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOC_WMS.UOC_ALREADY_EXISTS,
      });
      return;
    }
    
    const createUoc = await ActivityUOCService.createActivityUOC({
      companyCode: company_code,
      chargeType: charge_type,
      chargeCode: charge_code,
      description,
      activityGroupCode: activity_group_code,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid
    });
    
    if (!createUoc) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating company" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOC_WMS.UOC_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateUoc = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = uocSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { 
      charge_code, 
      charge_type, 
      company_code, 
      description, 
      activity_group_code,
      old_charge_type,
      old_charge_code 
    } = req.body;

    // Use old values to check if the UOC exists
    const uocExists = await ActivityUOCService.checkActivityUOCExists(
      company_code,
      old_charge_type || charge_type,
      old_charge_code || charge_code
    );

    if (!uocExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOC_WMS.UOC_DOES_NOT_EXISTS,
      });
      return;
    }
    
    // Pass old values to updateActivityUOC, and new values in updateData
    const updateResult = await ActivityUOCService.updateActivityUOC(
      company_code,
      old_charge_type || charge_type,
      old_charge_code || charge_code,
      {
        chargeType: charge_type,
        chargeCode: charge_code,
        description,
        activityGroupCode: activity_group_code,
        updatedBy: requestUser.loginid,
      }
    );
    
    if (!updateResult) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOC_WMS.UOC_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteCountries = async (req: RequestWithUser, res: Response) => {
  try {
    const uocList = req.body;

    if (!uocList || !uocList.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOC_WMS.SELECT_AT_LEAST_ONE_UOC,
      });
      return;
    }
    
    const activityIdentifiers = uocList.map((item: any) => ({
      companyCode: item.company_code,
      chargeType: item.charge_type,
      chargeCode: item.charge_code
    }));

    const deleteResult = await ActivityUOCService.deleteActivityUOCs(activityIdentifiers);
    
    if (!deleteResult) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete UOC records",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOC_WMS.UOC_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
