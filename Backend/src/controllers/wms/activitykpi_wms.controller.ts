import { Response } from "express";
import * as fastCsv from "fast-csv";
import constants from "../../helpers/constants";
import { RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { IActivityKPI } from "../../interfaces/wms/activity_wms.interface"; 
import { activityKpiSchema } from "../../validation/wms/gm.validation";
import WmsCsvHeaders from "../../utils/exportCsv/WmsCsvHeaders";
import { ActivityKpiService } from "../../services/WMS/activitykpi.service";
import { ActivityKpi } from "../../entity/WMS/activitykpi.entity";

export const createActivityKPI = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activityKpiSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    const { prin_code, company_code, job_type, act_code } = req.body;

    const activityKpi = await ActivityKpiService.findByCompositeKey(
      company_code,
      prin_code,
      job_type,
      act_code
    );

    if (activityKpi) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ACTIVITY_KPI_WMS.KPI_ALREADY_EXISTS,
      });
      return;
    }

    const createActivityKPI = await ActivityKpiService.createActivityKpi({
      companyCode: company_code,
      prinCode: prin_code,
      jobType: job_type,
      actCode: act_code,
      custCode: req.body.cust_code,
      expHours: req.body.exp_hours,
      userId: requestUser.loginid
    });

    if (!createActivityKPI) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while creating KPI" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ACTIVITY_KPI_WMS.KPI_CREATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const updateActivityKPI = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activityKpiSchema(req.body, requestUser.company_code, false);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }
    
    // Get original keys from query params - frontend should pass these in URL
    // Example: PUT /activity-kpi?company_code=X&prin_code=Y&job_type=Z&act_code=A
    const originalCompanyCode = (req.query.company_code as string) || req.body.company_code;
    const originalPrinCode = (req.query.prin_code as string) || req.body.prin_code;
    const originalJobType = (req.query.job_type as string) || req.body.job_type;
    const originalActCode = (req.query.act_code as string) || req.body.act_code;
    
    const { prin_code, company_code, job_type, act_code } = req.body;

    // Find using original keys
    const activityKpi = await ActivityKpiService.findByCompositeKey(
      originalCompanyCode,
      originalPrinCode,
      originalJobType,
      originalActCode
    );

    if (!activityKpi) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ACTIVITY_KPI_WMS.KPI_DOES_NOT_EXISTS,
      });
      return;
    }

    // Check if new composite key combination already exists (when keys changed)
    const keysChanged = 
      originalCompanyCode !== company_code ||
      originalPrinCode !== prin_code ||
      originalJobType !== job_type ||
      originalActCode !== act_code;

    if (keysChanged) {
      const existingWithNewKeys = await ActivityKpiService.findByCompositeKey(
        company_code,
        prin_code,
        job_type,
        act_code
      );

      if (existingWithNewKeys) {
        res.status(constants.STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: "Activity KPI with new composite key already exists",
        });
        return;
      }
    }

    // Use the new method that handles composite key changes
    const updateSuccess = await ActivityKpiService.updateOrRecreateActivityKpi(
      originalCompanyCode,
      originalPrinCode,
      originalJobType,
      originalActCode,
      {
        companyCode: company_code,
        prinCode: prin_code,
        jobType: job_type,
        actCode: act_code,
        custCode: req.body.cust_code,
        expHours: req.body.exp_hours,
        userId: requestUser.loginid
      }
    );
    
    if (!updateSuccess) {
      res
        .status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error while updating KPI" });
      return;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ACTIVITY_KPI_WMS.KPI_UPDATED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const createBulkActivityKPI = async (req: RequestWithUser, res: Response) => {
  try {
    const requestUser: IUser = req.user;

    const { error } = activityKpiSchema(req.body, requestUser.company_code, true);
    if (error) {
      res
        .status(constants.STATUS_CODES.BAD_REQUEST)
        .json({ success: false, message: error.message });
      return;
    }

    // Process each KPI record
    const promises = req.body.map(async (kpi: any) => {
      try {
        // Check if KPI already exists
        const exists = await ActivityKpiService.checkActivityKpiExists(
          kpi.company_code,
          kpi.prin_code,
          kpi.job_type,
          kpi.act_code
        );
        
        if (!exists) {
          await ActivityKpiService.createActivityKpi({
            companyCode: kpi.company_code,
            prinCode: kpi.prin_code,
            jobType: kpi.job_type,
            actCode: kpi.act_code,
            custCode: kpi.cust_code,
            expHours: kpi.exp_hours,
            userId: requestUser.loginid
          });
        }
      } catch (err) {
        console.error("Error processing KPI record:", err);
      }
    });

    await Promise.all(promises);

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "KPI " + constants.MESSAGES.IMPORTED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

export const exportActivityKPI = async (req: RequestWithUser, res: Response) => {
  try {
    let fetchedData: any[] = [],
      csvTransform: fastCsv.CsvFormatterStream<
        fastCsv.FormatterRow,
        fastCsv.FormatterRow
      >;

    const { data } = await ActivityKpiService.getActivityKpis(
      { companyCode: req.user.company_code },
      1,  // Page
      9999 // Limit - large number to get all records
    );
    
    // Transform data to match expected format
    fetchedData = data.map(kpi => ({
      company_code: kpi.companyCode,
      prin_code: kpi.prinCode,
      job_type: kpi.jobType,
      act_code: kpi.actCode,
      cust_code: kpi.custCode,
      exp_hours: kpi.expHours,
      // user_dt: kpi.userDt,
      user_id: kpi.userId
    }));

    csvTransform = fastCsv.format({
      headers: WmsCsvHeaders.MASTER.ACTIVITY_KPI,
    });

    // Set headers for CSV response before streaming
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="activity_kpi.csv"`);

    // Write data to the CSV stream
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

export const deleteActivityKPI = async (req: RequestWithUser, res: Response) => {
  try {
    const princCodes = req.body;

    if (!req.body.length) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: constants.MESSAGES.ACTIVITY_KPI_WMS.SELECT_AT_LEAST_ONE_KPI,
      });
      return;
    }
    
    // Delete KPIs with matching prin_code
    const deletionSuccess = await ActivityKpiService.deleteActivityKpis({
      prinCode: princCodes
    });
    
    if (!deletionSuccess) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "No records deleted",
      });
      return;
    }
    
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: constants.MESSAGES.ACTIVITY_KPI_WMS.KPI_DELETED_SUCCESSFULLY,
    });
    return;
  } catch (error: any) {
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};
