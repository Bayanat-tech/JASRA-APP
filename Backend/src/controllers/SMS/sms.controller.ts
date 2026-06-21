import { Response } from "express";
import { ISearch, RequestWithUser } from "../../interfaces/common.interface";
import { IUser } from "../../interfaces/user.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { Op } from "sequelize";
// Importing models for SMS master data
import companymaster from "../../models/SMS/sms.model";
import servicemaster from "../../models/SMS/servicemaster_sms.model";
import segmentmaster from "../../models/SMS/segmentmaster_sms.model";
import salesmaster from "../../models/SMS/salesmaster_sms.model";
import reasonmaster from "../../models/SMS/reasonmaster_sms.model";
import dealmaster from "../../models/SMS/dealmaster_sms.model";
import probabilitymaster from "../../models/SMS/probabilitymaster_sms.model";
import salesRequestmaster from "../../models/SMS/salesRequest_sms.model";
import CompanyMaster from "../../models/SMS/sms.model";
import ServiceMaster from "../../models/SMS/servicemaster_sms.model";
import SegmentMaster from "../../models/SMS/segmentmaster_sms.model";
import SalesMaster from "../../models/SMS/salesmaster_sms.model";
import ReasonMaster from "../../models/SMS/reasonmaster_sms.model";
import DealMaster from "../../models/SMS/dealmaster_sms.model";
import ProbabilityMaster from "../../models/SMS/probabilitymaster_sms.model";
import { getSearchFilterQuery } from "../../helpers/functions";

// Retrieves master data (country, department, territory, etc.) with optional pagination based on the `master` type.
export const getSMSMaster = async (req: RequestWithUser, res: Response) => {
  try {
    console.log("all data", req.params);
    const { master } = req.params;
    const requestUser: IUser = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    // Ensure page is at least 1
    const safePage = page < 1 ? 1 : page;
    const skip = (safePage - 1) * limit;

    let fetchedData: unknown[] = [];
    let totalCount = 0;
    // Only add pagination if limit is set and positive
    const paginationOptions = limit > 0 ? { offset: skip, limit: limit } : {};
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};
    switch (master) {
      case "lead":
        {
          let outsideQuery = {};
          totalCount = await companymaster.count({ where: outsideQuery });
          fetchedData = await companymaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "services":
        {
          let outsideQuery = {};
          totalCount = await servicemaster.count({ where: outsideQuery });
          fetchedData = await servicemaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "segment_master":
        {
          let outsideQuery = {};
          totalCount = await segmentmaster.count({ where: outsideQuery });
          fetchedData = await segmentmaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "salesman_master":
        {
          let outsideQuery = {};
          totalCount = await salesmaster.count({ where: outsideQuery });
          fetchedData = await salesmaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "reject_reason":
        {
          let outsideQuery = {};
          totalCount = await reasonmaster.count({ where: outsideQuery });
          fetchedData = await reasonmaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "deal_status":
        {
          let outsideQuery = {};
          totalCount = await dealmaster.count({ where: outsideQuery });
          fetchedData = await dealmaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "deal_probability":
        {
          let outsideQuery = {};
          totalCount = await probabilitymaster.count({ where: outsideQuery });
          fetchedData = await probabilitymaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
      case "sales_request":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ sales_name: requestUser.username }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await salesRequestmaster.count({ where: outsideQuery });
          fetchedData = await salesRequestmaster.findAll({
            where: outsideQuery,
            ...(!!filter?.sort &&
              Object.keys(filter?.sort).length > 0 && {
                order: [
                  [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
                ],
              }),
            ...paginationOptions,
          });
        }
        break;
    }
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: { tableData: fetchedData, count: totalCount },
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error occurred while fetching data",
    });
  }
};

export const deleteSMSMaster = async (req: RequestWithUser, res: Response) => {
  console.error("deleteCompanyMaster");
  const transaction = await sequelize.transaction();
  try {
    const { master } = req.params;
    const requestUser: IUser = req.user;
    const { ids, sr_no } = req.body;

    switch (master) {
      case "lead":
        if (!ids || ids.length === 0) {
          throw new Error("Lead Code is required");
        }
        console.log(ids);
        {
          await companymaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "service_master":
        if (!ids || ids.length === 0) {
          throw new Error("service Code is required");
        }
        console.log(ids);
        {
          await servicemaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "segment_master":
        if (!ids || ids.length === 0) {
          throw new Error("segment Code is required");
        }
        console.log(ids);
        {
          await segmentmaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "sales_master":
        if (!ids || ids.length === 0) {
          throw new Error("sales Code is required");
        }
        console.log(ids);
        {
          await salesmaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "reason_master":
        if (!ids || ids.length === 0) {
          throw new Error("Lost reason is required");
        }
        console.log(ids);
        {
          await reasonmaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "deal_master":
        if (!ids || ids.length === 0) {
          throw new Error("Deal Status is required");
        }
        console.log(ids);
        {
          await dealmaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "probability_master":
        if (!ids || ids.length === 0) {
          throw new Error("Deal Probability is required");
        }
        console.log(ids);
        {
          await probabilitymaster.destroy({
            where: {
              id: ids,
            },
            transaction,
          });
        }
        break;
      case "sales_request":
        if (!ids || ids.length === 0) {
          throw new Error("Sales Request is required");
        }
        console.log(ids);
        {
          await salesRequestmaster.destroy({
            where: {
              sr_no: ids,
            },
            transaction,
          });
        }
        break;
    }
    await transaction.commit();
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      message: "Record is successfully deleted.",
    });
    return;
  } catch (error: any) {
    await transaction.rollback();
    res
      .status(constants.STATUS_CODES.BAD_REQUEST)
      .json({ success: false, message: error.message });
    return;
  }
};

/// distraction :- This function retrieves all master data (companies, services, segments, salesmen, reasons, deals, probabilities)
export const getAllMasterData = async (req: RequestWithUser, res: Response) => {
  try {
    const [
      companies,
      services,
      segments,
      salesmen,
      reasons,
      deals,
      probabilities,
    ] = await Promise.all([
      CompanyMaster.findAll(),
      ServiceMaster.findAll(),
      SegmentMaster.findAll(),
      SalesMaster.findAll(),
      ReasonMaster.findAll(),
      DealMaster.findAll(),
      ProbabilityMaster.findAll(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        companies,
        services,
        segments,
        salesmen,
        reasons,
        deals,
        probabilities,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
