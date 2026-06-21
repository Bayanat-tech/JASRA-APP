import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import Industrysector from "../../models/wms/industrysector_wms.model";
import { industrysectorSchema } from "../../validation/wms/gm.validation";

export const createindustrysector = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = industrysectorSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { sector_code, sector_name, remarks, company_code } = req.body;

    const industrysectorData = await Industrysector.findOne({
      where: {
        [Op.and]: [
          { company_code: company_code },
          { sector_code: sector_code },
        ],
      },
    });

    if (industrysectorData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.INDUSTRYSECTOR_WMS.INDUSTRYSECTOR_ALREADY_EXISTS,
      });
      return;
    }
    const createindustrysector = await Industrysector.create({
      sector_code,
      sector_name,
      remarks,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createindustrysector) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while Industry Sector" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.INDUSTRYSECTOR_WMS
          .INDUSTRYSECTOR_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updateindustrysector = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = industrysectorSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { sector_code, sector_name, remarks, company_code } = req.body;

    const industrysector = await Industrysector.findOne({
      where: {
        [Op.and]: [
          { company_code: company_code },
          { sector_code: sector_code },
        ],
      },
    });

    if (!industrysector) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.INDUSTRYSECTOR_WMS.INDUSTRYSECTOR_DOES_NOT_EXISTS,
      });
      return;
    }
    const createindustrysector = await industrysector.update(
      {
        company_code,
        created_by: requestUser.loginid,
        updated_by: requestUser.loginid,

        ...req.body,
      },
      {
        where: {
          [Op.and]: [
            { company_code: company_code },
            { sector_code: sector_code },
          ],
        },
      }
    );
    if (!createindustrysector) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.INDUSTRYSECTOR_WMS
          .INDUSTRYSECTOR_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const deleteindustrysector = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const industrysectorcode = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.INDUSTRYSECTOR_WMS
            .SELECT_AT_LEAST_ONE_INDUSTRYSECTOR,
      });
      return;
    }
    const IndustrysectorDeleteResponse = await Industrysector.destroy({
      where: {
        sector_code: industrysectorcode,
      },
    });
    if (IndustrysectorDeleteResponse === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: IndustrysectorDeleteResponse,
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.INDUSTRYSECTOR_WMS
          .INDUSTRYSECTOR_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
