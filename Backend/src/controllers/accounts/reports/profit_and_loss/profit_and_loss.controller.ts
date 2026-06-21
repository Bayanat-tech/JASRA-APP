import { Response } from "express";
import {
  ISearch,
  RequestWithUser,
} from "../../../../interfaces/common.interface";
import { Op, fn } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { IUser } from "../../../../interfaces/user.interface";
import ProfitAndLoss from "../../../../models/accounts/reports/profit_and_loss/profit_and_loss.model";
import constants from "../../../../helpers/constants";
import { getSearchFilterQuery } from "../../../../helpers/functions";
import { formatProfitAndLossReport } from "../../../../helpers/functions";
import Accountsetup from "../../../../models/wms/accountsetup_wms.model";

// --------- Profi And Loss Report -----------
// Export a function to handle HTTP requests for profit and loss reports
export const getProfitAndLossReport = async (
  // Request object with user information
  req: RequestWithUser,
  // Response object to send back to the client
  res: Response
) => {
  try {
    // Extract the user information from the request
    const requestUser: IUser = req.user;
    
    // Extract query parameters from the request
    const { dt_from, dt_to, div_code } = req.query;
    
    // Parse the filter query parameter into a JSON object
    const filter: ISearch = req.query.filter
      ? JSON.parse(req.query.filter)
      : {};
    
    // Initialize an object to store the query conditions
    let outsideQuery = {
      // Apply a filter to only include records for the current company
      [Op.and]: [{ company_code: requestUser.company_code }],
    };
    
    // Apply additional filters based on the search criteria
    outsideQuery = getSearchFilterQuery({
      // Initialize an empty array for inner query conditions
      insideQuery: [],
      // Pass the search filter to the getSearchFilterQuery function
      filter: filter.search,
      // Pass the current outside query conditions
      outsideQuery,
    });

    // Retrieve the profit and loss data from the database
    let profitLossReport = await ProfitAndLoss.findAll({
      // Specify the attributes to include in the query results
      attributes: [
        "h_code",
        "pl_code",
        "pl_name",
        // Calculate the sum of the lcur_amount field
        [sequelize.fn("SUM", sequelize.literal("lcur_amount")), "lcur_amount"],
        "h_name",
        "s_order",
      ],
      // Specify the query conditions
      where: {
        // Apply the outside query conditions
        ...outsideQuery,
        // Apply additional conditions based on the query parameters
        ...{
          [Op.and]: [
            // Filter by date range and division code
            sequelize.literal(`
            doc_date >= :dt_from and
            doc_date < :dt_to AND
            ('All' = :as_div_code or div_code = :as_div_code)
          `),
          ],
        },
        // Apply sorting conditions if specified
        ...(!!filter?.sort &&
          Object.keys(filter?.sort).length > 0 && {
            order: [
              // Sort by the specified field in the specified direction
              [filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"],
            ],
          }),
      },
      // Group the results by the specified fields
      group: [
        "ProfitAndLoss.company_code",
        "ProfitAndLoss.h_code",
        "ProfitAndLoss.pl_code",
        "ProfitAndLoss.pl_name",
      ],
      // Replace placeholders in the query with actual values
      replacements: {
        // Set the date range and division code values
        dt_from: dt_from ? dt_from : "1900/01/01",
        dt_to: dt_to ? dt_to : "5000/01/01",
        as_div_code: div_code ? div_code : "All",
      },
    });
    
    // Retrieve the decimal limit for the current company
    let decimalLimit: any = await Accountsetup.findOne({
      // Specify the attribute to include in the query results
      attributes: ["lcur_decimal_nos"],
      // Filter by company code
      where: {
        company_code: requestUser.company_code,
      },
    });

    // Format the profit and loss data
    let newProfitLossReport: any = formatProfitAndLossReport(
      // Pass the query results to the format function
      profitLossReport,
      // Pass the decimal limit to the format function
      decimalLimit.lcur_decimal_nos
    );
    
    // Send the formatted data back to the client
    res.status(constants.STATUS_CODES.OK).json({
      // Indicate success
      success: true,
      // Include the formatted data in the response
      data: newProfitLossReport,
    });
  } catch (error: any) {
    // Send an error response back to the client
    res.status(constants.STATUS_CODES.BAD_REQUEST).json({
      // Indicate failure
      success: false,
      // Include the error message in the response
      message: error.message,
    });
  }
};
