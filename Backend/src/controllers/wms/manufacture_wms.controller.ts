import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { manufactureSchema } from "../../validation/wms/gm.validation";
import { ManufacturerService } from "../../services/WMS/manufacturer.service";

export const createManufacture = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = manufactureSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const { manu_code, company_code, prin_code, manu_name, ...otherFields } = req.body;

    // Check if manufacturer already exists - only use prinCode and manuCode
    const manufacturerExists = await ManufacturerService.checkManufacturerExists(
      prin_code,
      manu_code
    );

    if (manufacturerExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.MANUFACTURER_WMS.MANUFACTURER_ALREADY_EXISTS,
      });
      return;
    }

    // Create manufacturer using service
    const createManufacturer = await ManufacturerService.createManufacturer({
      prinCode: prin_code,
      manuCode: manu_code,
      manuName: manu_name,
      companyCode: company_code,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid,
      // Map other fields as needed
      countryCode: otherFields.country_code,
      manuAddr1: otherFields.manu_addr1,
      manuAddr2: otherFields.manu_addr2,
      manuAddr3: otherFields.manu_addr3,
      manuAddr4: otherFields.manu_addr4,
      manuCity: otherFields.manu_city,
      manuContact: otherFields.manu_contact,
      manuTelno1: otherFields.manu_telno1,
      manuFaxno1: otherFields.manu_faxno1,
      manuEmail1: otherFields.manu_email1,
    });

    if (!createManufacturer) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating manufacturer" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.MANUFACTURER_WMS.MANUFACTURER_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateManufacture = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = manufactureSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const { 
      manu_code, 
      company_code, 
      prin_code, 
      manu_name,
      original_prin_code, // Original codes to identify the record
      original_manu_code,
      ...otherFields 
    } = req.body;

    // Use original codes if provided, otherwise use current codes
    const searchPrinCode = original_prin_code || prin_code;
    const searchManuCode = original_manu_code || manu_code;

    // Check if manufacturer exists using original codes
    const manufacturerExists = await ManufacturerService.checkManufacturerExists(
      searchPrinCode,
      searchManuCode
    );

    if (!manufacturerExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.MANUFACTURER_WMS.MANUFACTURER_DOES_NOT_EXISTS,
      });
      return;
    }

    // If codes are changing, check if new codes already exist
    if ((original_prin_code && original_prin_code !== prin_code) || 
        (original_manu_code && original_manu_code !== manu_code)) {
      const newCodesExist = await ManufacturerService.checkManufacturerExists(
        prin_code,
        manu_code
      );
      
      if (newCodesExist) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Manufacturer with new codes already exists",
        });
        return;
      }
    }

    // Update manufacturer using original codes to find, new values to update
    const updateSuccess = await ManufacturerService.updateManufacturer(
      searchPrinCode,
      searchManuCode,
      {
        prinCode: prin_code, // Update to new codes if changed
        manuCode: manu_code,
        manuName: manu_name,
        updatedBy: requestUser.loginid,
        countryCode: otherFields.country_code,
        manuAddr1: otherFields.manu_addr1,
        manuAddr2: otherFields.manu_addr2,
        manuAddr3: otherFields.manu_addr3,
        manuAddr4: otherFields.manu_addr4,
        manuCity: otherFields.manu_city,
        manuContact: otherFields.manu_contact,
        manuTelno1: otherFields.manu_telno1,
        manuFaxno1: otherFields.manu_faxno1,
        manuEmail1: otherFields.manu_email1,
      }
    );

    if (!updateSuccess) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating manufacturer" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.MANUFACTURER_WMS.MANUFACTURER_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteManufactures = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const manufacturersToDelete = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.MANUFACTURER_WMS.SELECT_AT_LEAST_ONE_MANUFACTURER,
      });
      return;
    }

    // Format the data for TypeORM delete operation
    const manufacturerKeys = manufacturersToDelete.map((item: any) => ({
      prinCode: item.prin_code,
      manuCode: item.manu_code
    }));

    const deleteSuccess = await ManufacturerService.deleteManufacturers(manufacturerKeys);

    if (!deleteSuccess) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete manufacturers",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.MANUFACTURER_WMS.MANUFACTURER_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
