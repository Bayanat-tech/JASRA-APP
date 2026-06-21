// Import required dependencies
import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { portSchema } from "../../validation/wms/gm.validation";
import { PortService } from "../../services/WMS/port.service";

/**
 * Creates a new port entry
 * @param req Request object containing port details
 * @param res Response object
 */
export const createPort = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Debug log to inspect incoming body
    // console.log("createPort req.body:", req.body);

    // Validate request body against port schema
    const { error } = portSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { port_name, company_code, country_code } = req.body;

    // Remove redundant manual check for country_code
    // If country_code is missing, schema validation will already fail

    // Check duplicate
    const duplicatePort = await PortService.findByDescriptionAndCompany(
      port_name,
      company_code
    );
    if (duplicatePort) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PORT_WMS.PORT_ALREADY_EXISTS,
      });
      return;
    }

    // Create port
    const createdPort = await PortService.createPort({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    if (!createdPort) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating port" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PORT_WMS.PORT_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

/**
 * Updates an existing port entry
 * @param req Request object containing updated port details
 * @param res Response object
 */
export const updatePort = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body against port schema
    const { error } = portSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    const { port_code, company_code } = req.body;

    console.log("updatePort - Request data:", req.body);

    // Use smart update that finds port by either port_code or port_name
    const updateData = {
      ...req.body,
      updated_by: requestUser.loginid,
    };
    const isUpdated = await PortService.updatePortSmart(
      port_code,
      company_code,
      updateData
    );
    
    if (!isUpdated) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: "Port not found or no changes made" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PORT_WMS.PORT_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

/**
 * Deletes multiple port entries
 * @param req Request object containing array of port codes to delete
 * @param res Response object
 */
export const deletePorts = async (req: RequestWithUser, res: Response) => {
  try {
    const port_codes = req.body;

    if (!port_codes || !Array.isArray(port_codes) || port_codes.length === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PORT_WMS.SELECT_AT_LEAST_ONE_PORT,
      });
      return;
    }

    const isDeleted = await PortService.deletePorts(port_codes);

    if (!isDeleted) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No ports were deleted",
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PORT_WMS.PORT_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

/**
 * Fetch ports with optional filters and pagination
 * @param req Request object with query params
 * @param res Response object
 */
export const getPorts = async (req: RequestWithUser, res: Response) => {
  try {
    const { code, code2, page = 1, limit = 20 } = req.query;

    // Prepare filters
    const filters: any = {};
    
    // Only add filters if they have valid values
    if (code && code !== "undefined" && code !== "null") {
      filters.port_code = code;
    }
    if (code2 && code2 !== "undefined" && code2 !== "null") {
      filters.company_code = code2;
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    const { data, total } = await PortService.getPorts(filters, pageNum, limitNum);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

  