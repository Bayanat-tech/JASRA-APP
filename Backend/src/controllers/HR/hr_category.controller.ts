// Import required modules and interfaces
import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { TypeORMService } from "../../database/connection";// Assuming you have this entity
import { hrCategorySchema } from "../../validation/HR/hrCategorySchema.validation";
import { In } from "typeorm";
import { Categorymaster } from "../../models/Hr/hr_category";

/**
 * Create a new HR Category
 * @param {RequestWithUser} req - The incoming request with user information
 * @param {Response} res - The outgoing response
 */
export const createhrcategory = async (req: RequestWithUser, res: Response) => {
  try {
    // Get the user information from the request
    const requestUser: IUser = req.user;

    // Validate the request body using the hrCategorySchema
    const { error } = hrCategorySchema(req.body);
    if (error) {
      // Return a bad request response if the validation fails
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Extract the company code and category code from the request body
    const { company_code, category_code } = req.body;

    // Get TypeORM repository
    const categoryRepo = TypeORMService.getRepository(Categorymaster);

    // Check if a category with the same company code and category code already exists
    const existingCategory = await categoryRepo.findOne({
      where: {
        company_code: company_code,
        category_code: category_code
      }
    });

    // Return a bad request response if the category already exists
    if (existingCategory) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_ALREADY_EXISTS,
      });
      return;
    }

    // Create a new HR Category
    const newHRCategory = categoryRepo.create({
      company_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
      ...req.body,
    });

    await categoryRepo.save(newHRCategory);

    // Return a successful response with a message
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_CREATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    console.error("Error creating HR category:", error);
    // Return a bad request response with the error message
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

/**
 * Update an existing HR Category
 * @param {RequestWithUser} req - The incoming request with user information
 * @param {Response} res - The outgoing response
 */
export const updatehrcategory = async (req: RequestWithUser, res: Response) => {
  try {
    // Get the user information from the request
    const requestUser: IUser = req.user;

    // Validate the request body using the hrCategorySchema
    const { error } = hrCategorySchema(req.body);
    if (error) {
      // Return a bad request response if the validation fails
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Extract the category code and company code from the request body
    const { category_code, company_code } = req.body;

    // Get TypeORM repository
    const categoryRepo = TypeORMService.getRepository(Categorymaster);

    // Find the existing category
    const existingCategory = await categoryRepo.findOne({
      where: {
        company_code: company_code,
        category_code: category_code
      }
    });

    // Return a bad request response if the category does not exist
    if (!existingCategory) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_DOES_NOT_EXIST,
      });
      return;
    }

    // Update the existing category
    await categoryRepo.update(
      {
        company_code: company_code,
        category_code: category_code
      },
      {
        ...req.body,
        updated_by: requestUser.loginid,
        updated_at: new Date()
      }
    );

    // Log the updated category for debugging purposes
    console.log("Category updated successfully:", { company_code, category_code });

    // Return a successful response with a message
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_UPDATED_SUCCESSFULLY,
    });
  } catch (error: any) {
    console.error("Error updating HR category:", error);
    // Return a bad request response with the error message
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

/**
 * Delete one or more HR Categories
 * @param {RequestWithUser} req - The incoming request with user information
 * @param {Response} res - The outgoing response
 */
export const deleteHRCategories = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Get the category codes from the request body
    const categoryCodes = req.body;

    // Return a bad request response if no category codes are provided
    if (!categoryCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.HR_CATEGORY.SELECT_AT_LEAST_ONE_CATEGORY,
      });
      return;
    }

    // Get TypeORM repository
    const categoryRepo = TypeORMService.getRepository(Categorymaster);

    // Delete the categories using In operator
    const deleteResult = await categoryRepo.delete({
      category_code: In(categoryCodes)
    });

    // Return a bad request response if no categories are deleted
    if (deleteResult.affected === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No HR Categories found to delete",
      });
      return;
    }

    // Return a successful response with a message
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.HR_CATEGORY.HR_CATEGORY_DELETED_SUCCESSFULLY,
      data: {
        deletedCount: deleteResult.affected
      }
    });
  } catch (error: any) {
    console.error("Error deleting HR categories:", error);
    // Return a bad request response with the error message
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};