import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { LocationtypeSchema } from "../../validation/wms/gm.validation";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";
import { ILocationType } from "../../interfaces/wms/locationtype_wms.interface";
import { LocationTypeService } from "../../services/WMS/locationtype.service";

export const createLocationType = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = LocationtypeSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { loc_type, company_code, loc_name, loc_cbm, loc_wt, push_level } = req.body;

    // Debug: Log what is being checked for existence
    console.log("Checking existence for:", { loc_type, loc_name, company_code });

    // Check if location type with same type and company already exists (name validated after fetch)
    const locationType = await LocationTypeService.findByLocTypeAndCompany(
      loc_type,
      company_code
    );

    // Debug: Log the result of the existence check
    console.log("findByLocTypeAndCompany result:", locationType);

    // Only block creation if a location type with the same type, name AND company code exists
    if (
      locationType &&
      locationType.locType === loc_type &&
      locationType.locName === loc_name &&
      locationType.companyCode === company_code
    ) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.LOCATIONTYPE_WMS.LOCATIONTYPE_ALREADY_EXISTS,
      });
      return;
    }

    // Create location type using the service
    const createdLocationType = await LocationTypeService.createLocationType({
      locType: loc_type,
      locName: loc_name,
      companyCode: company_code,
      userId: requestUser.loginid,
      locCbm: loc_cbm,
      locWt: loc_wt,
      pushLevel: push_level
    });

    if (!createdLocationType) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating location type" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.LOCATIONTYPE_WMS.LOCATIONTYPE_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateLocationType = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = LocationtypeSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { loc_type, company_code, loc_name, loc_cbm, loc_wt, push_level } = req.body;

    // Check if location type exists by loc_type and company_code
    const existingLocationType = await LocationTypeService.findByLocTypeAndCompany(
      loc_type,
      company_code
    );

    if (!existingLocationType) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.LOCATIONTYPE_WMS.LOCATIONTYPE_DOES_NOT_EXISTS,
      });
      return;
    }

    // Update location type using the service (loc_type is NOT editable, only other fields)
    const updateSuccess = await LocationTypeService.updateLocationType(
      loc_type,
      company_code,
      {
        locName: loc_name,
        locCbm: loc_cbm,
        locWt: loc_wt,
        pushLevel: push_level,
        userId: requestUser.loginid
      }
    );

    if (!updateSuccess) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating location type" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.LOCATIONTYPE_WMS.LOCATIONTYPE_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const createBulkLocationType = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = LocationtypeSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Process each location type entry and create it
    const promises = req.body.map(async (locType: ILocationType) => {
      try {
        await LocationTypeService.createLocationType({
          locType: locType.loc_type,
          locName: locType.loc_name,
          companyCode: locType.company_code ?? "",
          userId: requestUser.loginid,
          locCbm: locType.loc_cbm,
          locWt: locType.loc_wt,
          pushLevel: locType.push_level
        });
        return true;
      } catch (error) {
        console.error("Error creating location type:", error);
        return false;
      }
    });

    await Promise.all(promises);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "LocationType " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const exportBulkLocationType = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Debug: Log the company code being used for fetching
    console.log("Fetching location types for company:", req.user.company_code);

    // If company_code is not provided, fetch all records
    const filter: any = {};
    if (req.user.company_code && req.user.company_code.trim() !== "") {
      filter.companyCode = req.user.company_code;
    }

    // Get all location types for the company or all if no filter
    const { data: fetchedData } = await LocationTypeService.getLocationTypes(
      filter,
      1,
      1000 // Set a reasonable limit
    );

    // Debug: Log the fetched data
    console.log("Fetched location types:", fetchedData);

    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.MASTER.LOCTIONTYPE,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="locationtype.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      // Transform TypeORM entity to match expected CSV format
      const plainData = {
        loc_type: eachData.locType,
        loc_name: eachData.locName,
        company_code: eachData.companyCode,
        loc_cbm: eachData.locCbm,
        loc_wt: eachData.locWt,
        push_level: eachData.pushLevel,
        user_id: eachData.userId,
        user_dt: eachData.userDt
      };
      csvTransform.write(plainData);
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllLocationTypes = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Debug: Log user object
    console.log("getAllLocationTypes - Full req.user:", JSON.stringify(req.user, null, 2));
    console.log("getAllLocationTypes - company_code:", req.user?.company_code);

    // Read page and limit from query params
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 1000;

    console.log("getAllLocationTypes - page:", page, "limit:", limit);

    // Try fetching without any filter first to see if data exists
    console.log("getAllLocationTypes - Fetching ALL records (no filter)...");
    const { data, total } = await LocationTypeService.getLocationTypes({}, page, limit);

    console.log("getAllLocationTypes - Raw response from service:");
    console.log("  - total:", total);
    console.log("  - data length:", data?.length);
    console.log("  - first record:", data?.[0] ? JSON.stringify(data[0], null, 2) : "none");

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      total,
      data,
    });
  } catch (error: any) {
    console.error("getAllLocationTypes - ERROR:", error);
    console.error("getAllLocationTypes - Error stack:", error.stack);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

