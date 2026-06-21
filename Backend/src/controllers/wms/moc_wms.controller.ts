import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { mocSchema } from "../../validation/wms/gm.validation";
import { MocService } from "../../services/WMS/moc.service";

// Create a new MOC
export const createMoc = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("=== CREATE MOC START ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const requestUser: IUser = req.user;
    console.log("Request user:", requestUser.loginid);

    const { error } = mocSchema(req.body);
    if (error) {
      console.log("Validation error:", error.message);
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
    console.log("Validation passed");

    const { moc_code, moc_name, company_code } = req.body;
    console.log("Extracted values - Code:", moc_code, "Name:", moc_name, "Company:", company_code);

    // Validate required fields
    if (!moc_code || !moc_name) {
      console.log("ERROR: Missing required fields - moc_code or moc_name");
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "moc_code and moc_name are required fields",
      });
    }

    // Check for duplicate code
    console.log("Checking for duplicate code:", moc_code);
    const duplicateCode = await MocService.findByCode(moc_code);
    console.log("Duplicate code result:", duplicateCode ? "FOUND" : "NOT FOUND");
    if (duplicateCode) {
      console.log("Duplicate code details:", JSON.stringify(duplicateCode, null, 2));
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "MOC with this code already exists",
      });
    }

    // Check for duplicate name
    console.log("Checking for duplicate name:", moc_name);
    const duplicateName = await MocService.findDuplicate({
      moc_name,
    });
    console.log("Duplicate name result:", duplicateName ? "FOUND" : "NOT FOUND");
    if (duplicateName) {
      console.log("Duplicate name details:", JSON.stringify(duplicateName, null, 2));
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "MOC with this name already exists",
      });
    }

    // Create MOC
    console.log("Creating MOC with data:", {
      ...req.body,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    
    const newMoc = await MocService.createMoc({
      ...req.body,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
    console.log("MOC created successfully:", JSON.stringify(newMoc, null, 2));

    if (!newMoc) {
      console.log("ERROR: MOC creation returned null/undefined");
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating MOC",
      });
    }

    console.log("=== CREATE MOC SUCCESS ===");
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOC created successfully",
    });
  } catch (error: any) {
    console.log("=== CREATE MOC ERROR ===");
    console.log("Error:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Update existing MOC
export const updateMoc = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = mocSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { moc_code, moc_name } = req.body;

    const existingMoc = await MocService.findByCode(moc_code);
    if (!existingMoc) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "MOC does not exist",
      });
    }

    // Check for duplicate name (excluding current record)
    if (moc_name && moc_name !== existingMoc.moc_name) {
      const duplicate = await MocService.findDuplicate({
        moc_code: "",
        moc_name,
        excludeCode: moc_code,
      });
      if (duplicate) {
        return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "MOC with this name already exists",
        });
      }
    }

    const updated = await MocService.updateMoc(moc_code, {
      ...req.body,
      updated_by: requestUser.loginid,
    });

    if (!updated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating MOC",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOC updated successfully",
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete multiple MOCs
export const deleteMocs = async (req: RequestWithUser, res: Response) => {
  try {
    const mocCodes: string[] = req.body;

    if (!Array.isArray(mocCodes) || !mocCodes.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Please select at least one MOC to delete",
      });
    }

    let deletedCount = 0;

    for (const code of mocCodes) {
      const exists = await MocService.findByCode(code);
      if (exists) {
        const deleted = await MocService.deleteMoc(code);
        if (deleted) deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "MOC does not exist",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOC deleted successfully",
      deletedCount,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all MOCs
export const getAllMocs = async (req: RequestWithUser, res: Response) => {
  try {
    const mocs = await MocService.findAll();
    
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOCs retrieved successfully",
      data: mocs,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get MOC by code
export const getMocByCode = async (req: RequestWithUser, res: Response) => {
  try {
    const { moc_code } = req.params;

    if (!moc_code) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "MOC code is required",
      });
    }

    const moc = await MocService.findByCode(moc_code);

    if (!moc) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "MOC not found",
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOC retrieved successfully",
      data: moc,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Get MOCs by company
export const getMocsByCompany = async (req: RequestWithUser, res: Response) => {
  try {
    const { company_code } = req.params;

    if (!company_code) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Company code is required",
      });
    }

    const mocs = await MocService.findByCompany(company_code);

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOCs retrieved successfully",
      data: mocs,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
