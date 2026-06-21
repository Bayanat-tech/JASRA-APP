import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { activitysubgroupSchema } from "../../validation/wms/gm.validation";
import { ActivitySubgroupService } from "../../services/WMS/activity_subgroup.service";

export const createActivitysubgroup = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activitysubgroupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { activity_subgroup_code, company_code, act_subgroup_name } = req.body;

    // Check if activity subgroup already exists
    const activitySubgroupExists = await ActivitySubgroupService.findByNameAndCompany(
      act_subgroup_name,
      company_code
    );

    if (activitySubgroupExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_SUBGROUP_WMS
            .ACTIVITY_SUBGROUP_ALREADY_EXISTS,
      });
      return;
    }

    // Create new activity subgroup
    const createSubgroup = await ActivitySubgroupService.createActivitySubgroup({
      actSubgroupName: act_subgroup_name,
      companyCode: company_code,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid,
      actGroupCode: req.body.act_group_code,
      accountCode: req.body.account_code,
      mandatoryFlag: req.body.mandatory_flag,
      validateFlag: req.body.validate_flag
    });

    if (!createSubgroup) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating activity subgroup" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.ACTIVITY_SUBGROUP_WMS
          .ACTIVITY_SUBGROUP_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateActivitysubgroup = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activitysubgroupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { activity_subgroup_code, company_code } = req.body;

    // Check if activity subgroup exists
    const activitySubgroup = await ActivitySubgroupService.findByCodeAndCompany(
      activity_subgroup_code,
      company_code
    );

    if (!activitySubgroup) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_SUBGROUP_WMS
            .ACTIVITY_SUBGROUP_DOES_NOT_EXISTS,
      });
      return;
    }

    // Update activity subgroup
    const updateResult = await ActivitySubgroupService.updateActivitySubgroup(
      activity_subgroup_code,
      company_code,
      {
        actSubgroupName: req.body.act_subgroup_name,
        actGroupCode: req.body.act_group_code,
        accountCode: req.body.account_code,
        mandatoryFlag: req.body.mandatory_flag,
        validateFlag: req.body.validate_flag,
        updatedBy: requestUser.loginid
      }
    );

    if (!updateResult) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating activity subgroup" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.ACTIVITY_SUBGROUP_WMS
          .ACTIVITY_SUBGROUP_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteActivitySubgroups = async (req: RequestWithUser, res: Response) => {
  try {
    const activitySubgroupCodes = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_SUBGROUP_WMS
            .ACTIVITY_SUBGROUP_AT_LEAST_ONE_ACTIVITY_GROUP,
      });
      return;
    }

    const deleteResult = await ActivitySubgroupService.deleteActivitySubgroups(activitySubgroupCodes);
    
    if (!deleteResult) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete activity subgroups",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.ACTIVITY_SUBGROUP_WMS
          .ACTIVITY_SUBGROUP_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

