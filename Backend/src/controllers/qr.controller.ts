import { Request, Response } from "express";
import QRValidationService from "../services/qrValidation.service";
import constants from "../helpers/constants";

export const getQRStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testResult = await QRValidationService.testQRConnection();

    res.status(
      testResult.success
        ? constants.STATUS_CODES.OK
        : constants.STATUS_CODES.INTERNAL_SERVER_ERROR
    ).json({
      success: testResult.success,
      message: testResult.message,
    });
  } catch (error) {
    console.error("❌ QR Status Error:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Error checking QR connection: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
};
export const validateQRWithParameters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { encryptedKey } = req.query;

    console.log("🔐 QR Validation with Parameters Request");
    console.log("Query Parameters:", req.query);

    if (!encryptedKey || typeof encryptedKey !== "string") {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        isValid: false,
        message: "Missing or invalid encryptedKey parameter",
      });
      return;
    }

    // Validate QR code
    const validationResult =
      await QRValidationService.validateQRByEncryptedKey(encryptedKey);

    res.status(constants.STATUS_CODES.OK).json(validationResult);
  } catch (error) {
    console.error("❌ QR Validation Error:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      isValid: false,
      message: `Server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
};
