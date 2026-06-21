import { Response } from "express";
import { Model, Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import Itemmaster_pf from "../../models/Purchaseflow/itemmaster_pf_model";
import { itemmasterSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";

export const createitemmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = itemmasterSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { item_code, item_desp, company_code } = req.body;

    const itemmasterData = await Itemmaster_pf.findOne({
      where: {
        [Op.and]: [
          { item_code: item_code },
          { item_desp: item_desp },
          { company_code: company_code },
        ],
      },
    });

    if (itemmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createitemmaster = await Itemmaster_pf.create({
      item_code,
      item_desp,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!createitemmaster) {
      3;
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while Cost code" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};



export const updateitemmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = itemmasterSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { item_code, company_code } = req.body;

    const itemmasterData = await Itemmaster_pf.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { item_code: item_code }],
      },
    });

    if (!itemmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_DOES_NOT_EXISTS,
      });
      return;
    }
    const createitemmaster = await Itemmaster_pf.update(
      {
        company_code,
        created_by: requestUser.loginid,
        updated_by: requestUser.loginid,

        ...req.body,
      },
      {
        where: {
          [Op.and]: [{ company_code: company_code }, { item_code: item_code }],
        },
      }
    );
    if (!createitemmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
