import { Response } from "express";
import { TaAdjDetailService } from "../../services/WMS/taAdjDetail.service";
import { TaAdjHeaderService } from "../../services/WMS/taAdjHeader.service";
import { ICreateStockAdjustmentRequest, IProcessAdjustmentRequest } from "../../interfaces/wms/stockAdjustment.interface";
import { RequestWithUser } from "../../interfaces/common.interface";
import constants from "../../helpers/constants";

export const createStockAdjustment = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { 
      // Header fields
      ADJ_CODE,
      PRIN_CODE,
      REMARKS,
      CONFIRMED,
      ADJ_DATE,
      CONFIRMED_DATE,
      
      // Detail fields
      JOB_NO, 
      PROD_CODE, 
      ADJ_TYPE,
      QTY_PUOM, 
      SITE_CODE,
      LOCATION_CODE,
      QTY_LUOM, 
      P_UOM,
      L_UOM,
      PALLET_ID,
      KEY_NUMBER
    }: ICreateStockAdjustmentRequest = req.body;

    // Validate required fields
    if (!ADJ_CODE) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "ADJ_CODE is required",
      });
      return;
    }

    if (!JOB_NO) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "JOB_NO is required",
      });
      return;
    }

    // Get user info from request
    const requestUser = req.user;
    const COMPANY_CODE = requestUser.company_code;
    const username = requestUser.loginid;

    // Create stock adjustment header (ADJ_NO will be auto-generated in service)
    const newHeader = await TaAdjHeaderService.createHeader({
      ADJ_CODE,
      PRIN_CODE,
      REMARKS,
      CONFIRMED: CONFIRMED || "N",
      ADJ_DATE,
      CONFIRMED_DATE,
      COMPANY_CODE,
      CREATED_BY: username,
      UPDATED_BY: username,
    });

    // Get the generated ADJ_NO from the saved header
    const ADJ_NO = newHeader.ADJ_NO;

    // Create stock adjustment detail with the ADJ_NO from header
    const newDetail = await TaAdjDetailService.createAdjustment({
      ADJ_NO,
      ADJ_SERIALNO: 1, // Hardcoded value
      JOB_NO,
      PROD_CODE,
      ADJ_TYPE,
      QTY_PUOM,
      SITE_CODE,
      LOCATION_CODE,
      QTY_LUOM,
      PRIN_CODE,
      P_UOM,
      L_UOM,
      PALLET_ID,
      KEY_NUMBER: KEY_NUMBER || "0",
      COMPANY_CODE,
      CREATED_BY: username,
      UPDATED_BY: username,
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Stock adjustment created successfully",
      data: {
        header: newHeader,
        detail: newDetail,
      },
    });
  } catch (error: any) {
    console.error("Error creating stock adjustment:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create stock adjustment",
      error: error.message,
    });
  }
};

export const updateStockAdjustment = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { ADJ_CODE } = req.params;
    const { 
      // Header fields
      PRIN_CODE,
      REMARKS,
      CONFIRMED,
      ADJ_DATE,
      CONFIRMED_DATE,
      
      // Detail fields
      JOB_NO,
      PROD_CODE, 
      ADJ_TYPE,
      QTY_PUOM, 
      SITE_CODE,
      LOCATION_CODE,
      QTY_LUOM, 
      P_UOM,
      L_UOM,
      PALLET_ID,
      KEY_NUMBER
    }: ICreateStockAdjustmentRequest = req.body;

    if (!ADJ_CODE) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "ADJ_CODE is required",
      });
      return;
    }

    const requestUser = req.user;
    const COMPANY_CODE = requestUser.company_code;
    const username = requestUser.loginid;

    // Check if adjustment header exists
    const existingHeader = await TaAdjHeaderService.findByAdjCode(
      ADJ_CODE,
      COMPANY_CODE
    );

    if (!existingHeader) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Stock adjustment header not found",
      });
      return;
    }

    // Update stock adjustment header
    const headerUpdated = await TaAdjHeaderService.updateHeader(
      ADJ_CODE,
      COMPANY_CODE,
      {
        PRIN_CODE,
        REMARKS,
        CONFIRMED,
        ADJ_DATE,
        CONFIRMED_DATE,
        USER_ID: username,
      }
    );

    // Update stock adjustment detail if JOB_NO is provided
    let detailUpdated = true;
    if (JOB_NO) {
      detailUpdated = await TaAdjDetailService.updateAdjustment(
        JOB_NO,
        COMPANY_CODE,
        {
          PROD_CODE,
          ADJ_TYPE,
          QTY_PUOM,
          SITE_CODE,
          LOCATION_CODE,
          QTY_LUOM,
          PRIN_CODE,
          P_UOM,
          L_UOM,
          PALLET_ID,
          KEY_NUMBER,
          USER_ID: username,
        }
      );
    }

    if (headerUpdated && detailUpdated) {
      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: "Stock adjustment updated successfully",
      });
    } else {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to update stock adjustment",
      });
    }
  } catch (error: any) {
    console.error("Error updating stock adjustment:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update stock adjustment",
      error: error.message,
    });
  }
};

