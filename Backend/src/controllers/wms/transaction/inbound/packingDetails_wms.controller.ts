// Import required dependencies and types
import { Response } from "express";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { IUser } from "../../../../interfaces/user.interface";
import { packingDetailsSchema } from "../../../../validation/wms/transaction/inbound.validation";
import constants from "../../../../helpers/constants";
import { ProductService } from "../../../../services/WMS/product.service";
import { WarehouseService } from "../../../../services/WMS/warehouse.service";
import { PackingDetailsService } from "../../../../services/WMS/transaction/inbound/packingDetails.service";
import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import * as fastCsv from "fast-csv";
import WmsCsvHeaders from "../../../../utils/exportCsv/WmsCsvHeaders";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import { Like } from "typeorm";

// Get a single packing detail by prin_code, packdet_no and job_no
export const getPackingDetail = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("i am here packing details ...............");
    const { prin_code, packdet_no, job_no } = req.query;

    // Find packing details record
    const packingDetails = await PackingDetailsService.findOne({
      company_code: req.user.company_code,
      prin_code: prin_code as string,
      job_no: job_no as string,
      packdet_no: Number(packdet_no),
    });

    // Return error if packing details not found
    if (!packingDetails) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Packing Item " + constants.MESSAGES.DOES_NOT_EXISTS,
      });
      return;
    }

    // Get associated product info
    const productInfo = await ProductService.findByCodeAndCompany(
      packingDetails.prod_code,
      req.user.company_code
    );

    // Return packing details with product info
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        ...packingDetails,
        prod_name: productInfo?.prodName,
        uom_count: productInfo?.uomCount,
        uppp: productInfo?.uppp,
      },
    });
    return;
  } catch (error: unknown) {
    const knownError = error as { message: string };
    res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: knownError.message });
  }
};

