/**
 * @file Activity WMS Controller
 * @description Handles activity billing operations including create, update, copy and delete
 */

import { Response } from "express";
import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import ActivityBilling from "../../models/wms/activity_billing.model";
import {
  activityBillingSchema,
  callProcedureSchema,
} from "../../validation/wms/gm.validation";

/**
 * Creates new activity billing data for a company and principal
 * @param req Request object containing principal code and billing details
 * @param res Response object
 */
export const createActivityBillingDataByCompanyAndPrincipal = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { principalCode } = req.params;
    const requestUser = req.user;
    // Validate request body
    const { error } = activityBillingSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { bill_amount, jobtype, cost, uoc, moc1, moc2, act_code } = req.body;
    const companyCode = req.user.company_code;
    // Create a new record in the activity_billing table
    const newActivityBilling = await ActivityBilling.create({
      company_code: companyCode,
      prin_code: principalCode,
      bill_amount: bill_amount,
      jobtype: jobtype,
      cost: cost,
      uoc: uoc,
      moc1: moc1,
      moc2: moc2,
      act_code: act_code,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
    });

    res.status(201).json({
      success: true,
      message: "Activity billing data created successfully",
      data: newActivityBilling,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating activity billing data",
      error: error.message,
    });
  }
};

/**
 * Updates existing activity billing data
 * @param req Request object containing principal code, activity code and updated billing details
 * @param res Response object
 */
export const updateActivityBillingDataByCompanyAndPrincipal = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { principalCode, activityCode } = req.params;
    const requestUser = req.user;
    // Validate request body
    const { error } = activityBillingSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { bill_amount, jobtype, cost, uoc, moc1, moc2, act_code } = req.body;

    // Find and update the record in the activity_billing table
    const updatedActivityBilling = await ActivityBilling.update(
      {
        bill_amount,
        jobtype,
        cost,
        uoc,
        moc1,
        moc2,
        act_code,
        updated_by: requestUser.loginid,
      },
      {
        where: {
          [Op.and]: [{ prin_code: principalCode }, { act_code: activityCode }],
        },
      }
    );
    if (!!updatedActivityBilling) {
      res.status(200).send({
        success: true,
        message: "Activity Billing updated successfully",
        data: updatedActivityBilling,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Error updating activity billing data",
      error: err.message,
    });
  }
};

/**
 * Copies billing activity from one principal to another using stored procedure
 * @param req Request object containing source and target principal codes
 * @param res Response object
 */
export const copyBillingActivity = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    // Validate request body
    const { error } = callProcedureSchema(req.body);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { from, to } = req.body;
    // Execute stored procedure to copy billing activity
    const result = await sequelize.query(
      `CALL SP_WM_COPY_BILLING_ACTVY(:vs_comp_code, :vs_prin_from, :vs_prin_to, :vs_user)`,
      {
        replacements: {
          vs_comp_code: requestUser.company_code,
          vs_prin_from: from,
          vs_prin_to: to,
          vs_user: requestUser.loginid,
        },
        type: QueryTypes.RAW,
      }
    );
    res.status(200).json({
      success: true,
      message: "Billing activity copied successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error copying billing activity",
      error: error.message,
    });
  }
};

/**
 * Deletes multiple billing activities in a transaction
 * @param req Request object containing array of activities to delete
 * @param res Response object
 */
export const deleteBillingActivities = async (
  req: RequestWithUser,
  res: Response
): Promise<any> => {
  try {
    const { activities } = req.body;
    const requestUser = req.user;

    // Validate activities array
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one activity to delete",
      });
    }
    // Delete multiple activities in parallel using Promise.all
    const deleteResults = await Promise.all(
      activities.map(async (activity) => {
        const { prin_code, act_code, uoc, moc1, moc2, jobtype } = activity;
        await sequelize.transaction(async (t) => {
          // Update record before deletion to track who deleted it
          await ActivityBilling.update(
            {
              updated_by: requestUser.loginid,
            },
            {
              where: {
                prin_code,
                act_code,
                company_code: requestUser.company_code,
                uoc,
                moc1,
                moc2,
                jobtype,
              },
              transaction: t,
            }
          );
          // Delete the record
          return await ActivityBilling.destroy({
            where: {
              prin_code,
              act_code,
              company_code: requestUser.company_code,
              uoc,
              moc1,
              moc2,
              jobtype,
            },
            transaction: t,
          });
        });
      })
    );

    return res.status(200).json({
      success: true,
      message: "Activities deleted successfully",
      data: deleteResults,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting activities",
      error: err.message,
    });
  }
};
