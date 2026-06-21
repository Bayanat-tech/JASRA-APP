import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { IHrSection } from "../../interfaces/Hr/hr_section"; 
import { AppDataSource } from "../../database/connection";
import { sectionSchema } from "../../validation/HR/hrSection_validation"; 
import HrCsvHeaders from "../../utils/exportCsv/HrCsvHeaders";
import { In } from "typeorm";
import { HrSection } from "../../models/Hr/hr_section";

export const createSection = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = sectionSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { section_code, company_code } = req.body;
    const sectionRepository = AppDataSource.getRepository(HrSection);

    const section = await sectionRepository.findOne({
      where: {
        company_code: company_code,
        section_code: section_code,
      },
    });

    if (section) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_SECTION.SECTION_ALREADY_EXISTS,
      });
      return;
    }

    const newSection = sectionRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedSection = await sectionRepository.save(newSection);

    if (!savedSection) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating section" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_SECTION.SECTION_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const updateSection = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = sectionSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { section_code, company_code } = req.body;
    const sectionRepository = AppDataSource.getRepository(HrSection);

    const section = await sectionRepository.findOne({
      where: {
        company_code: company_code,
        section_code: section_code,
      },
    });

    if (!section) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_SECTION.SECTION_DOES_NOT_EXISTS,
      });
      return;
    }

    const updateResult = await sectionRepository.update(
      {
        company_code: company_code,
        section_code: section_code,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating section" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_SECTION.SECTION_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const createBulkSections = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = sectionSchema(req.body, requestUser.company_code, true);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const sectionRepository = AppDataSource.getRepository(HrSection);
    
    const sectionsWithUser = req.body.map((section: IHrSection) => ({
      ...section,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    // Using insert with conflict handling (similar to ignoreDuplicates)
    await sectionRepository
      .createQueryBuilder()
      .insert()
      .into(HrSection)
      .values(sectionsWithUser)
      .orIgnore()
      .execute();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Section " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const exportSection = async (req: RequestWithUser, res: Response) => {
  try {
    const sectionRepository = AppDataSource.getRepository(HrSection);
    
    let fetchedData: any[] = [];
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    fetchedData = await sectionRepository.find({
      where: { company_code: req.user.company_code },
    });

    csvTransform = fastCsv.format({
      headers: HrCsvHeaders.MASTERS.SECTION,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="section.csv"`);

    // Write data to the CSV stream (TypeORM entities are already plain objects)
    fetchedData.forEach((eachData) => {
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

export const deleteSections = async (req: RequestWithUser, res: Response) => {
  try {
    const sectionsCode = req.body;
    const sectionRepository = AppDataSource.getRepository(HrSection);

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_SECTION.SELECT_AT_LEAST_ONE_SECTION,
      });
      return;
    }

    const deleteResult = await sectionRepository.delete({
      section_code: In(sectionsCode),
    });

    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No sections found to delete",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_SECTION.SECTION_DELETED_SUCCESSFULLY,
      data: {
        deletedCount: deleteResult.affected
      }
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};