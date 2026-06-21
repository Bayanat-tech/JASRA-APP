import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { supplierSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";
import constants from "../../helpers/constants";
import { SupplierMasterService } from "../../services/purchaseflow/suppilermaster.service";

export class SupplierMasterController {
  
  // --- CREATE ---
  static async createSuppilerMaster(
    req: RequestWithUser, 
    res: Response
  ) {
    try {
      const user: IUser = req.user;
      const { error } = supplierSchema(req.body);

      if (error) {
        res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ 
            success: false, 
            message: error.message });
        return;
      }

      const result = await SupplierMasterService.createSupplier({
        ...req.body,
        created_by: user.loginid,
        updated_by: user.loginid,
      });

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_CREATED_SUCCESSFULLY,
         data: result

      });
    } catch (err: any) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: err.message });
    }
  }

  // --- UPDATE ---
  static async updateSuppilerMaster(
    req: RequestWithUser, 
    res: Response
) {
    try {
      const user: IUser = req.user;

      const { error } = supplierSchema(req.body);
      if (error) {
        res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: error.message });
        return;
      }

      const { company_code, supp_code } = req.body;

      const updated = await SupplierMasterService.updateSupplier(
        company_code,
        supp_code,
        {
          ...req.body,
          updated_by: user.loginid,
        }
      );

      if (!updated) {
              res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_DOES_NOT_EXIST,
              });
              return;
            }

      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.SUPPLIER_PF.SUPPLIER_UPDATED_SUCCESSFULLY,
      });
    } catch (err: any) {
      console.error("Error in updatesuppliermaster:", err);
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: err.message });
      return;
    }
  }
}