// Create a new packing item
export const createPackingItem = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
console.log('inside createPackingItem1a');
    // Validate request body
    const { error } = packingDetailsSchema(
      req.body,
      false,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
console.log('inside createPackingItem1b');
    // Validate product code if provided
    if (!!req.body.prod_code) {
      const productResponse = await ProductService.findByCodeAndCompany(
        req.body.prod_code,
        requestUser.company_code
      );
      console.log('inside createPackingItem1c');
      if (!productResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Product " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }
console.log('inside createPackingItem1d');
    // Validate country code if provided  
    if (!!req.body.country_code) {
      const countryResponse = await WarehouseService.findByCountryCode({
        country_code: req.body.country_code,
        company_code: requestUser.company_code,
      });
      console.log('inside createPackingItem1e');
      if (!countryResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Country " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }
console.log('inside createPackingItem1f');
    // Create packing details record
    const response = await PackingDetailsService.create({
      ...req.body,
      company_code: requestUser.company_code,
    });
console.log('inside createPackingItem2');
    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: response });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Packing Details " + constants.MESSAGES.CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Update an existing packing item
export const updatePackingItem = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    console.log('inside createPackingItem3');
    const requestUser: IUser = req.user;
    const { packdet_no } = req.params;
    const { prin_code, job_no } = req.query;

    // Validate request body
    const { error } = packingDetailsSchema(
      req.body,
      false,
      requestUser.company_code
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Check if packing details exists
    const packingResponse = await PackingDetailsService.findOne({
      company_code: requestUser.company_code,
      packdet_no: Number(packdet_no),
      prin_code: prin_code as string,
      job_no: job_no as string,
    });
    if (!packingResponse) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Packing " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Validate product code if provided
    if (!!req.body?.prod_code) {
      const productResponse = await ProductService.findByCodeAndCompany(
        req.body.prod_code,
        requestUser.company_code
      );
      if (!productResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Product " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }

    // Validate country code if provided
    if (!!req.body?.country_code) {
      const countryResponse = await WarehouseService.findByCountryCode({
        country_code: req.body.country_code,
        company_code: requestUser.company_code,
      });
      if (!countryResponse) {
        res.status(constants.STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "Country " + constants.MESSAGES.NOT_FOUND,
        });
        return;
      }
    }
console.log('inside createPackingItem');
    // Update packing details
    const response = await PackingDetailsService.update(
      {
        company_code: requestUser.company_code,
        packdet_no: Number(packdet_no),
        prin_code: prin_code as string,
        job_no: job_no as string,
      },
      {
        ...req.body,
        packdet_no: Number(packdet_no),
      }
    );

    if (!response) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to update packing details" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Packing Details " + constants.MESSAGES.UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
// Delete one or multiple packing items based on provided details
export const deletePackingItem = async (
  req: RequestWithUser,
  res: Response
): Promise<any> => {
  try {
    const { packing_details } = req.body;
    const requestUser = req.user;
    // Validate that at least one item is provided for deletion
    if (packing_details.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one packing item to delete",
      });
    }

    // Delete all provided packing items using service
    const deleteRequests = packing_details.map(
      (packingDetail: {
        prin_code: string;
        job_no: string;
        packdet_no: number;
      }) => ({
        prin_code: packingDetail.prin_code,
        job_no: packingDetail.job_no,
        packdet_no: packingDetail.packdet_no,
        company_code: requestUser.company_code,
      })
    );

    await PackingDetailsService.deleteMany(deleteRequests);

    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Create multiple packing details records in bulk
export const createBulkPAckingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    // Add user info to each record
    req.body = req.body.map((packingDetails: IPackingDetails[]) => ({
      ...packingDetails.reduce((acc: any, value: any, index: number) => {
        acc[constants.CSVFIELDNAME.PACKING_DETAILS[index]] = value;
        return acc;
      }, {}),
      company_code: requestUser.company_code,
    }));

    // Bulk create records, ignoring duplicates
    await PackingDetailsService.bulkCreate(req.body, { ignoreDuplicates: true });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Packing Details " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Export packing details to CSV file
export const exportPackingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;
    let fetchedData: any[] = [];

    // Parse filter from query params
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    // Build query with company code and search filters
    let whereConditions: any = {
      company_code: req.user.company_code,
    };

    // Apply search filters if provided using the helper function
    if (filter.search && Array.isArray(filter.search)) {
      // Process search conditions from the nested array structure
      filter.search.forEach((orGroup) => {
        orGroup.forEach((condition) => {
          if (condition.field_name && condition.field_value) {
            // Handle different operators
            switch (condition.operator) {
              case "contains":
              case "like":
                whereConditions[condition.field_name] = Like(`%${condition.field_value}%`);
                break;
              case "equals":
              case "=":
                whereConditions[condition.field_name] = condition.field_value;
                break;
              default:
                whereConditions[condition.field_name] = condition.field_value;
            }
          }
        });
      });
    }

    // Fetch filtered data
    fetchedData = await PackingDetailsService.findWithFilters(whereConditions);

    // Initialize CSV formatter with headers
    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.TANSACTION.INBOUND.PACKING_DETAIL,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="packing_details.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      csvTransform.write(eachData); // Write each row to the CSV stream
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end(); // Complete the CSV data transformation
    csvTransform.pipe(res); // Pipe CSV data into the HTTP response
  } catch (error: any) {
    console.error("Export Error:", error); // Log the error for debugging
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add receiving details (update qty1_arrived and qty2_arrived)
export const addReceivingDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { prin_code, job_no, packdet_no } = req.query;
    const { qty1_arrived, qty2_arrived } = req.body;

    // Validate required query parameters
    if (!prin_code || !job_no || !packdet_no) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "prin_code, job_no, and packdet_no are required",
      });
      return;
    }

    // Validate that at least one quantity is provided
    if (qty1_arrived === undefined && qty2_arrived === undefined) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "At least one of qty1_arrived or qty2_arrived must be provided",
      });
      return;
    }

    // Check if packing details exists
    const packingDetails = await PackingDetailsService.findOne({
      company_code: requestUser.company_code,
      prin_code: prin_code as string,
      job_no: job_no as string,
      packdet_no: Number(packdet_no),
    });

    if (!packingDetails) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Packing Details " + constants.MESSAGES.NOT_FOUND,
      });
      return;
    }

    // Prepare receiving data
    const receivingData: { qty1_arrived?: number; qty2_arrived?: number } = {};
    if (qty1_arrived !== undefined) {
      receivingData.qty1_arrived = Number(qty1_arrived);
    }
    if (qty2_arrived !== undefined) {
      receivingData.qty2_arrived = Number(qty2_arrived);
    }

    // Update receiving details
    const response = await PackingDetailsService.updateReceivingDetails(
      {
        company_code: requestUser.company_code,
        prin_code: prin_code as string,
        job_no: job_no as string,
        packdet_no: Number(packdet_no),
      },
      receivingData
    );

    if (!response) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to update receiving details",
      });
      return;
    }

    // Fetch updated record to return
    const updatedPackingDetails = await PackingDetailsService.findOne({
      company_code: requestUser.company_code,
      prin_code: prin_code as string,
      job_no: job_no as string,
      packdet_no: Number(packdet_no),
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Receiving Details " + constants.MESSAGES.UPDATED_SUCCESSFULLY,
      data: updatedPackingDetails,
    });
    return;
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};

// Update clearance status to 'Y' for packing details
export const updateClearanceStatus = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const { company_code, prin_code, job_no, packdet_no } = req.body;

    // Validate required parameters
    if (!company_code || !prin_code || !job_no) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "company_code, prin_code, and job_no are required",
      });
      return;
    }

    // Verify company code matches the authenticated user
    if (company_code !== requestUser.company_code) {
      res.status(constants.STATUS_CODES.FORBIDDEN).json({
        success: false,
        message: "Company code does not match authenticated user",
      });
      return;
    }

    // Prepare clearance data
    const clearanceData: {
      clearance: string;
      cleared_user?: string;
      cleared_date?: Date;
    } = {
      clearance: "Y",
      cleared_user: requestUser.user_id,
      cleared_date: new Date(),
    };

    // Update clearance for the specified record(s)
    const affectedCount = await PackingDetailsService.updateClearance(
      {
        company_code: company_code,
        prin_code: prin_code,
        job_no: job_no,
        packdet_no: packdet_no ? Number(packdet_no) : undefined,
      },
      clearanceData
    );

    if (affectedCount === 0) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "No packing details found to update",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: `Clearance status updated successfully for ${affectedCount} record(s)`,
      data: {
        affected_count: affectedCount,
      },
    });
    return;
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
    return;
  }
};
