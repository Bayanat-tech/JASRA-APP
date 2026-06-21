import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { airlineSchema } from "../../validation/wms/gm.validation";
import { AirlineService } from "../../services/WMS/airline.service";

export const createAirLine = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = airlineSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { airline_code, company_code } = req.body;

    // Convert snake_case to camelCase for TypeORM entity
    const airlineExists = await AirlineService.checkAirlineExists(
      company_code,
      airline_code
    );

    if (airlineExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.AIRLINE_WMS.AIRLINE_ALREADY_EXISTS,
      });
      return;
    }

    // Transform request data to match TypeORM entity structure
    const airlineData = {
      airlineCode: req.body.airline_code,
      companyCode: req.body.company_code,
      airlineName: req.body.airline_name,
    };

    const createdAirline = await AirlineService.createAirline(airlineData);

    if (!createdAirline) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating AirLine" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.AIRLINE_WMS.AIRLINE_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateAirLine = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = airlineSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { old_airline_code, airline_code, company_code } = req.body;

    if (!old_airline_code) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "old_airline_code is required for update",
      });
      return;
    }

    const airlineExists = await AirlineService.checkAirlineExists(
      company_code,
      old_airline_code
    );

    if (!airlineExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.AIRLINE_WMS.AIRLINE_DOES_NOT_EXISTS,
      });
      return;
    }

    // Transform request data to match TypeORM entity structure
    const airlineData = {
      airlineCode: airline_code,
      companyCode: company_code,
      airlineName: req.body.airline_name,
    };

    const updateSuccess = await AirlineService.updateAirline(
      company_code,
      old_airline_code,
      airlineData
    );

    if (!updateSuccess) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating AirLine" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.AIRLINE_WMS.AIRLINE_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteAirLines = async (req: RequestWithUser, res: Response) => {
  try {
    const airlineCodes = req.body;

    if (!airlineCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.AIRLINE_WMS.SELECT_AT_LEAST_ONE_AIRLINE,
      });
      return;
    }

    // Format the data for the service method
    const airlineKeys = airlineCodes.map((code: any) => ({
      companyCode: code.company_code,
      airlineCode: code.airline_code,
    }));

    const deleteSuccess = await AirlineService.deleteAirlines(airlineKeys);

    if (!deleteSuccess) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No airlines were deleted",
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.AIRLINE_WMS.AIRLINE_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
