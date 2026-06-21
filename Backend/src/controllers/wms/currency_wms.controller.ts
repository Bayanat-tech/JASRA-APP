import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { currencySchema } from "../../validation/wms/gm.validation";
import { CurrencyService } from "../../services/WMS/currency.service";

export const createcurrency = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = currencySchema(req.body);

    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { curr_code, company_code } = req.body;
    const currency = await CurrencyService.findByCodeAndCompany(curr_code, company_code);

    if (currency) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.CURRENCY_WMS.CURRENCY_ALREADY_EXISTS,
      });
      return;
    }
    
    const createcurrency = await CurrencyService.createCurrency({
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
      ...req.body,
    });
    
    if (!createcurrency) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating currency" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.CURRENCY_WMS.CURRENCY_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updatecurrency = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = currencySchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { curr_code, company_code } = req.body;

    const currency = await CurrencyService.findByCodeAndCompany(curr_code, company_code);

    if (!currency) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.CURRENCY_WMS.CURRENCY_DOES_NOT_EXISTS,
      });
      return;
    }
    
    const updateData = {
      ...req.body,
      updated_by: requestUser.loginid,
    };
    
    const updateResult = await CurrencyService.updateCurrency(curr_code, company_code, updateData);
    
    if (!updateResult) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating currency" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.CURRENCY_WMS.CURRENCY_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deletecurrencys = async (req: RequestWithUser, res: Response) => {
  try {
    const currencyCodes = req.body;

    if (!currencyCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.CURRENCY_WMS.SELECT_AT_LEAST_ONE_CURRENCY,
      });
      return;
    }
    
    const deleteResult = await CurrencyService.deleteCurrencies(currencyCodes);
    
    if (!deleteResult) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete currencies",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.CURRENCY_WMS.CURRENCY_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
   
