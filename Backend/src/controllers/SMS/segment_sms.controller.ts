import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import bcrypt from "bcrypt";
import segmentmaster from "../../models/SMS/segmentmaster_sms.model";
import { segmentSchema } from "../../validation/SMS/smsMasters.validation";

export const createsegmentmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = segmentSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { segment_name } = req.body;

    const segmentmasterData = await segmentmaster.findOne({
      where: {
        [Op.and]: [
          { segment_name: segment_name },
        ],
      },
    });

    if (segmentmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SEGMENTMASTER_SMS.SEGMENTMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createsegmentmaster = await segmentmaster.create({
      segment_name,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createsegmentmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating use" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.SEGMENTMASTER_SMS.SEGMENTMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updatesegmentmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = segmentSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, segment_code, segment_name } = req.body;

    // Check for duplicate records (excluding the current record)
    const SegmentExists = await segmentmaster.findOne({
      where: {
        segment_name,
        segment_code,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });
    if (SegmentExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Segment already exists.",
      });
      return;
    }

    const segmentmasterData = await segmentmaster.findOne({
      where: {
        [Op.and]: [{ id: id }],
      },
    });

    if (!segmentmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SEGMENTMASTER_SMS.SEGMENTMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

    //
    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updateSegmentmaster = await segmentmaster.update(updateData, {
      where: { [Op.and]: [{ id: id }] },
    });

    if (!updateSegmentmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.SEGMENTMASTER_SMS.SEGMENTMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};