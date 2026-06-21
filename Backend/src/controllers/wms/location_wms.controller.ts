import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { locationSchema } from "../../validation/wms/gm.validation";
import { LocationService } from "../../services/WMS/location.service";

export const createLocation = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = locationSchema(req.body);
    if (error) {
      return res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }

    // Generate location code and description
    const location_code = `${req.body.aisle}${req.body.column_no}${req.body.height}`;
    const loc_desc = `${req.body.site_code}-${location_code}`;
    const { company_code, site_code } = req.body;

    // ✅ Check for duplicate using service
    const duplicate = await LocationService.findDuplicate({
      location_code,
      site_code,
    });

    if (duplicate) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.LOCATION_WMS.LOCATION_ALREADY_EXISTS,
      });
    }

    // ✅ Create new location
    const createdLocation = await LocationService.createLocation({
      ...req.body,
      company_code,
      site_code,
      location_code,
      loc_desc,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!createdLocation) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating location",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.LOCATION_WMS.LOCATION_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLocation = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = locationSchema(req.body);
    if (error) {
      return res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }

    const { location_code, company_code } = req.body;

    // ✅ Check if location exists
    const locationExists = await LocationService.checkLocationExists(location_code);
    if (!locationExists) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.LOCATION_WMS.LOCATION_DOES_NOT_EXISTS,
      });
    }

    // ✅ Update location
    const updated = await LocationService.updateLocation(location_code, {
      ...req.body,
      updated_by: requestUser.loginid,
    });

    if (!updated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating location",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.LOCATION_WMS.LOCATION_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLocations = async (req: RequestWithUser, res: Response) => {
  try {
    const locationsCode = req.body;

    if (!Array.isArray(locationsCode) || !locationsCode.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.LOCATION_WMS.SELECT_AT_LEAST_ONE_LOCATION,
      });
    }

    let deletedCount = 0;
    for (const code of locationsCode) {
      const deleted = await LocationService.deleteLocation(code);
      if (deleted) deletedCount++;
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.LOCATION_WMS.LOCATION_DOES_NOT_EXISTS,
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.LOCATION_WMS.LOCATION_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