export const getStockAdjustments = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser = req.user;
    const COMPANY_CODE = requestUser.company_code;

    const headers = await TaAdjHeaderService.findByCompany(COMPANY_CODE);
    const details = await TaAdjDetailService.findByCompany(COMPANY_CODE);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        headers,
        details,
      },
      totalCount: headers.length,
    });
  } catch (error: any) {
    console.error("Error fetching stock adjustments:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch stock adjustments",
      error: error.message,
    });
  }
};

export const getStockAdjustmentByAdjCode = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { ADJ_CODE } = req.params;
    const requestUser = req.user;
    const COMPANY_CODE = requestUser.company_code;

    if (!ADJ_CODE) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "ADJ_CODE is required",
      });
      return;
    }

    const header = await TaAdjHeaderService.findByAdjCode(ADJ_CODE, COMPANY_CODE);

    if (!header) {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Stock adjustment not found",
      });
      return;
    }

    // Fetch all details for this company (can be filtered by PRIN_CODE if needed)
    const details = await TaAdjDetailService.findByCompany(COMPANY_CODE);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: {
        header,
        details,
      },
    });
  } catch (error: any) {
    console.error("Error fetching stock adjustment:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch stock adjustment",
      error: error.message,
    });
  }
};

export const deleteStockAdjustment = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { ADJ_CODE } = req.params;
    const requestUser = req.user;
    const COMPANY_CODE = requestUser.company_code;

    if (!ADJ_CODE) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "ADJ_CODE is required",
      });
      return;
    }

    // Delete header and detail (you may want to add cascade delete or handle detail deletion separately)
    const headerDeleted = await TaAdjHeaderService.deleteHeader(ADJ_CODE, COMPANY_CODE);

    if (headerDeleted) {
      res.status(constants.STATUS_CODES.OK).json({
        success: true,
        message: "Stock adjustment deleted successfully",
      });
    } else {
      res.status(constants.STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: "Stock adjustment not found",
      });
    }
  } catch (error: any) {
    console.error("Error deleting stock adjustment:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete stock adjustment",
      error: error.message,
    });
  }
};

export const processAdjustment = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { COMPANY_CODE, PRIN_CODE, ADJ_NO, USERID }: IProcessAdjustmentRequest = req.body;

    // Validate required fields
    if (!COMPANY_CODE) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "COMPANY_CODE is required",
      });
      return;
    }

    if (!PRIN_CODE) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "PRIN_CODE is required",
      });
      return;
    }

    if (!ADJ_NO) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "ADJ_NO is required",
      });
      return;
    }

    if (!USERID) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "USERID is required",
      });
      return;
    }

    console.log('Processing adjustment with data:', {
      COMPANY_CODE,
      PRIN_CODE,
      ADJ_NO,
      USERID,
    });

    // Call the stored procedure
    await TaAdjDetailService.processAdjustment({
      COMPANY_CODE,
      PRIN_CODE,
      ADJ_NO,
      USERID,
    });

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Stock adjustment processed successfully",
    });
  } catch (error: any) {
    console.error("Error processing stock adjustment:", error);
    console.error("Error stack:", error.stack);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to process stock adjustment",
      error: error.message,
      details: error.stack,
    });
  }
};
