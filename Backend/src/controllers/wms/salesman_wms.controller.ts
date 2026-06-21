import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { salesmanSchema } from "../../validation/wms/gm.validation";
import { SalesmanService } from "../../services/WMS/salesman.service";
import { createLog, notifyUser } from "../../helpers/functions";

// Create a new Salesman or return all salesmen if no body is provided
export const createSalesman = async (req: RequestWithUser, res: Response) => {
  console.log("===== createSalesman HIT =====");
  console.log("Request body:", req.body);
  console.log("Request method:", req.method);
  
  try {
    const requestUser: IUser = req.user;
    
    // Extract salesman-specific fields
    const { salesman_code, salesman_name, code, code2, page, limit, ...rest } = req.body;
    
    console.log("salesman_code:", salesman_code);
    console.log("salesman_name:", salesman_name);
    
    // If no salesman_code AND no salesman_name, it's a fetch request
    // Also check if salesman_code is undefined/null/empty string
    const hasValidSalesmanCode = salesman_code && salesman_code !== "undefined" && salesman_code.trim() !== "";
    const hasValidSalesmanName = salesman_name && salesman_name !== "undefined" && salesman_name.trim() !== "";
    
    if (!hasValidSalesmanCode && !hasValidSalesmanName) {
      console.log("Fetching all salesmen...");
      const salesmen = await SalesmanService.findAll();
      console.log("Salesmen found:", salesmen?.length || 0);
      
      // Return in the format expected by frontend
      return res.status(constants.STATUS_CODES.OK).json({
        success: true,
        data: {
          tableData: salesmen || [],
          count: salesmen?.length || 0
        }
      });
    }

    // Validate for creation
    const { error } = salesmanSchema(req.body);

    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { company_code } = req.body;

    // Check duplicate
    const duplicate = await SalesmanService.findDuplicate({ salesman_code, salesman_name });
    if (duplicate) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SALESMAN_WMS.SALESMAN_ALREADY_EXISTS,
      });
      return;
    }

    // Create new salesman
    const newSalesman = await SalesmanService.createSalesman({
      ...req.body,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!newSalesman) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating salesman" });
      return;
    }

    // Optional: log + notify
    await createLog({
      event: constants.EVENTS.SALESMAN_CREATED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description: constants.MESSAGES.SALESMAN_WMS.SALESMAN_CREATED_SUCCESSFULLY,
    });

    await notifyUser({
      event: constants.EVENTS.SALESMAN_CREATED,
      request_user: requestUser,
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SALESMAN_WMS.SALESMAN_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    console.log("Error in createSalesman:", error);
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

// Update existing Salesman
export const updateSalesman = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Validate request
    const { error } = salesmanSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { salesman_code } = req.body;

    // Check if salesman exists
    const existingSalesman = await SalesmanService.findByCode(salesman_code);
    if (!existingSalesman) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SALESMAN_WMS.SALESMAN_DOES_NOT_EXISTS,
      });
    }

    // Update salesman
    const updated = await SalesmanService.updateSalesman(salesman_code, {
      ...req.body,
      updated_by: requestUser.loginid,
    });

    if (!updated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating salesman",
      });
    }

    // Optional: log + notify
    await createLog({
      event: constants.EVENTS.SALESMAN_EDITED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description: constants.MESSAGES.SALESMAN_WMS.SALESMAN_UPDATED_SUCCESSFULLY,
    });

    await notifyUser({
      event: constants.EVENTS.SALESMAN_EDITED,
      request_user: requestUser,
    });

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SALESMAN_WMS.SALESMAN_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete multiple Salesmen
export const deleteSalesmen = async (req: RequestWithUser, res: Response) => {
  try {
    const salesmanCodes: string[] = req.body;

    if (!Array.isArray(salesmanCodes) || !salesmanCodes.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SALESMAN_WMS.SELECT_AT_LEAST_ONE_SALESMAN,
      });
    }

    let deletedCount = 0;

    for (const code of salesmanCodes) {
      const exists = await SalesmanService.findByCode(code);
      if (exists) {
        const deleted = await SalesmanService.deleteSalesman(code);
        if (deleted) deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SALESMAN_WMS.SALESMAN_DOES_NOT_EXISTS,
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SALESMAN_WMS.SALESMAN_DELETED_SUCCESSFULLY,
      deletedCount,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
