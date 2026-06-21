import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { accountsetupSchema } from "../../validation/wms/gm.validation";
import { AcSetupService } from "../../services/WMS/acsetup.service";

export const createAccountsetup = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = accountsetupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    // Map snake_case fields to camelCase for TypeORM, filter allowed fields
    const allowedFields = [
      "companyCode", "pdcReceiptCode", "pdcIssueCode", "docDateEditable", "acCode", "bankName", "acName", "swiftCode",
      "baseCurrCode", "priceDecimalNos", "amountDecimalNos", "lcurDecimalNos", "qtyDecimalNos", "financialYrStart",
      "financialYrEnd", "docEditFrom", "docEditTo", "jobClass", "exchangeDiffAc", "principalAcGroup", "expsubtypeAccident",
      "expsubtypeFine", "expsubtypeFuel", "expsubtypeIns", "expsubtypeReg", "expsubtypeRepair", "expsubtypeService",
      "supplierAcGroup", "expcodeVehicle", "age1", "age2", "age3", "age4", "age5", "docnoType", "intercompanyAcGroup",
      "multyDivAccounting", "billSettleLcur", "defaultTaxBstype", "age6", "taxPerc"
    ];

    const mappedBody = Object.entries(req.body).reduce((acc: any, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (allowedFields.includes(camelKey)) {
        acc[camelKey] = value;
      }
      return acc;
    }, {});

    // Always normalize codes and set createdBy - use uppercase for Oracle
    mappedBody.companyCode = req.body.company_code?.trim().toUpperCase();
    mappedBody.acCode = req.body.ac_code?.trim().toUpperCase();
    mappedBody.createdBy = requestUser.loginid;

    console.log('Controller - Creating with:', { 
      companyCode: mappedBody.companyCode, 
      acCode: mappedBody.acCode 
    });

    // Try to create; service will check for existence
    const createAccountsetup = await AcSetupService.createAcSetup(mappedBody);

    if (!createAccountsetup) {
      res
        .status(constants.STATUS_CODES.CONFLICT)
        .json({ success: false, message: "Account setup already exists for this company and account code." });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.AC_SETUP_WMS.AC_SETUP_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    console.error("Error in createAccountsetup:", error); // Add error logging
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message || "Error while creating company" });
    return;
  }
};

export const updateAccountsetup = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = accountsetupSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { ac_code, company_code } = req.body;

    // Normalize codes to avoid whitespace/case issues - use uppercase for Oracle
    const acCodeNormalized = ac_code?.trim().toUpperCase();
    const companyCodeNormalized = company_code?.trim().toUpperCase();

    const accountsetupExists = await AcSetupService.checkAcSetupExists(companyCodeNormalized, acCodeNormalized);

    if (!accountsetupExists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.AC_SETUP_WMS.AC_SETUP_DOES_NOT_EXISTS,
      });
      return;
    }
    
    // Map snake_case fields to camelCase for TypeORM
    const updateData = {
      acCode: acCodeNormalized,
      updatedBy: requestUser.loginid,
      updatedAt: new Date(),
      // Map other fields as needed
      ...Object.entries(req.body).reduce((acc: any, [key, value]) => {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        if (key !== 'company_code' && key !== 'ac_code') {
          acc[camelKey] = value;
        }
        return acc;
      }, {})
    };
    
    const updateSuccess = await AcSetupService.updateAcSetup(companyCodeNormalized, acCodeNormalized, updateData);
    
    if (!updateSuccess) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating company" });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.AC_SETUP_WMS.AC_SETUP_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteAccountsetupes = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const accountsetupesCode = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.AC_SETUP_WMS.SELECT_AT_LEAST_ONE_AC_SETUP,
      });
      return;
    }
    
    // Expecting array of { company_code, ac_code }
    const deleteSuccess = await AcSetupService.deleteMultipleAcSetups(
      accountsetupesCode.map((item: any) => ({
        companyCode: item.company_code,
        acCode: item.ac_code
      }))
    );
    
    if (!deleteSuccess) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete account setups",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.AC_SETUP_WMS.AC_SETUP_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
