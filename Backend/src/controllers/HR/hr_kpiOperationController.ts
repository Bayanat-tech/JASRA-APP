import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { hrKpiOperationSchema } from "../../validation/HR/hrKpiOperationValidation";
import { AppDataSource } from "../../database/connection";
import { OperationMaster } from "../../models/Hr/hr_operation";

export const createKpiOperation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = hrKpiOperationSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { company_code, serial_no } = req.body;

    const kpiOperationRepository = AppDataSource.getRepository(OperationMaster);

    // Check if KPI Operation already exists
    const existingKpiOperation = await kpiOperationRepository.findOne({
      where: {
        company_code: company_code,
        serial_no: serial_no,
      },
    });

    if (existingKpiOperation) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.KPI_OPERATION.HR_OPERATION_ALREADY_EXISTS,
      });
      return;
    }

    // Create new KPI Operation
    const newKpiOperation = kpiOperationRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedKpiOperation = await kpiOperationRepository.save(newKpiOperation);

    if (!savedKpiOperation) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating KPI Operation",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.KPI_OPERATION.HR_OPERATION_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// Update KPI Operation
export const updateKpiOperation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = hrKpiOperationSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { serial_no, company_code } = req.body;

    const kpiOperationRepository = AppDataSource.getRepository(OperationMaster);

    // Check if KPI Operation exists
    const existingKpiOperation = await kpiOperationRepository.findOne({
      where: {
        company_code: company_code,
        serial_no: serial_no,
      },
    });

    if (!existingKpiOperation) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.KPI_OPERATION.HR_OPERATION_DOES_NOT_EXIST,
      });
      return;
    }

    // Update KPI Operation
    const updateResult = await kpiOperationRepository.update(
      {
        company_code: company_code,
        serial_no: serial_no,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating KPI Operation",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.KPI_OPERATION.HR_KPI_OPERATION_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};