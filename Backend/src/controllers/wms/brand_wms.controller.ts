import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { brandSchema } from "../../validation/wms/gm.validation";
import { BrandService } from "../../services/WMS/brand.service";

export const createBrand = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = brandSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const brandCode = "B0001";
    const companyCode = req.body.company_code;
    const prinCode = req.body.prin_code;
    const groupCode = req.body.group_code;

    // Check if brand already exists
    const brandExists = await BrandService.checkBrandExists(
      companyCode,
      prinCode,
      groupCode,
      brandCode
    );

    if (brandExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.BRAND_WMS.BRAND_ALREADY_EXISTS,
      });
      return;
    }

    // Prepare data for brand creation
    const brandData = {
      companyCode,
      prinCode,
      groupCode,
      brandCode,
      brandName: req.body.brand_name,
      prefSite: req.body.pref_site,
      prefLocFrom: req.body.pref_loc_from,
      prefLocTo: req.body.pref_loc_to,
      prefAisleFrom: req.body.pref_aisle_from,
      prefAisleTo: req.body.pref_aisle_to,
      prefColFrom: req.body.pref_col_from,
      prefColTo: req.body.pref_col_to,
      prefHtFrom: req.body.pref_ht_from,
      prefHtTo: req.body.pref_ht_to,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid,
    };

    const createBrand = await BrandService.createBrand(brandData);
    
    if (!createBrand) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating brand" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.BRAND_WMS.BRAND_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateBrand = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = brandSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const { 
      brand_code: brandCode, 
      company_code: companyCode,
      prin_code: prinCode,
      group_code: groupCode,
      old_prin_code: oldPrinCode,
      old_group_code: oldGroupCode
    } = req.body;

    // Use old codes if provided, otherwise use current codes for lookup
    const lookupPrinCode = oldPrinCode || prinCode;
    const lookupGroupCode = oldGroupCode || groupCode;

    // Check if brand exists using old codes
    const brandExists = await BrandService.checkBrandExists(
      companyCode,
      lookupPrinCode,
      lookupGroupCode,
      brandCode
    );

    if (!brandExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.BRAND_WMS.BRAND_DOES_NOT_EXISTS,
      });
      return;
    }

    // Prepare update data (include new prin_code and group_code if they changed)
    const updateData = {
      prinCode: prinCode,
      groupCode: groupCode,
      brandName: req.body.brand_name,
      prefSite: req.body.pref_site,
      prefLocFrom: req.body.pref_loc_from,
      prefLocTo: req.body.pref_loc_to,
      prefAisleFrom: req.body.pref_aisle_from,
      prefAisleTo: req.body.pref_aisle_to,
      prefColFrom: req.body.pref_col_from,
      prefColTo: req.body.pref_col_to,
      prefHtFrom: req.body.pref_ht_from,
      prefHtTo: req.body.pref_ht_to,
      updatedBy: requestUser.loginid,
    };

    // Use old codes to identify the record to update
    const updated = await BrandService.updateBrand(
      companyCode,
      lookupPrinCode,
      lookupGroupCode,
      brandCode,
      updateData
    );

    if (!updated) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating brand" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.BRAND_WMS.BRAND_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteBrands = async (req: RequestWithUser, res: Response) => {
  try {
    const brandKeys = req.body;

    if (!Array.isArray(brandKeys) || brandKeys.length === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.BRAND_WMS.SELECT_AT_LEAST_ONE_BRAND,
      });
      return;
    }

    // Format the request body to match the expected structure for deleteBrands
    const formattedBrandKeys = brandKeys.map((key: any) => ({
      companyCode: key.company_code,
      prinCode: key.prin_code,
      groupCode: key.group_code,
      brandCode: key.brand_code,
    }));

    const deleted = await BrandService.deleteBrands(formattedBrandKeys);
    
    if (!deleted) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No brands were deleted. Please check if the brands exist.",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.BRAND_WMS.BRAND_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
