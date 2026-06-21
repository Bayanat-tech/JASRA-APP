import { Response } from "express";
import { Model, Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import Suppliermaster from "../../models/Purchaseflow/suppliermaster_pf.model";
import { supplierSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";


export const createSupplier = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body
    const { error } = supplierSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { supp_code, supp_name, company_code } = req.body;
    
    // Check if the supplier already exists
    const supplierData = await Suppliermaster.findOne({
      where: {
        [Op.and]: [
          { supp_code },
          { company_code },
        ],
      },
    });

    if (supplierData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_ALREADY_EXISTS,
      });
      return;
    }

    // Create the new supplier
    const createdSupplier = await Suppliermaster.create({
      supp_code,
      supp_name,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
      ...req.body, // Additional fields in the request body
    });

    if (!createdSupplier) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating supplier" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateSupplier = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body
    const { error } = supplierSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { supp_code, company_code } = req.body;

    // Check if the supplier exists
    const supplierData = await Suppliermaster.findOne({
      where: {
        [Op.and]: [{ company_code }, { supp_code }],
      },
    });

    if (!supplierData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_DOES_NOT_EXIST,
      });
      return;
    }

    // Update the supplier
    const updatedSupplier = await Suppliermaster.update(
      {
        ...req.body, // Updated fields from request body
        updated_by: requestUser.loginid,
      },
      {
        where: {
          [Op.and]: [{ company_code }, { supp_code }],
        },
      }
    );

    if (!updatedSupplier) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating supplier" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
