import { Response } from "express";
import { sequelize } from "../../database/connection";
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
    const { cost_code, cost_name, company_code ,  created_by,
      updated_by} = req.body;

    const costmasterData = await Costmaster.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { cost_code: cost_code }],
      },
    });

    if (costmasterData) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Customer already exists')`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
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
      created_by: updated_by, // assign updated_by value to created_by
      updated_by: updated_by,
    });

    if (!createcostmaster) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while Cost code" });
      return;
    }
     await sequelize.query(
          `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Cost Code Added Successfully')`,
          {
            replacements: {
              screen: 'COSTCODEADDED',
              type: 'success',
              document_number: '', // empty string as in your original call
              userId: updated_by, // pass this properly as a named replacement
            },
          }
        );
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
    const { cost_code, cost_name, company_code ,  created_by,
      updated_by} = req.body;

    const costmasterData = await Costmaster.findOne({
      where: {
        [Op.and]: [{ company_code: company_code }, { cost_code: cost_code }],
      },
    });

    if (!costmasterData) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"Transaction Fail,Customer Does not Exists")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_DOES_NOT_EXISTS,
      });
      return;
    }
    const createcostmaster = await Costmaster.update(
      {
        company_code,
        created_by: updated_by,
        updated_by: updated_by,

        ...req.body,
      },
      {
        where: {
          [Op.and]: [{ company_code: company_code }, { cost_code: cost_code }],
        },
      }
    );
    if (!createcostmaster) {
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Cost Code Updated Successfully')`,
      {
        replacements: {
          screen: 'COSTCODEADDED',
          type: 'success',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    const { cost_code, cost_name, company_code ,  created_by,
      updated_by} = req.body;
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
      {
        replacements: {
          screen: 'TRNFAIL',
          type: 'error',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
export const deletecostmaster = async (req: RequestWithUser, res: Response) => {
  try {
    const costmastercode = req.body;
    const { cost_code, cost_name, company_code ,  created_by,
      updated_by} = req.body;
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
    await sequelize.query(
      `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,'Cost Code Deleted Successfully')`,
      {
        replacements: {
          screen: 'COSTCODEDELETED',
          type: 'success',
          document_number: '', // empty string as in your original call
          userId: updated_by, // pass this properly as a named replacement
        },
      }
    );
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    const {  company_code ,  created_by,
      updated_by} = req.body;
      await sequelize.query(
        `CALL PROC_LOADMESSAGEBOX(:screen, :type, :document_number, :userId,"")`,
        {
          replacements: {
            screen: 'TRNFAIL',
            type: 'error',
            document_number: '', // empty string as in your original call
            userId: updated_by, // pass this properly as a named replacement
          },
        }
      );
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
