// import { Response } from "express"; // Importing the Response type from Express to type the response object in route handlers.
// import { Op } from "sequelize"; // Importing Sequelize operators for database query operations.
// import constants from "../../../../helpers/constants"; // Importing constants, likely for status codes and messages.
// import { RequestWithUser } from "../../../../interfaces/common.interface"; // Importing a custom interface for request objects that include user information.
// import { IUser } from "../../../../interfaces/user.interface"; // Importing a user interface for typing user-related data.
// import { IStockDetailsReport } from "../../../../interfaces/wms/reports/stockCriteria/stock_details.interface"; // Importing an interface for stock details report data.
// import StockDetailsReport from "../../../../models/wms/reports/stockCriteria/stock_details.model"; // Importing the StockDetailsReport model for database operations related to stock details.
// import { ISearch } from "../../../../interfaces/common.interface"; // Importing an interface for search filter data.
// import { getSearchFilterQuery } from "../../../../helpers/functions"; // Importing a helper function to construct search filter queries.
// import { formatDataDetailStock } from "../../../../helpers/functions"; // Importing a helper function to format stock detail data.

// // --------- Get Stock Details Report -----------
// // Function to get stock details report
// export const getStockDetailsReport = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   try {
//     const requestUser: IUser = req.user; // Extracting user information from the request
//     let fetchedData: unknown[] = []; // Array to store fetched data
//     let totalCount; // Variable to store total count of records
//     const filter: ISearch = req.query.filter
//       ? JSON.parse(req.query.filter)
//       : {}; // Parsing filter from request query

//     let insideQuery: any = [],
//       outsideQuery = {
//         [Op.and]: [{ company_code: requestUser.company_code }],
//       }; // Initializing query conditions with company code
//     outsideQuery = getSearchFilterQuery({
//       insideQuery,
//       filter: filter.search,
//       outsideQuery,
//     }); // Constructing search filter query

//     // Count the number of records matching the query
//     totalCount = await StockDetailsReport.count({
//       where: outsideQuery,
//     });

//     // Retrieve all matching records with optional sorting
//     let stockDetailReport = await StockDetailsReport.findAll({
//       where: outsideQuery,
//       ...((!!filter?.sort &&
//         Object.keys(filter?.sort).length > 0 && {
//           order: [[filter?.sort.field_name, filter.sort.desc ? "DESC" : "ASC"]],
//         }) as unknown as IStockDetailsReport[]), // Applying sorting if specified in the filter
//     });

//     // Format the fetched data
//     fetchedData = await formatDataDetailStock(stockDetailReport);

//     // Send successful response with data and total count
//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       data: fetchedData,
//       totalCount,
//     });
//   } catch (error: any) {
//     // Handle errors and send error response
//     res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
