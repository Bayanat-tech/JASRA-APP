// import { Response } from "express"; // Importing the Response type from Express to type the response object in route handlers.
// import { RequestWithUser } from "../../../../interfaces/common.interface"; // Importing a custom interface for request objects that include user information.
// import constants from "../../../../helpers/constants"; // Importing constants, likely for status codes and messages.
// import { IUser } from "../../../../interfaces/user.interface"; // Importing a user interface for typing user-related data.
// import { sequelize } from "../../../../database/connection"; // Importing the configured Sequelize instance for database connection.
// import { getSearchFilterQuery } from "../../../../helpers/functions"; // Importing a helper function to construct search filter queries.
// import Sequelize, { Op } from "sequelize"; // Importing Sequelize and its operators for database query operations.
// import { ISearch } from "../../../../interfaces/common.interface"; // Importing an interface for search filter data.
// import SummaryStock from "../../../../models/wms/reports/stockCriteria/summary_stock.model"; // Importing the SummaryStock model for database operations related to summary stock.
// import Product from "../../../../models/wms/product_wms.model"; // Importing the Product model for database operations related to products.

// // -------- Summary Stock Report ----------
// // Function to get summary stock report
// export const getSummaryStockReport = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   try {
//     const requestUser: IUser = req.user; // Extracting user information from the request
//     const filter: ISearch = req.query.filter
//       ? JSON.parse(req.query.filter)
//       : {}; // Parsing filter from request query

//     // Default query conditions
//     let outsideQuery: any = {
//       [Op.and]: [{ company_code: requestUser.company_code }],
//     };

//     // Extend outsideQuery using custom logic
//     outsideQuery = getSearchFilterQuery({
//       insideQuery: [],
//       filter: filter.search,
//       outsideQuery,
//     });

//     // Extracting query parameters
//     const { prin_code, start_date, end_date, prod_code_from, prod_code_to } =
//       req.query as {
//         prin_code?: string;
//         start_date: string;
//         end_date: string;
//         prod_code_from?: string;
//         prod_code_to?: string;
//       };

//     // Query to get summary stock data with specific attributes and conditions
//     let summaryStockData1 = await SummaryStock.findAll({
//       attributes: [
//         "prin_code",
//         "prod_code",
//         [Sequelize.col("Product.prod_name"), "prod_name"],
//         "prin_name",
//         [sequelize.literal("0"), "open_stk_puom"],
//         [sequelize.literal("0"), "open_stk_luom"],
//         [sequelize.literal("0"), "open_stk"],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(`
//                 CASE
//                   WHEN TXN_TYPE IN ('IMP', 'ADJ+')
//                   THEN QTY_PUOM
//                   ELSE 0
//                 END
//               `)
//             ),
//             0
//           ),
//           "qty_in_puom",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(`
//                 CASE
//                   WHEN TXN_TYPE IN ('IMP', 'ADJ+')
//                   THEN QTY_LUOM
//                   ELSE 0
//                 END
//               `)
//             ),
//             0
//           ),
//           "qty_in_luom",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(`
//                 CASE
//                   WHEN TXN_TYPE IN ('IMP', 'ADJ+')
//                   THEN QUANTITY
//                   ELSE 0
//                 END
//               `)
//             ),
//             0
//           ),
//           "qty_in",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(`
//                 CASE
//                   WHEN TXN_TYPE IN ('IMP', 'ADJ-')
//                   THEN QUANTITY
//                   ELSE 0
//                 END
//               `)
//             ),
//             0
//           ),
//           "qty_out",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(`
//                 CASE
//                   WHEN TXN_TYPE IN ('IMP', 'ADJ-')
//                   THEN QTY_PUOM
//                   ELSE 0
//                 END
//               `)
//             ),
//             0
//           ),
//           "qty_out_puom",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(`
//                 CASE
//                   WHEN TXN_TYPE IN ('IMP', 'ADJ-')
//                   THEN QTY_LUOM
//                   ELSE 0
//                 END
//               `)
//             ),
//             0
//           ),
//           "qty_out_luom",
//         ],
//       ],
//       include: [
//         {
//           model: Product,
//           attributes: [],
//           required: true,
//           on: {
//             company_code: Sequelize.where(
//               Sequelize.col("SummaryStock.company_code"),
//               "=",
//               Sequelize.col("Product.company_code")
//             ),
//             prin_code: Sequelize.where(
//               Sequelize.col("SummaryStock.prin_code"),
//               "=",
//               Sequelize.col("Product.prin_code")
//             ),
//             prod_code: Sequelize.where(
//               Sequelize.col("SummaryStock.prod_code"),
//               "=",
//               Sequelize.col("Product.prod_code")
//             ),
//           },
//         },
//       ],
//       where: {
//         prin_code: prin_code,
//         ...outsideQuery,
//         ...(start_date && end_date
//           ? {
//               txn_date: {
//                 [Op.gte]: sequelize.literal(
//                   `STR_TO_DATE('${start_date}', '%m/%d/%Y')`
//                 ),
//                 [Op.lt]: sequelize.literal(
//                   `STR_TO_DATE('${end_date}', '%m/%d/%Y')`
//                 ),
//               },
//             }
//           : {
//               txn_date: {
//                 [Op.gte]: sequelize.literal(
//                   `STR_TO_DATE('01/01/1900', '%m/%d/%Y')`
//                 ),
//                 [Op.lt]: sequelize.literal(
//                   `STR_TO_DATE('01/01/5000', '%m/%d/%Y')`
//                 ),
//               },
//             }),

