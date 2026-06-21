import { Request, Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { ItemMasterService } from "../../services/purchaseflow/itemmaster.service";

export class ItemMasterController {
  static async createItem(req: RequestWithUser, res: Response) {
    try {
      const requestUser: IUser = req.user;
      const { item_code, item_desp, company_code } = req.body;

      // Duplicate check
      const exists = await ItemMasterService.findDuplicate(
        item_code,
        item_desp,
        company_code
      );

      if (exists) {
        return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_ALREADY_EXISTS
        });
      }

      // Create
      await ItemMasterService.createItem({
        ...req.body,
        created_by: requestUser.loginid,
        updated_by: requestUser.loginid
      });

      return res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_CREATED_SUCCESSFULLY
      });

    } catch (error: any) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  // UPDATE ITEMMASTER
  static async updateItem(req: RequestWithUser, res: Response) {
    try {
      const requestUser: IUser = req.user;
      const { item_code, company_code } = req.body;

      // Check existing record
      const itemData = await ItemMasterService.findOne(item_code, company_code);

      if (!itemData) {
        return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_DOES_NOT_EXISTS
        });
      }

      // Update record
      const updated = await ItemMasterService.updateItem(
        item_code,
        company_code,
        {
          ...req.body,
          updated_by: requestUser.loginid
        }
      );

      if (!updated) {
        return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Error while updating item"
        });
      }

      return res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: constants.MESSAGES.ITEMMASTER_PF.ITEMMASTER_UPDATED_SUCCESSFULLY
      });

    } catch (error: any) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE MULTIPLE ITEMS
  static async deleteItems(req: Request, res: Response) {
    try {
      const { itemCodes } = req.body;

      const deletedCount = await ItemMasterService.deleteItems(itemCodes);

      return res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: `Deleted ${deletedCount} items`
      });

    } catch (error: any) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
  }
}
