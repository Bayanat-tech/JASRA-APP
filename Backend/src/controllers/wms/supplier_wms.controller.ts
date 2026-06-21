import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { supplierSchema } from "../../validation/wms/gm.validation";
import { createLog, notifyUser } from "../../helpers/functions";
import { SupplierService } from "../../services/WMS/suppliermaster.service";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";
 
// Create a new supplier
export const createSupplier = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = supplierSchema(req.body);
    if (error) {
      return res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
 
    const { supp_code, company_code } = req.body;
 
    const existingSupplier = await SupplierService.findDuplicate({
      supp_code,
      company_code,
    });
    if (existingSupplier) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_ALREADY_EXISTS,
      });
    }
 
    const newSupplier = await SupplierService.createSupplier({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });
 
    if (!newSupplier) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating supplier",
      });
    }
 
    await createLog({
      event: constants.EVENTS.SUPPLIER_CREATED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description:
        constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_CREATED_SUCCESSFULLY,
    });
 
    await notifyUser({
      event: constants.EVENTS.SUPPLIER_CREATED,
      request_user: requestUser,
    });
 
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: "Error: " + error.message });
  }
};
 
// Update existing supplier
export const updateSupplier = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { error } = supplierSchema(req.body);
    if (error) {
      return res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
 
    const { supp_code, company_code } = req.body;
    const existingSupplier = await SupplierService.findByCode(
      supp_code,
      company_code
    );
 
    if (!existingSupplier) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_DOES_NOT_EXISTS,
      });
    }
 
    const updateData = { ...req.body, updated_by: requestUser.loginid };
    const isUpdated = await SupplierService.updateSupplier(
      supp_code,
      company_code,
      updateData
    );
 
    if (!isUpdated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating supplier",
      });
    }
 
    await createLog({
      event: constants.EVENTS.SUPPLIER_CREATED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description:
        constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_CREATED_SUCCESSFULLY,
    });
 
    await notifyUser({
      event: constants.EVENTS.SUPPLIER_EDITED,
      request_user: requestUser,
    });
 
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: "Error: " + error.message });
  }
};
 
// Bulk insert suppliers
export const createBulkSuppliers = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const suppliersData = req.body.map((row: any[]) => ({
      supp_code: row[0],
      supp_name: row[1],
      supp_city: row[2],
      supp_addr1: row[3],
      supp_email1: row[4],
      supp_contact1: row[5],
      curr_code: row[6],
      country_code: row[7],
      company_code: requestUser.company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    }));
 
    for (const supplier of suppliersData) {
      const exists = await SupplierService.findByCode(
        supplier.supp_code,
        supplier.company_code
      );
      if (!exists) {
        await SupplierService.createSupplier(supplier);
      }
    }
 
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Supplier " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
 
// Export suppliers to CSV
export const exportSupplier = async (req: RequestWithUser, res: Response) => {
  try {
    const fetchedData = await SupplierService.findAll();
    const filteredData = fetchedData.filter(
      (s) => s.company_code === req.user.company_code
    );
 
    const csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.MASTER.SUPPLIER,
    });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="supplier.csv"`
    );
    csvTransform.pipe(res);
 
    filteredData.forEach((supplier) => csvTransform.write(supplier));
    csvTransform.end();
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
 
// Delete multiple suppliers
export const deleteSuppliers = async (req: RequestWithUser, res: Response) => {
  try {
    const suppliersCode: string[] = req.body;
    if (!suppliersCode || !suppliersCode.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.SUPPLIER_WMS.SELECT_AT_LEAST_ONE_SUPPLIER,
      });
    }
 
    let deletedCount = 0;
    for (const code of suppliersCode) {
      const exists = await SupplierService.findByCode(
        code,
        req.user.company_code
      );
      if (exists) {
        await SupplierService.deleteSupplier(code, req.user.company_code);
        deletedCount++;
      }
    }
 
    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No suppliers were deleted",
      });
    }
 
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_DELETED_SUCCESSFULLY,
      deletedCount,
    });
  } catch (error: any) {
    return res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
 
// Get all suppliers
export const getAllSuppliers = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    
    // Pass the company_code filter directly to the service layer
    // to filter at the database level instead of in memory
    const filteredSuppliers = await SupplierService.findByCompany(requestUser.company_code);
    
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Suppliers fetched successfully",
      data: filteredSuppliers,
    });
  } catch (error: any) {
    console.error("Error fetching suppliers:", error);
    return res
      .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR) // Changed from BAD_REQUEST to INTERNAL_SERVER_ERROR
      .json({ success: false, message: "Error: " + error.message });
  }
};
 
// Get a single supplier by code
export const getSupplier = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;
    const { supplierCode } = req.params; // Get supplier code from URL params
    
    if (!supplierCode) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Supplier code is required",
      });
    }
    
    const supplier = await SupplierService.findByCode(
      supplierCode,
      requestUser.company_code
    );
    
    if (!supplier) {
      return res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: constants.MESSAGES.SUPPLIER_WMS.SUPPLIER_DOES_NOT_EXISTS,
      });
    }
    
    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Supplier fetched successfully",
      data: supplier,
    });
  } catch (error: any) {
    return res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: "Error: " + error.message });
  }
};

