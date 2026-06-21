import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import dealmaster from "../../models/SMS/dealmaster_sms.model";
import { dealSchema } from "../../validation/SMS/smsMasters.validation";

export const createdealmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = dealSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { deal_status, status_percentage } = req.body;

    const dealmasterData = await dealmaster.findOne({
      where: {
        [Op.and]: [
          { deal_status: deal_status },
        ],
      },
    });

    if (dealmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.DEALMASTER_SMS.DEALMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createdealmaster = await dealmaster.create({
      deal_status,
      status_percentage,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createdealmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating use" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.DEALMASTER_SMS.DEALMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updatedealmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = dealSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, deal_status , status_code } = req.body;

    // Check for duplicate email (excluding the current record)
    const DealStatusExists = await dealmaster.findOne({
      where: {
        status_code,
        deal_status,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });
    if (DealStatusExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Deal Status already exists.",
      });
      return;
    }

    const dealmasterData = await dealmaster.findOne({
      where: {
        [Op.and]: [{ id: id }],
      },
    });

    if (!dealmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.DEALMASTER_SMS.DEALMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

  //
    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updatedealmaster = await dealmaster.update(updateData, {
      where: { [Op.and]: [ { id: id }] },
    });

    if (!updatedealmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.DEALMASTER_SMS.DEALMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
