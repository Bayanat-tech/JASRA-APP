import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import constants from "../../helpers/constants";
import { IUser } from "../../interfaces/user.interface";
import { hrKpiNameSchema } from "../../validation/HR/hrKpiNameSchema.validation";
import { AppDataSource } from "../../database/connection"; // Your TypeORM datasource
import { KpiNamemaster } from "../../models/Hr/hr_kpiname";


// Create KPI Name
export const createKpiName = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = hrKpiNameSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { company_code, serial_no } = req.body;

    const kpiNameRepository = AppDataSource.getRepository(KpiNamemaster);

    // Check if KPI Name already exists
    const existingKpiName = await kpiNameRepository.findOne({
      where: {
        serial_no: serial_no,
        company_code: company_code
      },
    });

    if (existingKpiName) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.KPI_NAME.HR_SERIAL_NO_ALREADY_EXISTS,
      });
      return;
    }

    // Create new KPI Name
    const newKpiName = kpiNameRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedKpiName = await kpiNameRepository.save(newKpiName);

    if (!savedKpiName) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating KPI Name" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.KPI_NAME.HR_SERIAL_NO_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// Update KPI Name
export const updateKpiName = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = hrKpiNameSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { serial_no, company_code } = req.body;

    const kpiNameRepository = AppDataSource.getRepository(KpiNamemaster);

    // Find existing KPI Name
    const existingKpiName = await kpiNameRepository.findOne({
      where: {
        company_code: company_code,
        serial_no: serial_no,
      },
    });

    if (!existingKpiName) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.KPI_NAME.HR_SERIAL_NO_DOES_NOT_EXIST,
      });
      return;
    }

    // Update KPI Name
    const updateResult = await kpiNameRepository.update(
      { 
        company_code: company_code, 
        serial_no: serial_no 
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
      message: constants.MESSAGES.KPI_NAME.HR_KPI_NAME_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// Delete KPI Names
export const deleteKpiNames = async (req: RequestWithUser, res: Response) => {
  try {
    const kpiNames = req.body;

    if (!kpiNames.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.KPI_NAME.SELECT_AT_LEAST_ONE_SERIAL_NO,
      });
      return;
    }

    const kpiNameRepository = AppDataSource.getRepository(KpiNamemaster);

    // Delete KPI Names
    const deleteResult = await kpiNameRepository.delete({
      kpi_name: kpiNames,
    });

    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No KPI Names found to delete",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.KPI_NAME.HR_SERIAL_NO_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};