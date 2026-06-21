// Import required dependencies and interfaces
import { Response } from "express";
import * as fastCsv from "fast-csv";
import { Op } from "sequelize";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
//import { ICountry } from "../../interfaces/wms/gm_wms.interface";
import { IProducttype } from "../../interfaces/wms/gm_wms.interface";
//import Country from "../../models/wms/country_wms.model";
import Producttype from "../../models/wms/producttype_wms.model";
import { producttypeSchema } from "../../validation/wms/gm.validation";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";

// Create a new product type
export const createProducttype = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body against schema
    const { error } = producttypeSchema(
      req.body,
      requestUser.company_code,
      false
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { prodtype_code, company_code } = req.body;

    // Check if product type already exists
    const producttype = await Producttype.findOne({
      where: {
        [Op.and]: [
          { company_code: company_code },
          { prodtype_code: prodtype_code },
        ],
      },
    });

    if (producttype) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PRODUCTTYPE_WMS.PRODUCTTYPE_ALREADY_EXISTS,
      });
      return;
    }

    // Create new product type
    const createProducttype = await Producttype.create({
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
      ...req.body,
    });

    if (!createProducttype) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating company" });
      return;
    }

    // Return success response
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.PRODUCTTYPE_WMS.PRODUCTTYPE_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Update existing product type
export const updateProducttype = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body
    const { error } = producttypeSchema(
      req.body,
      requestUser.company_code,
      false
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { prodtype_code, company_code } = req.body;

    // Check if product type exists
    const producttype = await Producttype.findOne({
      where: {
        [Op.and]: [
          { company_code: company_code },
          { prodtype_code: prodtype_code },
        ],
      },
    });

    if (!producttype) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PRODUCTTYPE_WMS.PRODUCTTYPE_DOES_NOT_EXISTS,
      });
      return;
    }

    // Update product type
    const createProducttype = await Producttype.update(
      {
        company_code,
        updated_by: requestUser.loginid,
        ...req.body,
      },
      {
        where: {
          [Op.and]: [
            { company_code: company_code },
            { prodtype_code: prodtype_code },
          ],
        },
      }
    );

    if (!createProducttype) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }

    // Return success response
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.PRODUCTTYPE_WMS.PRODUCTTYPE_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Create multiple product types in bulk
export const createBulkProducttypes = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body
    const { error } = producttypeSchema(
      req.body,
      requestUser.company_code,
      true
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Add user info to each record
    req.body = req.body.map((producttype: IProducttype) => ({
      ...producttype,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    // Bulk create product types
    Producttype.bulkCreate(req.body, { ignoreDuplicates: true });

    // Return success response
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Producttype " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Export product types to CSV
export const exportProducttype = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    let fetchedData: any[] = [],
      csvTransform: fastCsv.CsvFormatterStream<
        fastCsv.FormatterRow,
        fastCsv.FormatterRow
      >;

    // Fetch all product types for company
    fetchedData = await Producttype.findAll({
      where: { company_code: req.user.company_code },
    });

    // Configure CSV formatter
    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.MASTER.PRODUCTTYPE,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="producttype.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      const plainData = eachData.get({ plain: true });
      csvTransform.write(plainData); // Write each row to the CSV stream
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end(); // Complete the CSV data transformation
    csvTransform.pipe(res); // Pipe CSV data into the HTTP response
  } catch (error: any) {
    console.error("Export Error:", error); // Log the error for debugging
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete multiple product types
export const deleteProducttypes = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const producttypesCode = req.body;

    // Validate request
    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.PRODUCTTYPE_WMS.SELECT_AT_LEAST_ONE_PRODUCTTYPE,
      });
      return;
    }

    // Delete product types
    const producttypesDeleteResponse = await Producttype.destroy({
      where: {
        prodtype_code: producttypesCode,
      },
    });

    // Handle deletion failure
    if (producttypesDeleteResponse === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: producttypesDeleteResponse,
      });
      return;
    }

    // Return success response
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.PRODUCTTYPE_WMS.PRODUCTTYPE_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
