import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { partnerSchema } from "../../validation/wms/gm.validation";
import { PartnerService } from "../../services/WMS/partner.service";
import { createLog, notifyUser } from "../../helpers/functions";

// Create a new Partner/Broker
export const createPartner = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = partnerSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { broker_code, broker_name, company_code } = req.body;

    // Check duplicate
    const duplicate = await PartnerService.findDuplicate({ broker_code, broker_name });
    if (duplicate) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PARTNER_WMS.PARTNER_ALREADY_EXISTS,
      });
    }

    // Create broker
    const newPartner = await PartnerService.createBroker({
      ...req.body,
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    if (!newPartner) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating Partner",
      });
    }

    // Optional: log + notify
    await createLog({
      event: constants.EVENTS.PARTNER_CREATED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description: constants.MESSAGES.PARTNER_WMS.PARTNER_CREATED_SUCCESSFULLY,
    });

    await notifyUser({
      event: constants.EVENTS.PARTNER_CREATED,
      request_user: requestUser,
    });

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PARTNER_WMS.PARTNER_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Update existing Partner/Broker
export const updatePartner = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = partnerSchema(req.body);
    if (error) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

    const { broker_code } = req.body;

    const existingPartner = await PartnerService.findByCode(broker_code);
    if (!existingPartner) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PARTNER_WMS.PARTNER_DOES_NOT_EXISTS,
      });
    }

    const updated = await PartnerService.updateBroker(broker_code, {
      ...req.body,
      updated_by: requestUser.loginid,
    });

    if (!updated) {
      return res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating Partner",
      });
    }

    // Optional: log + notify
    await createLog({
      event: constants.EVENTS.PARTNER_EDITED,
      request_user: requestUser,
      module: constants.MODULE.WMS,
      description: constants.MESSAGES.PARTNER_WMS.PARTNER_UPDATED_SUCCESSFULLY,
    });

    await notifyUser({
      event: constants.EVENTS.PARTNER_EDITED,
      request_user: requestUser,
    });

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PARTNER_WMS.PARTNER_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete multiple Partners/Brokers
export const deletePartners = async (req: RequestWithUser, res: Response) => {
  try {
    const brokerCodes: string[] = req.body;

    if (!Array.isArray(brokerCodes) || !brokerCodes.length) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PARTNER_WMS.SELECT_AT_LEAST_ONE_PARTNER,
      });
    }

    let deletedCount = 0;

    for (const code of brokerCodes) {
      const exists = await PartnerService.findByCode(code);
      if (exists) {
        const deleted = await PartnerService.deleteBroker(code);
        if (deleted) deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PARTNER_WMS.PARTNER_DOES_NOT_EXISTS,
      });
    }

    return res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PARTNER_WMS.PARTNER_DELETED_SUCCESSFULLY,
      deletedCount,
    });
  } catch (error: any) {
    return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
