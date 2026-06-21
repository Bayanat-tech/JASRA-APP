import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import bcrypt from "bcrypt";
import salesmaster from "../../models/SMS/salesmaster_sms.model";
import { salesSchema } from "../../validation/SMS/smsMasters.validation";

export const createsalesmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = salesSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { sales_name, contact_no, email} = req.body;

    const salesmasterData = await salesmaster.findOne({
      where: {
        [Op.and]: [
          { sales_name: sales_name },
        ],
      },
    });

    if (salesmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SALESMASTER_SMS.SALESMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createsalesmaster = await salesmaster.create({
      sales_name,
      contact_no,
      email,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createsalesmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating use" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.SALESMASTER_SMS.SALESMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updatesalesmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = salesSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, sales_code, sales_name } = req.body;

    // Check for duplicate record (excluding the current record)
    const SalesExists = await salesmaster.findOne({
      where: {
        sales_name,
        sales_code,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });
    if (SalesExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Salesman already exists.",
      });
      return;
    }

    const salesmasterData = await salesmaster.findOne({
      where: {
        [Op.and]: [{ id: id }],
      },
    });

    if (!salesmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SALESMASTER_SMS.SALESMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

  //
    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updateSalesmaster = await salesmaster.update(updateData, {
      where: { [Op.and]: [ { id: id }] },
    });

    if (!updateSalesmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.SALESMASTER_SMS.SALESMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
