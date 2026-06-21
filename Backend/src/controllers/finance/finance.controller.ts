import { Response } from "express";
import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { getSearchFilterQuery } from "../../helpers/functions";
import { ISearch, RequestWithUser } from "../../interfaces/common.interface";
import { ITrAcInvdetail } from "../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import { IUser } from "../../interfaces/user.interface";
import Account from "../../models/finance/accounts/masters/account_finance.model";
import AccountBlSetup from "../../models/finance/accounts/masters/account_finance_bl.model";
import AccountPlSetup from "../../models/finance/accounts/masters/account_finance_pl.model";
import ExpenseSubType from "../../models/finance/accounts/transactions/expenseSubType.model";
import ExpenseType from "../../models/finance/accounts/transactions/expenseType.model";
import MS_FY_PERIOD from "../../models/finance/accounts/transactions/ms_fy_period.model";
import TaxCompntancy from "../../models/finance/accounts/transactions/msTaxComPntcategory.model";
import TransactionHeader from "../../models/finance/accounts/transactions/tranasctionHeader_account.model";
import TransactionExpenseDetail from "../../models/finance/accounts/transactions/transactionExpenseDetail.model";
import TransactionInvoiceDetail from "../../models/finance/accounts/transactions/transactionInvoiceDetail.model";
import TransactionJobDetail from "../../models/finance/accounts/transactions/transactionJobDetail.model";
import JobInboundWms from "../../models/wms/transaction/inbound/inboundJobWms.model";
import { getChequePaymentInvoiceDetail } from "../../utils/query";
import VW_AC_HEADER_SEARCH from "../../views/finance/accounts/transactions/ac_header_search.view";
import AcCodesSearchView from "../../views/finance/accounts/transactions/acCodesSearch.view";
import Currency from "../../models/wms/currency_wms.model";

