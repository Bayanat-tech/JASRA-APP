import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import constants from "../../helpers/constants";
import { customerSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";
import { CustomerMasterService } from "../../services/purchaseflow/customermaster.service";

export class CustomerMasterController {

  // --- CREATE ---
  static async create(
    req: RequestWithUser, 
    res: Response) {
    try {
      const user: IUser = req.user;

      const { error } = customerSchema(req.body);
      if (error) {
        return res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }

      const result = await CustomerMasterService.createCustomer({
        ...req.body,
        created_by: user.loginid,
        updated_by: user.loginid,
      });

      return res.status(result.status).json(result);
    } catch (err: any) {
      return res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: err.message });
    }
  }

  // --- UPDATE ---
  static async update(
    req: RequestWithUser,
    res: Response) {
    try {
      const user: IUser = req.user;

      const { error } = customerSchema(req.body);
      if (error) {
        return res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }

      const { company_code, cust_code } = req.body;

      const result = await CustomerMasterService.updateCustomer(
        company_code,
        cust_code,
        {
          ...req.body,
          updated_by: user.loginid,
        }
      );

      return res.status(result.status).json(result);
    } catch (err: any) {
      return res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: err.message });
    }
  }

   // DELETE
  static async delete(
    req: RequestWithUser, 
    res: Response) {
    try {
      const user: IUser = req.user;
  
      const result = await CustomerMasterService .deleteCustomer(
        req.body,
        user.loginid
        );
  
        return res.status(result.status).json(result);
      } catch (err: any) {
        return res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ 
            success: false, 
            message: err.message });
      }
    }
}
