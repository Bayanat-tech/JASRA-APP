import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { ActivityUOCService } from "../../services/WMS/moc2.service";

export const createMoc2 = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Minimal required-field validation — entity/table uses composite key, so ensure these are present.
    const { company_code, charge_code, charge_type, activity_group_code } = req.body;
    if (!company_code || !charge_code || !charge_type || !activity_group_code) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          "company_code, charge_code, charge_type and activity_group_code are required",
      });
      return;
    }

    console.log('Checking existence for:', { company_code, charge_code, charge_type, activity_group_code });

    // Check for existing record with the same composite key
    const exists = await ActivityUOCService.checkActivityUOCExists(
      company_code, 
      charge_code, 
      charge_type, 
      activity_group_code
    );

    console.log('Record exists:', exists);

    if (exists) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: `A record with Company Code: ${company_code}, Charge Code: ${charge_code}, Charge Type: ${charge_type}, and Activity Group Code: ${activity_group_code} already exists.`,
      });
      return;
    }

    const createMoc = await ActivityUOCService.createActivityUOC({
      company_code,
      charge_code,
      charge_type,
      activity_group_code,
      description: req.body.description,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    console.log('Created record:', createMoc);

    if (!createMoc) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating record" });
      return;
    }

    // Verify the record was actually created by checking again
    const verifyCreated = await ActivityUOCService.findByCompositeKey(
      company_code,
      charge_code,
      charge_type,
      activity_group_code
    );
    
    console.log('Verification fetch:', verifyCreated);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOM_WMS.UOM_CREATED_SUCCESSFULLY,
      data: verifyCreated || createMoc,
    });
    return;
  } catch (error: any) {
    console.error('Error in createMoc2:', error);
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateMoc2 = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    // Minimal required-field validation for update: company_code plus at least one of the lookup keys
    const {
      charge_code,
      company_code,
      charge_type,
      activity_group_code,
      // optional old keys for locating the record
      old_charge_code,
      old_charge_type,
      old_activity_group_code,
    } = req.body;

    if (!company_code) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "company_code is required",
      });
      return;
    }

    // Use old values (if provided) to locate the existing record, otherwise fall back to the provided new values
    const lookupChargeCode = old_charge_code || charge_code;
    const lookupChargeType = old_charge_type || charge_type;
    const lookupActivityGroupCode = old_activity_group_code || activity_group_code;

    if (!lookupChargeCode || !lookupChargeType || !lookupActivityGroupCode) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          "At least one set of keys must be provided to locate the record: charge_code/old_charge_code, charge_type/old_charge_type, activity_group_code/old_activity_group_code",
      });
      return;
    }

    const moc = await ActivityUOCService.findByCompositeKey(
      company_code,
      lookupChargeCode,
      lookupChargeType,
      lookupActivityGroupCode
    );

    if (!moc) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOM_WMS.UOM_DOES_NOT_EXISTS,
      });
      return;
    }

    const updatePayload: any = {
      description: req.body.description,
      // if activity_group_code is being changed, include the new value here
      activity_group_code: activity_group_code,
      updated_by: requestUser.loginid,
    };

    const updateResult = await ActivityUOCService.updateActivityUOC(
      company_code,
      lookupChargeCode,
      lookupChargeType,
      lookupActivityGroupCode,
      updatePayload
    );

    if (!updateResult || !updateResult.success) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating record", data: updateResult });
      return;
    }

    // Return old_/updated_ fields so caller can compare
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "MOC2 UPDATED SUCCESSFULLY",
      data: updateResult,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const deleteActivityUOCs = async (req: RequestWithUser, res: Response) => {
  try {
    const recordsToDelete = req.body;

    if (!recordsToDelete || !recordsToDelete.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.UOM_WMS.SELECT_AT_LEAST_ONE_UOM,
      });
      return;
    }

    const deleteResult = await ActivityUOCService.deleteActivityUOCs(recordsToDelete);

    if (!deleteResult) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Failed to delete records",
      });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.UOM_WMS.UOM_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
