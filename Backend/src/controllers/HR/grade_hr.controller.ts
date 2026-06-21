import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IHrGrade } from "../../interfaces/Hr/hr_grade";
import { IUser } from "../../interfaces/user.interface";
import { AppDataSource } from "../../database/connection";
import HrCsvHeaders from "../../utils/exportCsv/HrCsvHeaders";
import { gradeSchema } from "../../validation/HR/hrgrade.validation";
import { In } from "typeorm";
import { HrGrade } from "../../models/Hr/hr_grade";

export const createGrade = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = gradeSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { grade_code, company_code } = req.body;
    const gradeRepository = AppDataSource.getRepository(HrGrade);

    const grade = await gradeRepository.findOne({
      where: {
        company_code: company_code,
        grade_code: grade_code,
      },
    });

    if (grade) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.GRADE_HR.GRADE_ALREADY_EXISTS,
      });
      return;
    }

    const newGrade = gradeRepository.create({
      ...req.body,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    const savedGrade = await gradeRepository.save(newGrade);

    if (!savedGrade) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating grade" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.GRADE_HR.GRADE_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const updateGrade = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = gradeSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { grade_code, company_code } = req.body;
    const gradeRepository = AppDataSource.getRepository(HrGrade);

    const grade = await gradeRepository.findOne({
      where: {
        company_code: company_code,
        grade_code: grade_code,
      },
    });

    if (!grade) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.GRADE_HR.GRADE_DOES_NOT_EXISTS,
      });
      return;
    }

    const updateResult = await gradeRepository.update(
      {
        company_code: company_code,
        grade_code: grade_code,
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
      }
    );

    if (updateResult.affected === 0) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating grade" });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.GRADE_HR.GRADE_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const createBulkGrades = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = gradeSchema(req.body, requestUser.company_code, true);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const gradeRepository = AppDataSource.getRepository(HrGrade);
    
    const gradesWithUser = req.body.map((grade: IHrGrade) => ({
      ...grade,
      updated_by: requestUser.loginid,
      created_by: requestUser.loginid,
    }));

    // Using insert with conflict handling (similar to ignoreDuplicates)
    await gradeRepository
      .createQueryBuilder()
      .insert()
      .into(HrGrade)
      .values(gradesWithUser)
      .orIgnore() // This handles the ignoreDuplicates behavior
      .execute();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Grade " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const exportGrade = async (req: RequestWithUser, res: Response) => {
  try {
    const gradeRepository = AppDataSource.getRepository(HrGrade);
    
    let fetchedData: any[] = [];
    let csvTransform: fastCsv.CsvFormatterStream<
      fastCsv.FormatterRow,
      fastCsv.FormatterRow
    >;

    fetchedData = await gradeRepository.find({
      where: { company_code: req.user.company_code },
    });

    csvTransform = fastCsv.format({
      headers: HrCsvHeaders.MASTERS.GRADE,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="grade.csv"`);

    // Write data to the CSV stream
    fetchedData.forEach((eachData) => {
      // TypeORM entities are already plain objects, no need for get({ plain: true })
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

export const deleteGrades = async (req: RequestWithUser, res: Response) => {
  try {
    const gradesCode = req.body;
    const gradeRepository = AppDataSource.getRepository(HrGrade);

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.GRADE_HR.SELECT_AT_LEAST_ONE_GRADE,
      });
      return;
    }

    const deleteResult = await gradeRepository.delete({
      grade_code: In(gradesCode),
    });

    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No grades found to delete",
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.GRADE_HR.GRADE_DELETED_SUCCESSFULLY,
    });
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};