import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { IAlert } from "../../interfaces/wms/gm_wms.interface";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";
import { AlertService } from "../../services/WMS/alert.service";
import { alertSchema } from "../../validation/wms/gm.validation"; 

export const createAlert = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = alertSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { op_code, company_code, op_type } = req.body;

    const alert = await AlertService.findByOpCodeTypeAndCompany(
      Number(op_code),
      op_type,
      company_code
    );

    if (alert) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ALERT.ALERT_ALREADY_EXISTS,
      });
      return;
    }

    const createAlertData = {
      companyCode: requestUser.company_code,
      opCode: Number(req.body.op_code),
      opType: req.body.op_type,
      opDesc: req.body.op_desc,
      opSequence: req.body.op_sequence,
      instruction: req.body.instruction,
      opMode: req.body.op_mode,
      opModule: req.body.op_module,
      createdBy: requestUser.loginid,
      updatedBy: requestUser.loginid
    };

    const createdAlert = await AlertService.createAlert(createAlertData);

    if (!createdAlert) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating alert" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ALERT.ALERT_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const updateAlert = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    console.log("Raw params:", req.params);
    console.log("Raw body:", req.body);

    // Get the original identifiers from URL params and convert to proper types
    const original_op_code = Number(req.params.op_code);
    const original_op_type = String(req.params.op_type).trim();
    const company_code = String(req.body.company_code).trim();

    console.log("Looking for alert with:", { 
      op_code: original_op_code, 
      op_type: original_op_type, 
      company_code,
      types: {
        op_code: typeof original_op_code,
        op_type: typeof original_op_type,
        company_code: typeof company_code
      }
    });

    // Validate that op_code is a valid number
    if (isNaN(original_op_code)) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Invalid op_code parameter",
      });
      return;
    }

    // Find the alert using the ORIGINAL values from params
    const alert = await AlertService.findByOpCodeTypeAndCompany(
      original_op_code,
      original_op_type,
      company_code
    );

    if (!alert) {
      console.log("Alert not found with params:", { original_op_code, original_op_type, company_code });
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ALERT.ALERT_DOES_NOT_EXIST,
      });
      return;
    }

    console.log("Alert found:", alert);

    const { error } = alertSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Convert body values to proper types - ALWAYS convert op_code to number
    const new_op_code = Number(req.body.op_code);
    const new_op_type = String(req.body.op_type).trim();

    // Check if op_code or op_type is being changed
    const isChangingIdentifiers = 
      (new_op_code !== original_op_code) ||
      (new_op_type !== original_op_type);

    console.log("Is changing identifiers?", isChangingIdentifiers, {
      new_op_code,
      original_op_code,
      new_op_type,
      original_op_type
    });

    if (isChangingIdentifiers) {
      const existingAlert = await AlertService.findByOpCodeTypeAndCompany(
        new_op_code,
        new_op_type,
        company_code
      );

      if (existingAlert) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: constants.MESSAGES.ALERT.ALERT_ALREADY_EXISTS,
        });
        return;
      }
    }

    const updateData = {
      opCode: new_op_code,
      opType: new_op_type,
      opDesc: req.body.op_desc,
      opSequence: Number(req.body.op_sequence),
      instruction: req.body.instruction,
      opMode: req.body.op_mode,
      opModule: req.body.op_module
    };

    console.log("Calling updateAlert with:", {
      company_code,
      original_op_type,
      original_op_code,
      updateData
    });

    const updated = await AlertService.updateAlert(
      company_code,
      original_op_type,
      original_op_code,
      updateData
    );

    if (!updated) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating alert" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ALERT.ALERT_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    console.error("Update alert error:", error);
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const createBulkAlerts = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = alertSchema(req.body, requestUser.company_code, true);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const promises = req.body.map(async (alert: IAlert) => {
      const alertData = {
        companyCode: alert.company_code,
        opCode: Number(alert.op_code),
        opType: alert.op_type,
        opDesc: alert.op_desc,
        opSequence: Number(alert.op_sequence),
        instruction: alert.instruction,
        opMode: alert.op_mode ?? undefined,
        opModule: alert.op_module ?? undefined,
        createdBy: requestUser.loginid,
        updatedBy: requestUser.loginid
      };
      
      // Try to create the alert, ignoring if it already exists
      try {
        await AlertService.createAlert(alertData);
      } catch (err) {
        // Ignore duplicate errors
        console.log(`Skipped duplicate alert: ${alertData.opCode} - ${alertData.opType}`);
      }
    });
    
    await Promise.all(promises);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Alert " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const exportAlert = async (req: RequestWithUser, res: Response) => {
  try {
    const { data: fetchedData } = await AlertService.getAlerts(
      { companyCode: req.user.company_code },
      1,
      Number.MAX_SAFE_INTEGER
    );

    const csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.MASTER.ALERT,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="alert.csv"`);

    fetchedData.forEach((eachData: any) => {
      csvTransform.write({
        op_code: eachData.opCode,
        op_type: eachData.opType,
        op_desc: eachData.opDesc,
        op_sequence: eachData.opSequence,
        instruction: eachData.instruction,
        op_mode: eachData.opMode,
        op_module: eachData.opModule,
        company_code: eachData.companyCode,
        created_by: eachData.createdBy,
        updated_by: eachData.updatedBy,
        created_at: eachData.createdAt,
        updated_at: eachData.updatedAt
      });
    });

    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAlerts = async (req: RequestWithUser, res: Response) => {
  try {
    const alertCodes = req.body;

    if (!alertCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ALERT.SELECT_AT_LEAST_ONE_ALERT,
      });
      return;
    }

    const criteria = alertCodes.map((code: any) => ({
      companyCode: req.user.company_code,
      opType: code.op_type, // Assuming the request body includes the op_type
      opCode: code.op_code
    }));

    const deleteSuccess = await AlertService.deleteAlerts(criteria);

    if (!deleteSuccess) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ALERT.ALERT_DELETED_FAILED,
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ALERT.ALERT_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
