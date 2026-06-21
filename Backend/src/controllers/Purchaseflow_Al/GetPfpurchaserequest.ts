import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";

import { IUser } from "../../interfaces/user.interface";

import { TPrrequest } from "../../models/Purchaseflow/purchaserequest_pf.model";
import constants from "../../helpers/constants";

import { sequelize } from "../../database/connection";
import { Op, QueryTypes } from "sequelize";
import Projectmaster from "../../models/Purchaseflow/projectmaster_pf_model";

export const getpfpurchaserequest = async (req: TPrrequest, res: Response) => {
  try {
    console.log("Inside getpfpurchaserequest");
    // Implement functionality as needed
  } catch (error) {
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      // message: error.message,
    });
  }
};
