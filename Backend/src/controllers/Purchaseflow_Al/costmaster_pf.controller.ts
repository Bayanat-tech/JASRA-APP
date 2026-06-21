import { Response } from "express";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import Costmaster from "../../models/Purchaseflow/costmaster_pf.model";
import { costmasterSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";

export const createcostmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = costmasterSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { cost_code, cost_name, company_code } = req.body;

    const costmasterData = await Costmaster.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { cost_code: cost_code }],
      },
    });

    if (costmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_ALREADY_EXISTS,
      });
      return;
    }

    const createcostmaster = await Costmaster.create({
      cost_code,
      cost_name,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!createcostmaster) {
      3;
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while Cost code" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const updatecostmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = costmasterSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { cost_code, cost_name, company_code } = req.body;

    const costmasterData = await Costmaster.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { cost_code: cost_code }],
      },
    });

    if (!costmasterData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_DOES_NOT_EXISTS,
      });
      return;
    }
    const createcostmaster = await Costmaster.update(
      {
        company_code,
        created_by: requestUser.loginid,
        updated_by: requestUser.loginid,

        ...req.body,
      },
      {
        where: {
          [Op.and]: [{ company_code: company_code }, { cost_code: cost_code }],
        },
      }
    );
    if (!createcostmaster) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const deletecostmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const costmastercode = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.COSTMASTER_PF.SELECT_AT_LEAST_ONE_COSTMASTER,
      });
      return;
    }
    const CostmasterDeleteResponse = await Costmaster.destroy({
      where: {
        cost_code: costmastercode,
      },
    });
    if (CostmasterDeleteResponse === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: CostmasterDeleteResponse,
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
