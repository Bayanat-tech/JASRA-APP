import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import bcrypt from "bcrypt";
import companymaster from "../../models/SMS/sms.model";
import { cfscompanySchema } from "../../validation/SMS/smsMasters.validation";

export const createcompanymaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = cfscompanySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const {company_name, address, city, country } = req.body;

    const companymasterData = await companymaster.findOne({
      where: {
        [Op.and]: [
          { company_name: company_name },
        ],
      },
    });

    if (companymasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.COMPANYMASTER_SMS.COMPANYMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createcompanymaster = await companymaster.create({
      company_name,
      address,
      city,
      country,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createcompanymaster) {
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
export const updatecompanymaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = cfscompanySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { id, company_code, company_name, address, city, country } = req.body;

    // Check for duplicate records (excluding the current record)
    const companyExists = await companymaster.findOne({
      where: {
        company_name,
        company_code,
        address,
        city,
        country,
        id: { [Op.ne]: id }, // Exclude the current record
      },
    });
    if (companyExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: " Lead already exists.",
      });
      return;
    }

    const companymasterData = await companymaster.findOne({
      where: {
        [Op.and]:  { id: id },
      },
    });

    if (!companymasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.COMPANYMASTER_SMS.COMPANYMASTER_DOES_NOT_EXISTS,
      });
      return;
    }

    let updateData = { ...req.body, updated_by: requestUser.loginid };

    const updateCompanymaster = await companymaster.update(updateData, {
      where: { [Op.and]: [ { id: id }] },
    });

    if (!updatecompanymaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating user" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.COMPANYMASTER_SMS.COMPANYMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

/*export const deletesecmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const rolemastercode = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SECMASTER_WMS.SELECT_AT_LEAST_ONE_SECMASTER,
      });
      return;
    }
    const RolemasterDeleteResponse = await secmaster.destroy({
      where: {
        id: rolemastercode,
      },
    });
    if (RolemasterDeleteResponse === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: RolemasterDeleteResponse,
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SECMASTER_WMS.SECMASTER_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
}; */
