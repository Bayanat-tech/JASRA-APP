import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import bcrypt from "bcrypt";
import reasonmaster from "../../models/SMS/reasonmaster_sms.model";
import { reasonSchema } from "../../validation/SMS/smsMasters.validation";

export const createreasonmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = reasonSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { lost_reason } = req.body;

    const reasonmasterData = await reasonmaster.findOne({
      where: {
        [Op.and]: [
          { lost_reason: lost_reason },
        ],
      },
    });

    if (reasonmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.REASONMASTER_SMS.REASONMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createreasonmaster = await reasonmaster.create({
      lost_reason,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createreasonmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating use" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.REASONMASTER_SMS.REASONMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updatereasonmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = reasonSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, lost_reason, reason_code } = req.body;

    // Check for duplicate record (excluding the current record)
    const ReasonExists = await reasonmaster.findOne({
      where: {
        reason_code,
        lost_reason,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });
    if (ReasonExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Reason already exists.",
      });
      return;
    }

    const reasonmasterData = await reasonmaster.findOne({
      where: {
        [Op.and]: [{ id: id }],
      },
    });

    if (!reasonmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.REASONMASTER_SMS.REASONMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

  //
    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updateReasonmaster = await reasonmaster.update(updateData, {
      where: { [Op.and]: [ { id: id }] },
    });

    if (!updateReasonmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.REASONMASTER_SMS.REASONMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
