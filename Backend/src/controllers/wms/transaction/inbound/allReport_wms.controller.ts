// Import required dependencies
import { Response } from "express";
import { RequestWithUser } from "../../../../interfaces/common.interface";
import constants from "../../../../helpers/constants";
import { IUser } from "../../../../interfaces/user.interface";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import { ISearch } from "../../../../interfaces/common.interface";
import { ReportMasterService } from "../../../../services/Security/reportmaster.service";
import { FindOptionsWhere } from "typeorm";
import { ReportMaster } from "../../../../entity/Security/reportmaster.entity";

/**
 * Get All Reports Controller
 * This controller handles retrieving all inbound reports for a specific company
 * @param req - Express request object with user details
 * @param res - Express response object
 */
export const getAllReports = async (req: RequestWithUser, res: Response) => {
  try {
    // Parse filter from query parameters or use empty object
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};

    // Get authenticated user details
    const requestUser: IUser = await req.user;

    // Initialize query parameters with TypeORM conditions
    let whereConditions: FindOptionsWhere<ReportMaster> = {
      company_code: requestUser.company_code, // Filter by company code
      module: "INBOUND", // Filter for inbound module only
    };

    // Apply search filters to query
    whereConditions = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery: whereConditions,
    });

    // Build order object for sorting if specified
    const order =
      filter?.sort && Object.keys(filter?.sort).length > 0
        ? { [filter.sort.field_name]: filter.sort.desc ? "DESC" : "ASC" }
        : undefined;

    // Fetch reports with filters and get count
    const { data, totalCount } = await ReportMasterService.findAllWithFilters(
      whereConditions,
      order as { [key: string]: "ASC" | "DESC" }
    );

    // Return success response with data
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      totalCount,
      data,
    });
  } catch (error: any) {
    // Handle errors and return error response
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const getAllOutboundReports = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Parse filter from query parameters or use empty object
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};

    // Get authenticated user details
    const requestUser: IUser = await req.user;

    // Initialize query parameters with TypeORM conditions
    let whereConditions: FindOptionsWhere<ReportMaster> = {
      company_code: requestUser.company_code, // Filter by company code
      module: "outbound", // Filter for outbound module only
    };

    // Apply search filters to query
    whereConditions = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery: whereConditions,
    });

    // Build order object for sorting if specified
    const order =
      filter?.sort && Object.keys(filter?.sort).length > 0
        ? { [filter.sort.field_name]: filter.sort.desc ? "DESC" : "ASC" }
        : undefined;

    // Fetch reports with filters and get count
    const { data, totalCount } = await ReportMasterService.findAllWithFilters(
      whereConditions,
      order as { [key: string]: "ASC" | "DESC" }
    );

    // Return success response with data
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      totalCount,
      data,
    });
  } catch (error: any) {
    // Handle errors and return error response
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const getAllDynamicReports = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Parse filter from query parameters or use empty object
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};
    const module = req.query.module as string;
    const reportname = req.query.reportname as string;

    // Get authenticated user details
    const requestUser: IUser = await req.user;

    // Initialize query parameters with TypeORM conditions
    let whereConditions: FindOptionsWhere<ReportMaster> = {
      company_code: requestUser.company_code,
    };

    // Add optional filters
    if (module) {
      whereConditions.module = module;
    }
    if (reportname) {
      whereConditions.reportname = reportname;
    }

    // Apply search filters to query
    whereConditions = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery: whereConditions,
    });

    // Build order object for sorting if specified
    const order =
      filter?.sort && Object.keys(filter?.sort).length > 0
        ? { [filter.sort.field_name]: filter.sort.desc ? "DESC" : "ASC" }
        : undefined;

    // Fetch reports with filters and get count
    const { data, totalCount } = await ReportMasterService.findAllWithFilters(
      whereConditions,
      order as { [key: string]: "ASC" | "DESC" }
    );

    // Return success response with data
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      totalCount,
      data,
    });
  } catch (error: any) {
    // Handle errors and return error response
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const getAllVendorReports = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Parse filter from query parameters or use empty object
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};

    // Get authenticated user details
    const requestUser: IUser = await req.user;

    // Initialize query parameters with TypeORM conditions
    let whereConditions: FindOptionsWhere<ReportMaster> = {
      company_code: requestUser.company_code, // Filter by company code
      module: "vendor", // Filter for vendor module only
    };

    // Apply search filters to query
    whereConditions = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery: whereConditions,
    });

    // Build order object for sorting if specified
    const order =
      filter?.sort && Object.keys(filter?.sort).length > 0
        ? { [filter.sort.field_name]: filter.sort.desc ? "DESC" : "ASC" }
        : undefined;

    // Fetch reports with filters and get count
    const { data, totalCount } = await ReportMasterService.findAllWithFilters(
      whereConditions,
      order as { [key: string]: "ASC" | "DESC" }
    );

    // Return success response with data
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      totalCount,
      data,
    });
  } catch (error: any) {
    // Handle errors and return error response
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

export const getAllEmployeeReports = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Parse filter from query parameters or use empty object
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter as string)
      : {};

    // Get authenticated user details
    const requestUser: IUser = await req.user;

    // Initialize query parameters with TypeORM conditions
    let whereConditions: FindOptionsWhere<ReportMaster> = {
      company_code: requestUser.company_code, // Filter by company code
      module: "Employee", // Filter for Employee module only
    };

    // Apply search filters to query
    whereConditions = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery: whereConditions,
    });

    // Build order object for sorting if specified
    const order =
      filter?.sort && Object.keys(filter?.sort).length > 0
        ? { [filter.sort.field_name]: filter.sort.desc ? "DESC" : "ASC" }
        : undefined;

    // Fetch reports with filters and get count
    const { data, totalCount } = await ReportMasterService.findAllWithFilters(
      whereConditions,
      order as { [key: string]: "ASC" | "DESC" }
    );

    // Return success response with data
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      totalCount,
      data,
    });
  } catch (error: any) {
    // Handle errors and return error response
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};
