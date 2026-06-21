import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { IHrLabourDesignation } from "../../interfaces/Hr/hr_labour_designation";
import { AppDataSource } from "../../database/connection";
import { formaldesignationSchema } from "../../validation/HR/hrformaldesignation.validation";
import HrCsvHeaders from "../../utils/exportCsv/HrCsvHeaders";
import { In } from "typeorm";
import { HrLabourDesignation } from "../../models/Hr/hr_labour_designation";

export const createFormaldesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = formaldesignationSchema(
      req.body,
      requestUser.company_code,
      false
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { labour_desg_code, company_code } = req.body;
    const labourDesignationRepository = AppDataSource.getRepository(HrLabourDesignation);

    const formaldesignation = await labourDesignationRepository.findOne({
      where: {
        company_code: company_code,
        labour_desg_code: labour_desg_code,
      },
    });

    if (formaldesignation) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.FORMALDESIGNATION_HR
            .FORMALDESIGNATION_ALREADY_EXISTS,
      });
      return;
    }

    const newFormaldesignation = labourDesignationRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedFormaldesignation = await labourDesignationRepository.save(newFormaldesignation);

    if (!savedFormaldesignation) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating formal designation" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.FORMALDESIGNATION_HR
          .FORMALDESIGNATION_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const updateFormaldesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = formaldesignationSchema(
      req.body,
      requestUser.company_code,
      false
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { labour_desg_code, company_code } = req.body;
    const labourDesignationRepository = AppDataSource.getRepository(HrLabourDesignation);

    const formaldesignation = await labourDesignationRepository.findOne({
      where: {
        company_code: company_code,
        labour_desg_code: labour_desg_code,
      },
    });

    if (!formaldesignation) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.FORMALDESIGNATION_HR
            .FORMALDESIGNATION_DOES_NOT_EXISTS,
      });
      return;
    }

    const updateResult = await labourDesignationRepository.update(
      {
        company_code: company_code,
        labour_desg_code: labour_desg_code,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating formal designation" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.FORMALDESIGNATION_HR
          .FORMALDESIGNATION_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const createBulkFormaldesignations = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = formaldesignationSchema(
      req.body,
      requestUser.company_code,
      true
    );
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const labourDesignationRepository = AppDataSource.getRepository(HrLabourDesignation);
    
    const formaldesignationsWithUser = req.body.map((formaldesignation: IHrLabourDesignation) => ({
      ...formaldesignation,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    // Using insert with conflict handling (similar to ignoreDuplicates)
    await labourDesignationRepository
      .createQueryBuilder()
      .insert()
      .into(HrLabourDesignation)
      .values(formaldesignationsWithUser)
      .orIgnore()
      .execute();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Formaldesignation " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const exportFormaldesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const labourDesignationRepository = AppDataSource.getRepository(HrLabourDesignation);
    
    let fetchedData: any[] = [];
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    fetchedData = await labourDesignationRepository.find({
      where: { company_code: req.user.company_code },
    });

    csvTransform = fastCsv.format({
      headers: HrCsvHeaders.MASTERS.FORMALDESIGNATION,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Formaldesignation.csv"`
    );

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      // TypeORM entities are already plain objects
      csvTransform.write(eachData);
    });

    // End the CSV stream and pipe it to the response
    csvTransform.end();
    csvTransform.pipe(res);
  } catch (error: any) {
    console.error("Export Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteFormaldesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const formaldesignationsCode = req.body;
    const labourDesignationRepository = AppDataSource.getRepository(HrLabourDesignation);

    console.log(formaldesignationsCode);

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.FORMALDESIGNATION_HR
            .SELECT_AT_LEAST_ONE_FORMALDESIGNATION,
      });
      return;
    }

    const deleteResult = await labourDesignationRepository.delete({
      labour_desg_code: In(formaldesignationsCode),
    });

    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No formal designations found to delete",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.FORMALDESIGNATION_HR
          .FORMALDESIGNATION_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};