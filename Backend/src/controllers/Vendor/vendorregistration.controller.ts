import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { vendorSchema } from "./vendorreeg.validation";
import { VendorService } from "../../services/vendor.service";
// CREATE VENDOR
export const createVendor = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const requestUser: IUser = req.user;
    const { error } = vendorSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { VENDOR_CODE, VENDOR_NAME, COMPANY_CODE } = req.body;

    const existingVendor = await VendorService.findByCompanyAndVendorCode(
      COMPANY_CODE ?? "",
      VENDOR_CODE ?? ""
    );

    if (existingVendor) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: "Vendor already exists" });
      return;
    }

    await VendorService.createVendor({
      ...req.body,
      SECLOGINID: requestUser.loginid,
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Vendor created successfully",
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// UPDATE VENDOR
export const updateVendor = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const requestUser: IUser = req.user;

    // Validate request body
    const { error } = vendorSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { company_code, vendor_code } = req.body;

    // Check if vendor exists
    const vendorData = await VendorService.findByCompanyAndVendorCode(
      company_code,
      vendor_code
    );

    if (!vendorData) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Supplier Does not Exists",
      });
      return;
    }

    // Update vendor
    const updateResult = await VendorService.updateVendor(
      company_code,
      vendor_code,
      { ...req.body, SECLOGINID: requestUser.loginid }
    );

    if (!updateResult.affected) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating vendor" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Supplier Updated Successfully",
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
