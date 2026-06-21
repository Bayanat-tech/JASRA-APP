import constants from "../../../helpers/constants";
import { RequestWithUser } from "../../../interfaces/common.interface";
import { IUser } from "../../../interfaces/user.interface";
import { Response } from "express";
import salesRequestmaster from "../../../models/SMS/salesRequest_sms.model";
import { sequelize } from "../../../database/connection";

export const batchCreateSalesRequest = async (
  req: RequestWithUser,
  res: Response
) => {
  const transaction = await sequelize.transaction();
  try {
    const requestUser: IUser = req.user;
    const records = req.body;
    console.log("Received records:", records);

     // mapping for weighted forecast
    const DEAL_STATUS_PERCENT: Record<string, number> = {
      Qualify: 20,
      Quoted: 40,
      Negotiation: 60,
      Won: 100,
      Lost: 0,
      Cancelled: 0,
      Delayed: 0,
    };

    const DEAL_PROBABILITY_PERCENT: Record<string, number> = {
      High: 100,
      Medium: 80,
      Low: 50,
    };
    const now = new Date();
    const processedRecords = records.map((record: any) => {


    // parse 
      const deal_size =
        parseFloat(String(record.deal_size).replace(/[^\d.]/g, "")) || 0;
        console.log("deal_size:", record.deal_size, "parse:", deal_size);

      // mapping values to get percentages
      const statusPercent = DEAL_STATUS_PERCENT[record.deal_status] ?? 0;
      const probPercent = DEAL_PROBABILITY_PERCENT[record.deal_probability] ?? 0;

      // weighted forecast Calculation
      let weightedForecast: number;
      if ((record.deal_status || "").toLowerCase() === "won") {
        weightedForecast = deal_size;
      } else {
        weightedForecast = (statusPercent / 100) * (probPercent / 100) * deal_size;
         console.log(
        statusPercent,
        probPercent,
        deal_size,
        weightedForecast,);
      }
       return {
      ...record,
      deal_date: record.deal_date ? new Date(record.deal_date) : now,
      project_closing_date: record.project_closing_date
        ? new Date(record.project_closing_date)
        : now,
      weighted_forecast: weightedForecast,
      created_by: requestUser.loginid,
      updated_by: requestUser.loginid,
      created_at: record.created_at ? record.created_at : now,
      updated_at: record.updated_at ? record.updated_at : now,
       }
    });

    const createdRecords = await salesRequestmaster.bulkCreate(
      processedRecords,
      {
        transaction,
        validate: true,
      }
    );

    await transaction.commit();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Records created successfully",
      data: createdRecords,
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error("Batch create error:", error);
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message || "Unknown error",
    });
  }
};

export const batchUpdateSalesRequest = async (
  req: RequestWithUser,
  res: Response
) => {
  const transaction = await sequelize.transaction();
  try {
    const requestUser: IUser = req.user;
    let updates = req.body;
    const now = new Date();

    // Ensure updates is always an array
    if (!Array.isArray(updates)) {
      updates = [updates];
    }

    // Only check for sr_no in each update
    const missingSrNo = updates.filter((update: any) => !update.sr_no);
    if (missingSrNo.length > 0) {
      await transaction.rollback();
      return res.status(constants.STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Each update must include sr_no",
        errors: missingSrNo.map((u: any, idx: number) => ({
          index: idx,
          error: "Missing sr_no",
        })),
      });
    }

    //Mapping for weighted forecast
    const DEAL_STATUS_PERCENT:Record<string,  number> = {
      Qualify: 20,
      Quoted: 40,
      Negotiation: 60,
      Won: 100,
      Lost: 0,
      Cancelled: 0,
      Delayed: 0,
    }
    const DEAL_PROBABILITY_PERCENT:Record<string, number> = {
      High: 100,
      Medium: 80,
      Low: 50
    }

    const updatePromises = updates.map(async (update: any) => {
      // First check if record exists
      const existingRecord = await salesRequestmaster.findOne({
        where: { sr_no: update.sr_no },
        transaction,
      });

      if (!existingRecord) {
        throw new Error(`Record with sr_no ${update.sr_no} not found`);
      }
      // weighted forecast calculation
      const deal_size = parseFloat(String(update.deal_size).replace(/[^\d.]/g, "")) || 0;

      // mapping percent to values
      const statusPercent = DEAL_STATUS_PERCENT[update.deal_status] ?? 0;
      const probabilityPercent = DEAL_PROBABILITY_PERCENT[update.deal_probability] ?? 0;

      let weightedForecast: number;
      if ((update.deal_status || "").toLowerCase()=== "won") {
        weightedForecast = deal_size;
      }
      else {
        weightedForecast = (statusPercent /100)* (probabilityPercent / 100) *deal_size;
        console.log(weightedForecast)
      }

      return salesRequestmaster.update(
        {
          ...update,
          weighted_forecast: weightedForecast,
          created_at:  now,
          created_by: requestUser.loginid,
          updated_at: now,
          updated_by: requestUser.loginid,
        },
        {
          where: { sr_no: update.sr_no },
          transaction,
        }
      );
    });

    await Promise.all(updatePromises);
    await transaction.commit();

    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Records updated successfully",
    });
  } catch (error: any) {
    await transaction.rollback();
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
