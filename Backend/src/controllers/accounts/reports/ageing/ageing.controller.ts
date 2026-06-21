import { Response } from "express";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { Op } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { IUser } from "../../../../interfaces/user.interface";
import constants from "../../../../helpers/constants";
import { getSearchFilterQuery } from "../../../../helpers/functions";
// -------- Imports Models-----------
import AccountLevelFour from "../../../../models/finance/accounts/masters/account_level_four.model";
import Account from "../../../../models/finance/accounts/masters/account_finance.model";
import ReportDate from "../../../../models/wms/reports/stockCriteria/report_date.model";
import AgeingViewAccounts from "../../../../models/accounts/reports/ageing/ageing_view_accounts.model";
import MsCompanyInfo from "../../../../models/wms/reports/stockCriteria/ms_company_info.interface";
// ---------- Functions ----------
import { AgeingViewAccountsFormatted } from "../../../../helpers/functions";
// --------- Get Account Details ---------
// Function to retrieve account details based on user and filter criteria
export const getAccountDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    let outsideQuery = {
      [Op.and]: [{ company_code: requestUser.company_code }],
    };
    outsideQuery = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery,
    });

    let accountDetails = await Account.findAll({
      attributes: ["ac_code", "ac_name"],
      where: outsideQuery,
      ...(!!filter?.sort &&
        Object.keys(filter?.sort).length > 0 && {
          order: [[filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"]],
        }),
    });
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: accountDetails,
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};
// --------- Get Group Account Details ---------
// Function to retrieve group account details based on user and filter criteria
export const getGroupAccountDetails = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};

    let outsideQuery = {
      [Op.and]: [{ company_code: requestUser.company_code }],
    };
    outsideQuery = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery,
    });
    let groupAccountDetails = await AccountLevelFour.findAll({
      attributes: ["l4_code", "l4_description"],
      where: outsideQuery,
      ...(!!filter?.sort &&
        Object.keys(filter?.sort).length > 0 && {
          order: [[filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"]],
        }),
    });
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: groupAccountDetails,
    });
  } catch (error: any) {
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------- Get Period Wise Ageing Account Report ------------
// Function to retrieve period-wise ageing account report
export const getAgeingStockReportAccount = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const requestUser: IUser = req.user;
    const {
      date_to,
      age_1,
      age_2,
      age_3,
      age_4,
      age_5,
      age_6,
      ac_code,
      l4_code,
      div_code,
    } = req.query;
    const filter: any = req.query.filter ? JSON.parse(req.query.filter) : {};
    let formateAcCode = ac_code
      ? JSON.parse(ac_code).map((item: any) => item)
      : "All"; //Send array from frontend
    let formateL4Code = l4_code
      ? JSON.parse(l4_code).map((item: any) => item)
      : "All";
    let outsideQuery = {
      [Op.and]: [{ company_code: requestUser.company_code }],
    };
    outsideQuery = getSearchFilterQuery({
      insideQuery: [],
      filter: filter.search,
      outsideQuery,
    });
    // Update company information with ageing periods
    await MsCompanyInfo.update(
      { age_1, age_2, age_3, age_4, age_5 },
      { where: { company_code: requestUser.company_code } }
    );
    // Update report date
    await ReportDate.update({ date_to }, { where: {} });
    // Fetching data using Sequelize ORM
    const ageingStockData = await AgeingViewAccounts.findAll({
      attributes: [
        [sequelize.col("Account.l4_code"), "l4_code"],
        [
          sequelize.fn("max", sequelize.col("AccountLevelFour.l4_description")),
          "l4_description",
        ],
        "ac_code",
        [sequelize.fn("max", sequelize.col("Account.ac_name")), "ac_name"],
        [
          sequelize.fn(
            "max",
            sequelize.fn("COALESCE", sequelize.col("Account.credit_amount"), 0)
          ),
          "credit_amount",
        ],
        [sequelize.fn("max", sequelize.col("inv_date")), "inv_date"],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) <= ${age_1} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_below",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) > ${age_1} AND (date_to - inv_date) <= ${age_2} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_1",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) > ${age_2} AND (date_to - inv_date) <= ${age_3} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_2",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) > ${age_3} AND (date_to - inv_date) <= ${age_4} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_3",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) > ${age_4} AND (date_to - inv_date) <= ${age_5} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_4",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) > ${age_5} AND (date_to - inv_date) <= ${age_6} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_5",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='A' AND (date_to - inv_date) > ${age_6} THEN lcur_amount ELSE 0 END`
            )
          ),
          "age_above",
        ],
        [
          sequelize.fn(
            "sum",
            sequelize.literal(
              `CASE WHEN UNALLOCATED_FLAG='U' THEN lcur_amount ELSE 0 END`
            )
          ),
          "un_allocated_amt",
        ],
        [
          sequelize.fn("max", sequelize.col("Account.credit_period")),
          "credit_period",
        ],
        [sequelize.fn("max", sequelize.col("Account.dept_code")), "dept_code"],
        [sequelize.col("Account.salesman_code"), "salesman_code"],
        [
          sequelize.literal(
            `(SELECT salesman_name FROM MS_SALESMAN WHERE company_code = Account.company_code AND salesman_code = Account.salesman_code)`
          ),
          "salesman_name",
        ],
      ],
      include: [
        {
          model: ReportDate,
          attributes: [],
        },
        {
          model: Account,
          attributes: [],
        },
        {
          model: AccountLevelFour,
          attributes: [],
        },
      ],
      where: {
        ...{
          [Op.and]: [
            sequelize.literal(`
              AgeingViewAccounts.company_code = Account.company_code AND
              AgeingViewAccounts.ac_code = Account.ac_code AND
              AgeingViewAccounts.company_code = :as_company AND
              AgeingViewAccounts.company_code = AccountLevelFour.company_code AND
              Account.l4_code = AccountLevelFour.l4_code AND
              ('All' IN (:as_accodes) OR AgeingViewAccounts.ac_code IN (:as_accodes)) AND
              ('All' IN (:as_l4code) OR Account.l4_code IN (:as_l4code)) AND
              ('All' = :as_div_code OR AgeingViewAccounts.div_code = :as_div_code)
            `),
          ],
        },
      },
      group: [
        "Account.l4_code",
        "AgeingViewAccounts.ac_code",
        "Account.company_code",
        "Account.salesman_code",
      ],
      replacements: {
        as_company: requestUser.company_code,
        as_accodes: formateAcCode ? formateAcCode : "All",
        as_l4code: formateL4Code ? formateL4Code : "All",
        as_div_code: div_code ? div_code : "All",
      },
    });
    // Format the retrieved data
    let formatedData: any = AgeingViewAccountsFormatted(
      ageingStockData,
      age_1,
      age_2,
      age_3,
      age_4,
      age_5,
      age_6
    );

    if (formatedData) {
      res.status(200).json({
        success: true,
        data: formatedData,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No data found.",
      });
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
