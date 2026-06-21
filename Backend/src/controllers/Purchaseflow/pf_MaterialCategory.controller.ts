import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { materialcategorySchema } from "../../validation/Purchaseflow/Purchaseflow.validation";
import constants from "../../helpers/constants";
import { MaterialCategoryService } from "../../services/purchaseflow/MaterialCategoryMaster.service";

export class MaterialCategoryController { 
  
  // CREATE
  static async create(req: RequestWithUser, res: Response) {
    try {
      const user: IUser = req.user;

      const { error } = materialcategorySchema(req.body);
      if (error) {
        return res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }

      const result = await MaterialCategoryService.createCategory({
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

  // UPDATE
  static async update(req: RequestWithUser, res: Response) {
    try {
      const user: IUser = req.user;

      const { error } = materialcategorySchema(req.body);
      if (error) {
        return res
          .status(constants.STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: error.message });
      }

      const { mater_category_code, company_code } = req.body;

      const result = await MaterialCategoryService.updateCategory(
        mater_category_code,
        company_code,
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
  // static async delete(req: RequestWithUser, res: Response) {
  //   try {
  //     const user: IUser = req.user;

  //     const result = await MaterialCategoryService.deleteCategory(
  //       req.body,
  //       user.loginid
  //     );

  //     return res.status(result.status).json(result);
  //   } catch (err: any) {
  //     return res
  //       .status(constants.STATUS_CODES.BAD_REQUEST)
  //       .json({ success: false, message: err.message });
  //   }
  // }
}