export const getFinanceListData = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Extract master parameter from request
    const { master } = req.params;
    // Get the user details from the request
    const requestUser: IUser = req.user;
    // Retrieve unique code from query parameters
    const uniqueCode = req.query.code;
    // Determine pagination options
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = Number(page * limit - limit);
    // Initialize variables for fetched data and total count
    let fetchedData: unknown[] = [],
      totalCount = 0;
    // Set pagination options if limit is provided
    const paginationOptions = limit ? { offset: skip, limit: limit } : {};
    // Parse and set filter from query parameters
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};
    switch (master) {
      case "doc":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await VW_AC_HEADER_SEARCH.count({
            where: outsideQuery,
          });

          fetchedData = await VW_AC_HEADER_SEARCH.findAll({
            where: outsideQuery,
            // ...(!!filter?.sort &&
            //   Object.keys(filter?.sort).length > 0 && {
            //     order: [
            //       [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
            //     ],
            //   }),
            ...paginationOptions,
            order: [["doc_no", "DESC"]],
          });
        }
        break;
      case "account":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await Account.count({
            where: outsideQuery,
          });

          fetchedData = await Account.findAll({
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
      case "fy_period":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await MS_FY_PERIOD.count({
            where: outsideQuery,
          });

          fetchedData = await MS_FY_PERIOD.findAll({
            attributes: ["fy_period"],
            where: outsideQuery,
            // ...paginationOptions,
          });
        }
        break;
      case "bank":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [
                { company_code: req.user.company_code },
                {
                  [Op.or]: [
                    { ac_status: { [Op.ne]: "C" } },
                    { ac_status: null },
                  ],
                },
                {
                  ac_code: {
                    [Op.in]: sequelize.literal(
                      `(SELECT ac_code FROM MS_AC_BANKCODE)`
                    ),
                  },
                },
              ],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });

          totalCount = await Account.count({
            where: outsideQuery,
          });

          fetchedData = await Account.findAll({
            attributes: ["ac_code", "ac_name"],
            where: outsideQuery,
          });
        }
        break;
      case "ac_payee":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [
                { company_code: req.user.company_code },
                {
                  [Op.or]: [{ ac_payee: { [Op.ne]: "' '" } }],
                },
              ],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await TransactionHeader.count({
            where: outsideQuery,
          });

          fetchedData = await TransactionHeader.findAll({
            attributes: [
              [sequelize.fn("DISTINCT", sequelize.col("ac_payee")), "ac_payee"],
            ],
            where: outsideQuery,
          });
        }
        break;
      case "tax":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await TaxCompntancy.count({
            where: outsideQuery,
          });

          fetchedData = await TaxCompntancy.findAll({
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
      case "invoice":
        {
          const {
            code,
            extra_param1,
            extra_param2,
            extra_param3,
            extra_param4,
          } = req.query;
          let defaultData: { [key: string]: ITrAcInvdetail } = {};

          fetchedData = await sequelize.query(getChequePaymentInvoiceDetail, {
            replacements: {
              company_code: req.user.company_code,
              ac_code: code,
              div_code: extra_param1,
              invrsno: `${extra_param2}${extra_param3}${extra_param4}`,
            },
            type: QueryTypes.SELECT,
          });
          const fetchedInvoiceNumbers = (fetchedData as ITrAcInvdetail[]).map(
            (value: ITrAcInvdetail) => {
              defaultData[`${value.inv_no}`] = value;
              return value.inv_no;
            }
          );

          const existingInvoiceDetails: any =
            await TransactionInvoiceDetail.findAll({
              where: {
                company_code: req.user.company_code,
                doc_no: extra_param3,
                doc_type: extra_param2,
                serial_no: extra_param4,
              },
              include: [{ model: Currency, attributes: ["curr_name"] }],
            });

          let maxDtlSrNo = 0;
          const existingInvoiceDetailsInvNos = (
            existingInvoiceDetails as ITrAcInvdetail[]
          ).map((value) => {
            maxDtlSrNo = Math.max(maxDtlSrNo, value.dtl_sr_no);
            return value.inv_no;
          });

          const matchedData = [];
          const remainingExistingInvoices = [];

          for (const eachExistingData of existingInvoiceDetails) {
            if (fetchedInvoiceNumbers.includes(eachExistingData.inv_no)) {
              matchedData.push({
                ...eachExistingData.dataValues,
                inv_amt: defaultData[eachExistingData.inv_no].inv_amt ?? 0,
                c_bal_amt_org:
                  defaultData[eachExistingData.inv_no].c_bal_amt_org ?? 0,
              });
            } else {
              remainingExistingInvoices.push({
                ...eachExistingData.toJSON(),
                IsDeletable: true,
              });
            }
          }

          const newFetchedDataWithDtlSrNo = (
            fetchedData as ITrAcInvdetail[]
          ).filter((item) => {
            if (!existingInvoiceDetailsInvNos.includes(item.inv_no)) {
              item.dtl_sr_no = maxDtlSrNo + 1;
              item.IsDeletable = false;
              maxDtlSrNo++;
              return true;
            }
            return false;
          });

          const finalFetchedData = [
            ...matchedData,
            ...newFetchedDataWithDtlSrNo,
          ];

          fetchedData = [...finalFetchedData, ...remainingExistingInvoices];

          totalCount = fetchedData.length;
        }
        break;
      case "ac_code_search":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await AcCodesSearchView.count({
            where: outsideQuery,
          });

          fetchedData = await AcCodesSearchView.findAll({
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
      case "job_no": {
        console.log("finance Job No ")
        let insideQuery: any = [],
          outsideQuery = {
            [Op.and]: [{ company_code: requestUser.company_code }],
          };
        outsideQuery = getSearchFilterQuery({
          insideQuery,
          filter: filter.search,
          outsideQuery,
        });
        totalCount = await JobInboundWms.count({
          where: outsideQuery,
        });

        fetchedData = await JobInboundWms.findAll({
          attributes: [
            "job_no",
            "job_date",
            "confirm_date",
            "prin_code",
            "doc_ref",
            "dept_code",
          ],
          where: outsideQuery,
          ...(!!filter?.sort &&
            Object.keys(filter?.sort).length > 0 && {
              order: [
                [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
              ],
            }),
          ...paginationOptions,
        });
        break;
      }
      case "job": {
        let insideQuery: any = [],
          outsideQuery = {
            [Op.and]: [{ company_code: requestUser.company_code }],
          };
        outsideQuery = getSearchFilterQuery({
          insideQuery,
          filter: filter.search,
          outsideQuery,
        });
        totalCount = await TransactionJobDetail.count({
          where: outsideQuery,
        });

        fetchedData = await TransactionJobDetail.findAll({
          where: outsideQuery,
          ...(!!filter?.sort &&
            Object.keys(filter?.sort).length > 0 && {
              order: [
                [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
              ],
            }),
          // ...paginationOptions,
        });
        break;
      }
      case "expense": {
        let insideQuery: any = [],
          outsideQuery = {
            [Op.and]: [{ company_code: requestUser.company_code }],
          };
        outsideQuery = getSearchFilterQuery({
          insideQuery,
          filter: filter.search,
          outsideQuery,
        });
        totalCount = await TransactionExpenseDetail.count({
          where: outsideQuery,
        });

        fetchedData = await TransactionExpenseDetail.findAll({
          where: outsideQuery,
          include: [
            { model: ExpenseType, attributes: ["exp_description"] },
            {
              model: ExpenseSubType,
              attributes: ["exp_subtype_description"],
              where: sequelize.where(
                sequelize.col("TransactionExpenseDetail.exp_type_code"),
                sequelize.col("ExpenseSubType.exp_type_code")
              ),
              required: true,
              on: sequelize.where(
                sequelize.col("TransactionExpenseDetail.exp_subtype_code"),
                sequelize.col("ExpenseSubType.exp_subtype_code")
              ),
            },
          ],
          ...(!!filter?.sort &&
            Object.keys(filter?.sort).length > 0 && {
              order: [
                [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
              ],
            }),
          // ...paginationOptions,
        });
        break;
      }
      case "expense_type": {
        let insideQuery: any = [],
          outsideQuery = {
            [Op.and]: [{ company_code: requestUser.company_code }],
          };
        outsideQuery = getSearchFilterQuery({
          insideQuery,
          filter: filter.search,
          outsideQuery,
        });
        totalCount = await ExpenseType.count({
          where: outsideQuery,
        });

        fetchedData = await ExpenseType.findAll({
          where: outsideQuery,
          ...(!!filter?.sort &&
            Object.keys(filter?.sort).length > 0 && {
              order: [
                [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
              ],
            }),
          ...paginationOptions,
        });
        break;
      }
      case "expense_sub_type": {
        let insideQuery: any = [],
          outsideQuery = {
            [Op.and]: [{ company_code: requestUser.company_code }],
          };
        outsideQuery = getSearchFilterQuery({
          insideQuery,
          filter: filter.search,
          outsideQuery,
        });
        totalCount = await ExpenseSubType.count({
          where: outsideQuery,
        });

        fetchedData = await ExpenseSubType.findAll({
          where: outsideQuery,
          ...(!!filter?.sort &&
            Object.keys(filter?.sort).length > 0 && {
              order: [
                [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
              ],
            }),
          ...paginationOptions,
        });
        break;
      }
      case "pl_setup":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await AccountPlSetup.count({ where: outsideQuery });
          fetchedData = await AccountPlSetup.findAll({
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
      //------bl_setup-------------
      case "bl_setup":
        {
          let insideQuery: any = [],
            outsideQuery = {
              [Op.and]: [{ company_code: requestUser.company_code }],
            };
          outsideQuery = getSearchFilterQuery({
            insideQuery,
            filter: filter.search,
            outsideQuery,
          });
          totalCount = await AccountBlSetup.count({ where: outsideQuery });
          fetchedData = await AccountBlSetup.findAll({
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

    // Send the response with the fetched data and total count
    res.status(constants.STATUS_CODES.OK).json({
      success: true,
      data: { tableData: fetchedData, count: totalCount },
    });
    return; // End the execution of the function
  } catch (err) {
    // Catch the error and send the error response
    console.error(err);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error occurred while fetching data",
    });
  }
};
