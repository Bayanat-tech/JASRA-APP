import { Response } from "express";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";

import constants from "../../helpers/constants";
import { projectmasterSchema } from "../../validation/Purchaseflow/Purchaseflow.validation";
import { ProjectMasterService } from "../../services/purchaseflow/projectmaster.service";

export const createprojectmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = projectmasterSchema(req.body);
    if (error) {
      res.status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const {
      project_code,
      project_name,
      company_code,
      div_code,
      prno_pre_fix,
      flag_proj_department,
      project_date_from,
      project_date_to,
      total_project_cost,
      project_type,
      facility_mgr_name,
      facility_mgr_email,
      facility_mgr_phone
    } = req.body;

    // Check Duplicate
    const existing = await ProjectMasterService.findDuplicate(
      project_code,
      company_code
    );

    if (existing) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PROJECTMASTER_PF.PROJECTMASTER_ALREADY_EXISTS
      });
      return;
    }

    // Create
    const created = await ProjectMasterService.createProject({
      project_code,
      project_name,
      company_code,
      div_code,
      prno_pre_fix,
      flag_proj_department,
      project_date_from,
      project_date_to,
      total_project_cost,
      project_type,
      facility_mgr_name,
      facility_mgr_email,
      facility_mgr_phone,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid
    });

    if (!created) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while creating project"
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PROJECTMASTER_PF.PROJECTMASTER_CREATED_SUCCESSFULLY
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const updateprojectmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = projectmasterSchema(req.body);
    if (error) {
      res.status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    const { project_code, company_code } = req.body;

    // Check existing
    const existing = await ProjectMasterService.findDuplicate(
      project_code,
      company_code
    );

    if (!existing) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PROJECTMASTER_PF.PROJECTMASTER_DOES_NOT_EXISTS
      });
      return;
    }

    // Update
    const isUpdated = await ProjectMasterService.updateProject(
      project_code,
      company_code,
      {
        ...req.body,
        updated_by: requestUser.loginid
      }
    );

    if (!isUpdated) {
      res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error while updating project"
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PROJECTMASTER_PF.PROJECTMASTER_UPDATED_SUCCESSFULLY
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

export const deleteprojectmaster = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { projectCodes, company_code } = req.body;

    if (!projectCodes || !projectCodes.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.PROJECTMASTER_PF.SELECT_AT_LEAST_ONE_PROJECTMASTER
      });
      return;
    }

    const deletedCount = await ProjectMasterService.deleteProjects(
      projectCodes,
    );

    if (deletedCount === 0) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No project deleted"
      });
      return;
    }

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.PROJECTMASTER_PF.PROJECTMASTER_DELETED_SUCCESSFULLY
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
