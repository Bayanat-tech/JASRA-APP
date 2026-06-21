import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { vesselSchema } from "../../validation/wms/gm.validation";
import { VesselService } from "../../services/WMS/vessel.service";

export const createVessel = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = vesselSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    // Map request body fields to camelCase for service
    const { vessel_code, company_code, group_code, group_name } = req.body;

    if (!vessel_code) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: "VESSEL_CODE is required" });
      return;
    }

    const exists = await VesselService.checkVesselExists(
      vessel_code, // vessel_code is used as vesselCode
      company_code
    );

    if (exists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VESSEL_WMS.VESSEL_ALREADY_EXISTS,
      });
      return;
    }

    const createVessel = await VesselService.createVessel({
      companyCode: company_code,
      vesselCode: vessel_code, // Correct mapping
      vesselName: req.body.vessel_name,
      lineCode: req.body.line_code,
      contactPerson: req.body.contact_person,
      address: req.body.address,
      telNo: req.body.tel_no,
      faxNo: req.body.fax_no,
      email: req.body.email,
      createdBy: requestUser.username,
      updatedBy: requestUser.username,
      // ...other fields if needed
    });

    if (!createVessel) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating Vessel" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.VESSEL_WMS.VESSEL_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateVessel = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = vesselSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    // Map request body fields to camelCase for service
    const { vessel_code, company_code, original_vessel_code, original_company_code } = req.body;

    // Use original codes for existence check, fall back to current codes if originals not provided
    const checkVesselCode = original_vessel_code || vessel_code;
    const checkCompanyCode = original_company_code || company_code;

    if (!checkVesselCode) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: "VESSEL_CODE is required" });
      return;
    }

    const exists = await VesselService.checkVesselExists(
      checkVesselCode,
      checkCompanyCode
    );

    if (!exists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VESSEL_WMS.VESSEL_DOES_NOT_EXISTS,
      });
      return;
    }

    const updateData = {
      vesselCode: vessel_code,
      companyCode: company_code,
      vesselName: req.body.vessel_name,
      lineCode: req.body.line_code,
      contactPerson: req.body.contact_person,
      address: req.body.address,
      telNo: req.body.tel_no,
      faxNo: req.body.fax_no,
      email: req.body.email,
      updatedBy: requestUser.username,
    };

    const updated = await VesselService.updateVessel(
      checkVesselCode,
      checkCompanyCode,
      updateData
    );

    if (!updated) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating Vessel" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.VESSEL_WMS.VESSEL_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteVessel = async (req: RequestWithUser, res: Response) => {
  try {
    const vesselCodes = req.body;

    if (!vesselCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.VESSEL_WMS.SELECT_AT_LEAST_ONE_VESSEL,
      });
      return;
    }

    // Format the data for the service method
    const vesselsToDelete = vesselCodes.map((item: any) => ({
      vesselCode: item.vessel_code, // Correct mapping
      companyCode: item.company_code,
    }));

    const deleted = await VesselService.deleteVessels(vesselsToDelete);

    if (!deleted) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete vessels",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.VESSEL_WMS.VESSEL_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