//         ...(prod_code_from && prod_code_to
//           ? {
//               prod_code: {
//                 [Op.gte]: prod_code_from,
//                 [Op.lte]: prod_code_to,
//               },
//             }
//           : {
//               [Op.or]: [
//                 Sequelize.literal(`'All' = 'All'`),
//                 { prod_code: "All" },
//               ],
//             }),
//       },
//       group: [
//         "SummaryStock.PRIN_CODE",
//         "SummaryStock.PROD_CODE",
//         "Product.prod_name",
//       ],
//     });

//     // Query to get additional summary stock data with different attributes and conditions
//     let summaryStockData2 = await SummaryStock.findAll({
//       attributes: [
//         "prin_code",
//         "prod_code",
//         [Sequelize.col("Product.prod_name"), "prod_name"],
//         "prin_name",
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(
//                 "CAST(QTY_PUOM AS DECIMAL) * CAST(sign_indicator AS DECIMAL)"
//               )
//             ),
//             0
//           ),
//           "open_stk_puom",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(
//                 "CAST(QTY_LUOM AS DECIMAL) * CAST(sign_indicator AS DECIMAL)"
//               )
//             ),
//             0
//           ),
//           "open_stk_luom",
//         ],
//         [
//           sequelize.fn(
//             "IFNULL",
//             sequelize.fn(
//               "SUM",
//               sequelize.literal(
//                 "CAST(QUANTITY AS DECIMAL) * CAST(sign_indicator AS DECIMAL)"
//               )
//             ),
//             0
//           ),
//           "open_stk",
//         ],
//         [sequelize.literal("0"), "qty_in_puom"],
//         [sequelize.literal("0"), "qty_in_luom"],
//         [sequelize.literal("0"), "qty_in"],
//         [sequelize.literal("0"), "qty_out"],
//         [sequelize.literal("0"), "qty_out_puom"],
//         [sequelize.literal("0"), "qty_out_luom"],
//       ],
//       include: [
//         {
//           model: Product,
//           attributes: [],
//           required: true,
//           on: {
//             company_code: Sequelize.where(
//               Sequelize.col("SummaryStock.company_code"),
//               "=",
//               Sequelize.col("Product.company_code")
//             ),
//             prin_code: Sequelize.where(
//               Sequelize.col("SummaryStock.prin_code"),
//               "=",
//               Sequelize.col("Product.prin_code")
//             ),
//             prod_code: Sequelize.where(
//               Sequelize.col("SummaryStock.prod_code"),
//               "=",
//               Sequelize.col("Product.prod_code")
//             ),
//           },
//         },
//       ],
//       where: {
//         prin_code: prin_code,
//         ...outsideQuery,
//         ...(start_date
//           ? {
//               txn_date: {
//                 [Op.lt]: sequelize.fn("STR_TO_DATE", start_date, "%m/%d/%Y"),
//               },
//             }
//           : {
//               txn_date: {
//                 [Op.lt]: sequelize.fn("STR_TO_DATE", "01/01/1900", "%m/%d/%Y"),
//               },
//             }),
//         ...(prod_code_from && prod_code_to
//           ? {
//               prod_code: {
//                 [Op.gte]: prod_code_from,
//                 [Op.lte]: prod_code_to,
//               },
//             }
//           : {
//               [Op.or]: [
//                 Sequelize.literal(`'All' = 'All'`),
//                 { prod_code: "All" },
//               ],
//             }),
//       },
//       group: [
//         "SummaryStock.PRIN_CODE",
//         "SummaryStock.PROD_CODE",
//         "Product.prod_name",
//       ],
//       having: sequelize.literal(
//         "IFNULL(SUM(SummaryStock.quantity * SummaryStock.sign_indicator), 0) > 0"
//       ),
//       raw: true,
//     });

//     // Log the fetched data for debugging
//     console.log("summaryStockData1..", JSON.stringify(summaryStockData1));
//     console.log("summaryStockData2..", JSON.stringify(summaryStockData2));

//     // Combine the data from both queries
//     let summaryStockData = [...summaryStockData1, ...summaryStockData2];

//     // Send successful response with combined data
//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       data: summaryStockData,
//     });
//   } catch (error: any) {
//     // Handle errors and send error response
//     res.status(constants.STATUS_CODES.BAD_REQUEST).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
