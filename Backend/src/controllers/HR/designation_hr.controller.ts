import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { IHrDesignation } from "../../interfaces/Hr/hr_designation";
import { AppDataSource } from "../../database/connection";
import { designationSchema } from "../../validation/HR/hrdesignation.validation";
import HrCsvHeaders from "../../utils/exportCsv/HrCsvHeaders";
import { In } from "typeorm";
import { HrDesignation } from "../../models/Hr/hr_designation";

export const createDesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = designationSchema(
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

    const { desg_code, company_code } = req.body;
    const designationRepository = AppDataSource.getRepository(HrDesignation);

    const designation = await designationRepository.findOne({
      where: {
        company_code: company_code,
        desg_code: desg_code,
      },
    });

    if (designation) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.DESIGNATION_WMS.DESIGNATION_ALREADY_EXISTS,
      });
      return;
    }

    const newDesignation = designationRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedDesignation = await designationRepository.save(newDesignation);

    if (!savedDesignation) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating designation" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.DESIGNATION_WMS.DESIGNATION_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const updateDesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = designationSchema(
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

    const { desg_code, company_code } = req.body;
    const designationRepository = AppDataSource.getRepository(HrDesignation);

    const designation = await designationRepository.findOne({
      where: {
        company_code: company_code,
        desg_code: desg_code,
      },
    });

    if (!designation) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.DESIGNATION_WMS.DESIGNATION_DOES_NOT_EXISTS,
      });
      return;
    }

    const updateResult = await designationRepository.update(
      {
        company_code: company_code,
        desg_code: desg_code,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating designation" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.DESIGNATION_WMS.DESIGNATION_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const createBulkDesignations = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = designationSchema(
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

    const designationRepository = AppDataSource.getRepository(HrDesignation);
    
    const designationsWithUser = req.body.map((designation: IHrDesignation) => ({
      ...designation,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    // Using insert with conflict handling (similar to ignoreDuplicates)
    await designationRepository
      .createQueryBuilder()
      .insert()
      .into(HrDesignation)
      .values(designationsWithUser)
      .orIgnore() // This handles the ignoreDuplicates behavior
      .execute();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Designation " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const exportDesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const designationRepository = AppDataSource.getRepository(HrDesignation);
    
    let fetchedData: any[] = [];
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    fetchedData = await designationRepository.find({
      where: { company_code: req.user.company_code },
    });

    csvTransform = fastCsv.format({
      headers: HrCsvHeaders.MASTERS.DESIGNATION,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="designation.csv"`
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

export const deleteDesignation = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const designationsCode = req.body;
    const designationRepository = AppDataSource.getRepository(HrDesignation);

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message:
          constants.MESSAGES.DESIGNATION_WMS.SELECT_AT_LEAST_ONE_DESIGNATION,
      });
      return;
    }

    const deleteResult = await designationRepository.delete({
      desg_code: In(designationsCode),
    });

    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No designations found to delete",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message:
        constants.MESSAGES.DESIGNATION_WMS.DESIGNATION_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};