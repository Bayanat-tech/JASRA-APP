import { Response } from "express";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { hrLeavetypeSchema } from "../../validation/HR/hrLeavetypeSchema.validation";
import { TypeORMService } from "../../database/connection";
import { Leavetype } from "../../models/Hr/hr_leavetype";
import { In } from "typeorm";

 // Assuming you have this entity

export const createhrleavetype = async (req: RequestWithUser, res: Response) => {
    try {
        const requestUser: IUser = req.user;

        const { error } = hrLeavetypeSchema(req.body);
        if (error) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
            return;
        }

        const { company_code, leave_type } = req.body;

        // Get TypeORM repository
        const leavetypeRepo = TypeORMService.getRepository(Leavetype);

        // Check if leave type already exists
        const existingLeavetype = await leavetypeRepo.findOne({
            where: {
                // company_code, // Uncomment if you want to include company_code in check
                leave_type: leave_type
            }
        });

        if (existingLeavetype) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: constants.MESSAGES.HR_LEAVETYPE.HR_LEAVETYPE_ALREADY_EXISTS,
            });
            return;
        }

        // Create new leave type
        const newHRLeavetype = leavetypeRepo.create({
            company_code,
            created_by: requestUser.loginid,
            updated_by: requestUser.loginid,
            ...req.body,
        });

        await leavetypeRepo.save(newHRLeavetype);

        res.status(constants.STATUS_CODES.OK).json({
            success: true,
            message: constants.MESSAGES.HR_LEAVETYPE.HR_LEAVETYPE_CREATED_SUCCESSFULLY,
        });
    } catch (error: any) {
        console.error("Error creating HR leave type:", error);
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const updatehrleavetype = async (req: RequestWithUser, res: Response) => {
    try {
        const requestUser: IUser = req.user;
        console.log("Update HR Leave");

        const { error } = hrLeavetypeSchema(req.body);
        if (error) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
            return;
        }

        const { leave_type, company_code } = req.body;

        // Get TypeORM repository
        const leavetypeRepo = TypeORMService.getRepository(Leavetype);

        // Find existing leave type
        const existingLeavetype = await leavetypeRepo.findOne({
            where: {
                company_code: company_code,
                leave_type: leave_type
            }
        });

        if (!existingLeavetype) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: constants.MESSAGES.HR_LEAVETYPE.HR_LEAVETYPE_DOES_NOT_EXIST,
            });
            return;
        }

        // Update the leave type
        await leavetypeRepo.update(
            { 
                company_code: company_code, 
                leave_type: leave_type 
            },
            {
                ...req.body,
                updated_by: requestUser.loginid,
                updated_at: new Date() // Add updated timestamp
            }
        );

        res.status(constants.STATUS_CODES.OK).json({
            success: true,
            message: constants.MESSAGES.HR_LEAVETYPE.HR_LEAVETYPE_UPDATED_SUCCESSFULLY,
        });
    } catch (error: any) {
        console.error("Error updating HR leave type:", error);
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export const deleteHRLeavetype = async (req: RequestWithUser, res: Response) => {
    try {
        const { leavetype } = req.body;

        if (!leavetype || !Array.isArray(leavetype) || leavetype.length === 0) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: constants.MESSAGES.HR_LEAVETYPE.SELECT_AT_LEAST_ONE_LEAVETYPE,
            });
            return;
        }

        // Get TypeORM repository
        const leavetypeRepo = TypeORMService.getRepository(Leavetype);

        // Delete leave types using In operator
        const deleteResult = await leavetypeRepo.delete({
            leave_type: In(leavetype)
        });

        if (deleteResult.affected === 0) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "No HR Leave Types found to delete",
            });
            return;
        }

        res.status(constants.STATUS_CODES.OK).json({
            success: true,
            message: constants.MESSAGES.HR_LEAVETYPE.HR_LEAVETYPE_DELETED_SUCCESSFULLY,
            data: {
                deletedCount: deleteResult.affected
            }
        });
    } catch (error: any) {
        console.error("Error deleting HR leave types:", error);
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Alternative delete implementation using raw query if needed
export const deleteHRLeavetypeAlternative = async (req: RequestWithUser, res: Response) => {
    try {
        const { leavetype } = req.body;

        if (!leavetype || !Array.isArray(leavetype) || leavetype.length === 0) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: constants.MESSAGES.HR_LEAVETYPE.SELECT_AT_LEAST_ONE_LEAVETYPE,
            });
            return;
        }

        // Using raw Oracle query for more control
        const leavetypeRepo = TypeORMService.getRepository(Leavetype);
        
        // Create placeholders for the IN clause
        const placeholders = leavetype.map((_, index) => `:${index}`).join(',');
        
        const deleteQuery = `
            DELETE FROM HR_LEAVETYPE 
            WHERE LEAVE_TYPE IN (${placeholders})
        `;

        const deleteResult = await leavetypeRepo.query(deleteQuery, leavetype);

        if (deleteResult === 0) {
            res.status(constants.STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "No HR Leave Types found to delete",
            });
            return;
        }

        res.status(constants.STATUS_CODES.OK).json({
            success: true,
            message: constants.MESSAGES.HR_LEAVETYPE.HR_LEAVETYPE_DELETED_SUCCESSFULLY,
            data: {
                deletedCount: deleteResult
            }
        });
    } catch (error: any) {
        console.error("Error deleting HR leave types:", error);
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
};