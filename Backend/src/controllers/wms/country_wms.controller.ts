import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { countrySchema } from "../../validation/wms/gm.validation";
import { createLog, notifyUser } from "../../helpers/functions";
import { CountryService } from "../../services/WMS/country.service";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";

// Create a new country
export const createCountry = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = countrySchema(req.body, requestUser.company_code, false);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
    }

    const { country_code, country_name, company_code } = req.body;

    const existingCountry = await CountryService.findDuplicate({ country_code, country_name });
    if (existingCountry) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.COUNTRY_WMS.COUNTRY_ALREADY_EXISTS,
      });
    }

    const newCountry = await CountryService.createCountry({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!newCountry) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating country",
      });
    }

    // Wrap log/notification in try-catch so errors here don't affect main response
    try {
      await createLog({
        event: constants.EVENTS.COUNTRY_CREATED,
        request_user: requestUser,
        module: constants.MODULE.WMS,
        description: constants.MESSAGES.COUNTRY_WMS.COUNTRY_CREATED_SUCCESSFULLY,
      });

      await notifyUser({
        event: constants.EVENTS.COUNTRY_CREATED,
        request_user: requestUser,
      });
    } catch (logErr) {
      console.error("Log/Notification error:", logErr);
      // Do not throw, just log
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COUNTRY_WMS.COUNTRY_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Error: " + error.message });
  }
};

// Update an existing country
export const updateCountry = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = countrySchema(req.body, requestUser.company_code, false);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
    }

    const { country_code, country_gcc, ...rest } = req.body;
    const existingCountry = await CountryService.findByCode(country_code);

    if (!existingCountry) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.COUNTRY_WMS.COUNTRY_DOES_NOT_EXISTS,
      });
    }

    const updateData = { 
      ...rest,
      country_GCC: country_gcc, // Normalize the field name
      updated_by: requestUser.loginid 
    };
    const isUpdated = await CountryService.updateCountry(country_code, updateData);

    if (!isUpdated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating country",
      });
    }

    await createLog({
      event: constants.EVENTS.COUNTRY_EDITED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description: constants.MESSAGES.COUNTRY_WMS.COUNTRY_UPDATED_SUCCESSFULLY,
    });

    await notifyUser({
      event: constants.EVENTS.COUNTRY_EDITED,
      request_user: requestUser,
    });

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COUNTRY_WMS.COUNTRY_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Error: " + error.message });
  }
};

// Bulk insert countries
export const createBulkCountries = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const countriesData = req.body.map((row: any[]) => ({
      country_code: row[0],
      country_name: row[1],
      country_GCC: row[2],
      short_desc: row[3],
      nationality: row[4],
      company_code: requestUser.company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    }));

    for (const country of countriesData) {
      const exists = await CountryService.findByCode(country.country_code);
      if (!exists) {
        await CountryService.createCountry(country);
      }
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Country " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// Export countries to CSV
export const exportCountry = async (req: RequestWithUser, res: Response) => {
  try {
    const fetchedData = await CountryService.findAll();
    const filteredData = fetchedData.filter(c => c.company_code === req.user.company_code);

    const csvTransform = fastCsv.format({ headers: WmsCsvHeaders.MASTER.COUNTRY });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="country.csv"`);
    csvTransform.pipe(res);

    filteredData.forEach(country => csvTransform.write(country));
    csvTransform.end();
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete multiple countries
export const deleteCountries = async (req: RequestWithUser, res: Response) => {
  try {
    const countriesCode: string[] = req.body;
    if (!countriesCode || !countriesCode.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.COUNTRY_WMS.SELECT_AT_LEAST_ONE_COUNTRY,
      });
    }

    let deletedCount = 0;
    for (const code of countriesCode) {
      const exists = await CountryService.findByCode(code);
      if (exists) {
        await CountryService.deleteCountry(code);
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No countries were deleted",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.COUNTRY_WMS.COUNTRY_DELETED_SUCCESSFULLY,
      deletedCount,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
  }
};
