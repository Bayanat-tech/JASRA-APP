import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { AppDataSource } from "../../database/connection";
import { hrPaycomponentsSchema } from "../../validation/HR/hrPaycomponentsSchema.validation";
import { In } from "typeorm";
import { HrPaycomponent } from "../../models/Hr/hr_paycomponents";

export const createhrpaycomponent = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = hrPaycomponentsSchema(req.body);
    if (error) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
      return;
    }

    const { company_code, pay_comp_id } = req.body;

    const paycomponentRepository = AppDataSource.getRepository(HrPaycomponent);

    // Check if Pay Component already exists
    const existingPaycomponents = await paycomponentRepository.findOne({
      where: {
        pay_comp_id: pay_comp_id,
        // company_code: company_code, // Uncomment if you want to include company_code in the check
      },
    });

    if (existingPaycomponents) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_ALREADY_EXISTS,
      });
      return;
    }

    // Create new Pay Component
    const newHRPaycomponents = paycomponentRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedPaycomponent = await paycomponentRepository.save(newHRPaycomponents);

    if (!savedPaycomponent) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: "Error while creating HR Paycomponents" 
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

export const updatehrpaycomponent = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = hrPaycomponentsSchema(req.body);
    if (error) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
      return;
    }

    const { pay_comp_id, company_code } = req.body;

    const paycomponentRepository = AppDataSource.getRepository(HrPaycomponent);

    // Check if Pay Component exists
    const existingPaycomponents = await paycomponentRepository.findOne({
      where: {
        company_code: company_code,
        pay_comp_id: pay_comp_id,
      },
    });

    if (!existingPaycomponents) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_DOES_NOT_EXIST,
      });
      return;
    }

    // Update Pay Component
    const updateResult = await paycomponentRepository.update(
      {
        company_code: company_code,
        pay_comp_id: pay_comp_id,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating HR Paycomponent",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

export const deleteHRPaycomponents = async (req: RequestWithUser, res: Response) => {
  try {
    const paycomponentCodes = req.body;

    if (!paycomponentCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_CATEGORY.SELECT_AT_LEAST_ONE_CATEGORY,
      });
      return;
    }

    const paycomponentRepository = AppDataSource.getRepository(HrPaycomponent);

    // Delete Pay Components
    const deleteResult = await paycomponentRepository.delete({
      pay_comp_id: In(paycomponentCodes),
    });

    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No HR Paycomponents found to delete",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_DELETED_SUCCESSFULLY,
      data: {
        deletedCount: deleteResult.affected
      }
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
  }
};