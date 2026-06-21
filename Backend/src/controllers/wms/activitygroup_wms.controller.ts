import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { activitygroupSchema } from "../../validation/wms/gm.validation";
import { ActivityGroupService } from "../../services/WMS/activitygroup.service";

// Create a new Activity Group
export const createActivityGroup = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activitygroupSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { activity_group_code, act_group_name, company_code } = req.body;

    const duplicate = await ActivityGroupService.findDuplicate({
      activity_group_code,
      act_group_name,
    });

    if (duplicate) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_GROUP_WMS.ACTIVITY_GROUP_ALREADY_EXISTS,
      });
    }

    const newActivityGroup = await ActivityGroupService.createActivityGroup({
      ...req.body,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!newActivityGroup) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating Activity Group",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.ACTIVITY_GROUP_WMS.ACTIVITY_GROUP_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Update existing Activity Group
export const updateActivityGroup = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activitygroupSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { activity_group_code } = req.body;

    const existingGroup = await ActivityGroupService.findByCode(activity_group_code);
    if (!existingGroup) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_GROUP_WMS.ACTIVITY_GROUP_DOES_NOT_EXISTS,
      });
    }

    const updated = await ActivityGroupService.updateActivityGroup(activity_group_code, {
      ...req.body,
      updated_by: requestUser.loginid,
    });

    if (!updated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating Activity Group",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.ACTIVITY_GROUP_WMS.ACTIVITY_GROUP_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete multiple Activity Groups
export const deleteActivityGroups = async (req: RequestWithUser, res: Response) => {
  try {
    const activityGroupCodes: string[] = req.body;

    if (!Array.isArray(activityGroupCodes) || !activityGroupCodes.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_GROUP_WMS.SELECT_AT_LEAST_ONE_ACTIVITY_GROUP,
      });
    }

    let deletedCount = 0;

    for (const code of activityGroupCodes) {
      const exists = await ActivityGroupService.findByCode(code);
      if (exists) {
        const deleted = await ActivityGroupService.deleteActivityGroup(code);
        if (deleted) deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.ACTIVITY_GROUP_WMS.ACTIVITY_GROUP_DOES_NOT_EXISTS,
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.ACTIVITY_GROUP_WMS.ACTIVITY_GROUP_DELETED_SUCCESSFULLY,
      deletedCount,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
