import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import bcrypt from "bcrypt";
import servicemaster from "../../models/SMS/servicemaster_sms.model";
import { serviceSchema } from "../../validation/SMS/smsMasters.validation";

export const createservicemaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = serviceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { service_name } = req.body;

    const servicemasterData = await servicemaster.findOne({
      where: {
        [Op.and]: [
          { service_name: service_name },
        ],
      },
    });

    if (servicemasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SERVICEMASTER_SMS.SERVICEMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createservicemaster = await servicemaster.create({
      service_name,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createservicemaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating use" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.COMPANYMASTER_SMS.COMPANYMASTER_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updateservicemaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = serviceSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, service_code, service_name } = req.body;

    // Check for duplicate records (excluding the current record)
    const ServiceExists = await servicemaster.findOne({
      where: {
        service_name,
        service_code,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });
    if (ServiceExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Service already exists.",
      });
      return;
    }

    const servicemasterData = await servicemaster.findOne({
      where: {
        [Op.and]: [{ id: id }],
      },
    });

    if (!servicemasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SERVICEMASTER_SMS.SERVICEMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

  //
    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updateServicemaster = await servicemaster.update(updateData, {
      where: { [Op.and]: [ { id: id }] },
    });

    if (!updateservicemaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.SERVICEMASTER_SMS.SERVICEMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
