import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { divisionSchema } from "../../validation/wms/gm.validation";
import { DivisionService } from "../../services/WMS/division.service";

export const CreateDivision = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = divisionSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { div_code, company_code, div_name, div_address1 } = req.body;

    // Validate div_name is present and not empty
    if (!div_name || typeof div_name !== "string" || div_name.trim() === "") {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: "Division name (div_name) is required." });
      return;
    }

    // Validate div_address1 is present and not empty
    if (!div_address1 || typeof div_address1 !== "string" || div_address1.trim() === "") {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: "Division address (div_address1) is required." });
      return;
    }

    // Set default country_code if not provided
    const country_code = req.body.country_code && typeof req.body.country_code === "string" && req.body.country_code.trim() !== ""
      ? req.body.country_code
      : "SA"; // <-- Set your default country code here

    // Set default status if not provided
    const status = req.body.status && typeof req.body.status === "string" && req.body.status.trim() !== ""
      ? req.body.status
      : "A"; // <-- Use single character for status

    // Set default values for div_address2 and div_address3 if not provided
    const div_address2 = req.body.div_address2 && typeof req.body.div_address2 === "string"
      ? req.body.div_address2
      : "";
    const div_address3 = req.body.div_address3 && typeof req.body.div_address3 === "string"
      ? req.body.div_address3
      : "";

    const divisionExists = await DivisionService.checkDivisionExists(company_code, div_code);

    if (divisionExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.DIVISION_WMS.DIVISION_ALREADY_EXISTS,
      });
      return;
    }
    
    const createDivision = await DivisionService.createDivision({
      companyCode: company_code,
      divCode: div_code,
      divName: div_name,
      divAddress1: div_address1,
      divAddress2: div_address2,
      divAddress3: div_address3,
      countryCode: country_code,
      status: status,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid,
      userId: requestUser.loginid,
    } as any);
    
    if (!createDivision) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating division" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.DIVISION_WMS.DIVISION_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateDivision = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = divisionSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { 
      div_code, 
      company_code, 
      old_div_code,      // Add this to identify the existing record
      old_company_code,  // Add this to identify the existing record
      div_name, 
      div_short_name, 
      div_address1, 
      div_address2, 
      div_address3, 
      country_code, 
      status 
    } = req.body;

    // Use old values for lookup, or fall back to current values if not editing keys
    const lookupCompanyCode = old_company_code || company_code;
    const lookupDivCode = old_div_code || div_code;

    // Validate that primary keys are provided
    if (!lookupDivCode || !lookupCompanyCode) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Division code and company code are required to identify the division.",
      });
      return;
    }

    const division = await DivisionService.findByCompanyAndDivisionCode(lookupCompanyCode, lookupDivCode);

    if (!division) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.DIVISION_WMS.DIVISION_DOES_NOT_EXISTS,
      });
      return;
    }

    // Transform snake_case to camelCase for entity properties
    const updateData: any = {};
    
    // Include the new primary key values if they're being changed
    if (company_code !== undefined && company_code !== lookupCompanyCode) {
      updateData.companyCode = company_code;
    }
    if (div_code !== undefined && div_code !== lookupDivCode) {
      updateData.divCode = div_code;
    }
    
    if (div_name !== undefined) updateData.divName = div_name;
    if (div_short_name !== undefined) updateData.divShortName = div_short_name;
    if (div_address1 !== undefined) updateData.divAddress1 = div_address1;
    if (div_address2 !== undefined) updateData.divAddress2 = div_address2;
    if (div_address3 !== undefined) updateData.divAddress3 = div_address3;
    if (country_code !== undefined) updateData.countryCode = country_code;
    if (status !== undefined) updateData.status = status;
    updateData.userId = requestUser.loginid;

    const updateSuccess = await DivisionService.updateDivision(
      lookupCompanyCode,  // Use old values to find the record
      lookupDivCode,      // Use old values to find the record
      updateData
    );
    
    if (!updateSuccess) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating division" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.DIVISION_WMS.DIVISION_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteDivisions = async (req: RequestWithUser, res: Response) => {
  try {
    const divisionsToDelete = req.body;

    if (!divisionsToDelete.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HARMONIZE_WMS.SELECT_AT_LEAST_ONE_HARMONIZE,
      });
      return;
    }
    
    // Transform the input data to match the service method requirements
    const divisionKeys = divisionsToDelete.map((division: any) => ({
      companyCode: division.company_code,
      divCode: division.div_code,
    }));

    const deleteSuccess = await DivisionService.deleteDivisions(divisionKeys);
    
    if (!deleteSuccess) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Error while deleting divisions",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.DIVISION_WMS.DIVISION_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};


