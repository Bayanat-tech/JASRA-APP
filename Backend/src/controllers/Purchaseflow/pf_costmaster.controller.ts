import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import constants from "../../helpers/constants";
import { costmasterSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";
import { CostmasterService } from "../../services/purchaseflow/costmaster.service";

export class CostmasterController {
  static async createcostmaster(
    req: RequestWithUser, 
    res: Response) {
    try {
      const { error } = costmasterSchema(req.body);

      if (error) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: error.message
        });
        return;
      }

      const result = await CostmasterService.createCostmaster(req.body);

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_CREATED_SUCCESSFULLY,
        data: result
      });

    } catch (error: any) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updatecostmaster(req: RequestWithUser, res: Response) {
    try {
      const { error } = costmasterSchema(req.body);

      if (error) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
        return;
      }

      const { company_code, cost_code } = req.body;

      const updated = await CostmasterService.updateCostmaster(
        company_code,
        cost_code,
        req.body
      );

      if (!updated) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_DOES_NOT_EXISTS,
        });
        return;
      }

      if (!updated) {
         res
          .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, message: "Error while updating cost master" });
        return;
        }

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.COSTMASTER_PF.COSTMASTER_UPDATED_SUCCESSFULLY,
      });

    } catch (error: any) {
      console.error("Error in updatecostmaster:", error);
      res.status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    }
  }

  //delete
  static async deletecostmaster(
    req: RequestWithUser, 
    res: Response) {
  try {
    const { company_code, cost_code } = req.body;
    const deleted_by = (req.user as IUser)?.user_id || req.body.deleted_by;

    if (!company_code || !cost_code) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "company_code and cost_code are required",
      });
    }

    const result = await CostmasterService.deleteCostmaster(
      company_code,
      cost_code,
      deleted_by
    );

    if (!result.success) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.COSTMASTER_PF.COSTMASTER_DELETED_SUCCESSFULLY ||
        "Cost Code Deleted Successfully",
    });
  } catch (error: any) {
    console.error("Error in deletecostmaster:", error);
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error ,
    });
  }}
}
