import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import constants from "../../helpers/constants";
import { CustomerService } from "../../services/WMS/customer.service";
import { customerSchemaWms } from "../../validation/wms/gm.validation";

export class CustomerMasterController {
  
  // --- CREATE ---
  static async createCustomerMaster(
    req: RequestWithUser, 
    res: Response
  ) {
    try {
      const user: IUser = req.user;
      const { error } = customerSchemaWms(req.body);

      if (error) {
        res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ 
            success: false, 
            message: error.message });
        return;
      }

      const result = await CustomerService.createCustomer({
        ...req.body,
      });

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.CUSTOMER_WMS.CUSTOMER_CREATED_SUCCESSFULLY,
         data: result

      });
    } catch (err: any) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: err.message });
    }
  }

  // --- UPDATE ---
  static async updateCustomerMaster(
    req: RequestWithUser, 
    res: Response
) {
    try {
      const user: IUser = req.user;

      const { error } = customerSchemaWms(req.body);
      if (error) {
        res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: error.message });
        return;
      }

      const { company_code, cust_code } = req.body;

      const updated = await CustomerService.updateCustomer(
        company_code,
        cust_code,
        {
          ...req.body,
        }
      );

      if (!updated) {
              res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: constants.MESSAGES.CUSTOMER_WMS.CUSTOMER_DOES_NOT_EXIST,
              });
              return;
            }

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.CUSTOMER_WMS.CUSTOMER_UPDATED_SUCCESSFULLY,
      });
    } catch (err: any) {
      console.error("Error in updatecustomermaster:", err);
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: err.message });
      return;
    }
  }
}
