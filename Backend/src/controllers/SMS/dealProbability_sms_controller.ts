import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import probabilitymaster from "../../models/SMS/probabilitymaster_sms.model";
import { probabilitySchema } from "../../validation/SMS/smsMasters.validation";

export const createprobabilitymaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = probabilitySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { deal_probability } = req.body;

    const probabilitymasterData = await probabilitymaster.findOne({
      where: {
        [Op.and]: [
          { deal_probability: deal_probability },
        ],
      },
    });

    if (probabilitymasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.PROBABILITYMASTER_SMS.PROBABILITYMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createprobabilitymaster = await probabilitymaster.create({
      deal_probability,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createprobabilitymaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating use" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.PROBABILITYMASTER_SMS.PROBABILITYMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updateprobabilitymaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = probabilitySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, probability_code, deal_probability } = req.body;

    // Check for duplicate record (excluding the current record)
    const probabilityExists = await probabilitymaster.findOne({
      where: {
        id: { [Op.ne]: id, deal_probability, probability_code }, // Exclude the current record
      },
    });
    if (probabilityExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Deal Probability already exists.",
      });
      return;
    }

    const probabilitymasterData = await probabilitymaster.findOne({
      where: {
        [Op.and]: [{ id: id }],
      },
    });

    if (!probabilitymasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.PROBABILITYMASTER_SMS.PROBABILITYMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

  //
    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updateprobabilitymaster = await probabilitymaster.update(updateData, {
      where: { [Op.and]: [ { id: id }] },
    });

    if (!updateprobabilitymaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.PROBABILITYMASTER_SMS.PROBABILITYMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
