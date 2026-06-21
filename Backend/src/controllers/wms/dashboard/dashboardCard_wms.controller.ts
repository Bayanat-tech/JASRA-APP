// // Import required dependencies
// import { Response } from "express";
// import { RequestWithUser } from "../../../interfaces/common.interface";
// import moment from "moment-timezone";
// import OutboundDashboard from "../../../models/dashboard/outboundDashboard_wms.model";
// import InboundDashboard from "../../../models/dashboard/inboundDashboard_wms.model";
// import ReturnDashboard from "../../../models/dashboard/returnDashboard_wms.model";
// import JobListingDashboard from "../../../models/dashboard/jobListingDashboard_wns.model";
// import { Op } from "sequelize";
// import sequelize from "sequelize";

// /**
//  * Controller to handle warehouse dashboard card data
//  * Processes and returns metrics for outbound, inbound, return and job listing data
//  */
// export const warehouseDashboardCard = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   // Parse filter from query params
//   const filter = JSON.parse(req.query.filter);
//   let stDate, endDate, prevStDate, prevEndDate;
//   try {
//     // Handle date range filtering
//     if (!!filter.from_date && !!filter.to_date) {
//       // If specific date range provided, use those dates
//       stDate = moment(filter.from_date).format("YYYY-MM-DD HH:mm:ss");
//       endDate = moment(filter.to_date).format("YYYY-MM-DD HH:mm:ss");
//     } else {
//       // Otherwise calculate date ranges based on filter.time
//       stDate = moment();
//       endDate = moment();
//       prevStDate = moment();
//       prevEndDate = moment();
//       switch (filter.time) {
//         // Calculate current week dates
//         case "current-week":
//           stDate = stDate
//             .subtract(stDate.day() - 1, "days")
//             .format("YYYY-MM-DD HH:mm:ss");

//           endDate = endDate
//             .add(7 - endDate.day(), "days")
//             .format("YYYY-MM-DD HH:mm:ss");

//           prevStDate = prevStDate
//             .subtract(prevStDate.day() + 6, "days")
//             .format("YYYY-MM-DD HH:mm:ss");

//           prevEndDate = prevEndDate
//             .subtract(prevEndDate.day(), "days")
//             .format("YYYY-MM-DD HH:mm:ss");
//           break;

//         // Calculate current month dates  
//         case "current-month":
//           stDate = stDate
//             .subtract(stDate.date() - 1, "days")
//             .format("YYYY-MM-DD HH:mm:ss");

//           endDate = endDate
//             .add(endDate.daysInMonth() - endDate.date(), "days")
//             .format("YYYY-MM-DD HH:mm:ss");

//           prevStDate = prevStDate.subtract(prevStDate.date() - 1, "days");

//           prevStDate = prevStDate
//             .subtract(1, "months")
//             .format("YYYY-MM-DD HH:mm:ss");

//           prevEndDate = prevEndDate
//             .subtract(prevEndDate.date(), "days")
//             .format("YYYY-MM-DD HH:mm:ss");
//           break;

//         // Calculate current year dates
//         case "current-year":
//           stDate = stDate.subtract(stDate.month(), "months");
//           stDate = stDate
//             .subtract(stDate.date() - 1, "days")
//             .format("YYYY-MM-DD HH:mm:ss");
//           endDate = endDate.add(11 - endDate.month(), "months");
//           endDate = endDate
//             .add(endDate.daysInMonth() - endDate.date(), "days")
//             .format("YYYY-MM-DD HH:mm:ss");

//           prevStDate = prevStDate.subtract(prevStDate.month(), "months");
//           prevStDate = prevStDate.subtract(prevStDate.date() - 1, "days");

//           prevStDate = prevStDate
//             .subtract(1, "years")
//             .format("YYYY-MM-DD HH:mm:ss");

//           prevEndDate = prevEndDate.subtract(prevEndDate.month(), "months");
//           prevEndDate = prevEndDate
//             .subtract(prevEndDate.date(), "days")
//             .format("YYYY-MM-DD HH:mm:ss");
//           break;
//       }
//     }

//     // Fetch outbound dashboard data
//     const outboundData: any = await OutboundDashboard.findAll({
//       attributes: [
//         [sequelize.fn("SUM", sequelize.literal("quantity")), "quantity"],
//       ],
//       where: {
//         company_code: req.user.company_code,
//         txn_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Get outbound count
//     const outboundDataCount = await OutboundDashboard.count({
//       where: {
//         company_code: req.user.company_code,
//         txn_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Fetch inbound dashboard data
//     const inboundData: any = await InboundDashboard.findAll({
//       attributes: [
//         [sequelize.fn("SUM", sequelize.literal("quantity")), "quantity"],
//       ],
//       where: {
//         company_code: req.user.company_code,
//         txn_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Get inbound count
//     const inboundDataCount = await InboundDashboard.count({
//       where: {
//         company_code: req.user.company_code,
//         txn_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Fetch return dashboard data
//     const returnData: any = await ReturnDashboard.findAll({
//       attributes: [
//         [sequelize.fn("SUM", sequelize.literal("quantity")), "quantity"],
//       ],
//       where: {
//         company_code: req.user.company_code,
//         txn_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Get return count
//     const returnDataCount = await ReturnDashboard.count({
//       where: {
//         company_code: req.user.company_code,
//         txn_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Initialize job listing counters
//     let confirm = 0,
//       cancelled = 0,
//       pending = 0;

//     // Fetch job listing data
//     const jobListingData = await JobListingDashboard.findAll({
//       attributes: ["confirmed"],
//       where: {
//         company_code: req.user.company_code,
//         job_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Get job listing count
//     const jobListingDataCount = await JobListingDashboard.count({
//       where: {
//         company_code: req.user.company_code,
//         job_date: {
//           [Op.between]: [stDate, endDate],
//         },
//       },
//       ...filter,
//     });

//     // Calculate job status counts
//     jobListingData.map((item: any) => {
//       if (item.confirmed === "Confirmed") {
//         confirm++;
//       } else if (item.confirmed === "Pending") {
//         pending++;
//       } else {
//         cancelled++;
//       }
//     });

//     // Fetch previous period data if no specific date range
//     let outboundDataPrev: any, inboundDataPrev: any, returnDataPrev: any;
//     if (!filter.from_date && !filter.to_date) {
//       outboundDataPrev = await OutboundDashboard.findAll({
//         attributes: [
//           [sequelize.fn("SUM", sequelize.literal("quantity")), "quantity"],
//         ],
//         where: {
//           company_code: req.user.company_code,
//           txn_date: {
//             [Op.between]: [prevStDate, prevEndDate],
//           },
//         },
//         ...filter,
//       });
//       inboundDataPrev = await InboundDashboard.findAll({
//         attributes: [
//           [sequelize.fn("SUM", sequelize.literal("quantity")), "quantity"],
//         ],
//         where: {
//           company_code: req.user.company_code,
//           txn_date: {
//             [Op.between]: [prevStDate, prevEndDate],
//           },
//         },
//         ...filter,
//       });
//       returnDataPrev = await ReturnDashboard.findAll({
//         attributes: [
//           [sequelize.fn("SUM", sequelize.literal("quantity")), "quantity"],
//         ],
//         where: {
//           company_code: req.user.company_code,
//           txn_date: {
//             [Op.between]: [prevStDate, prevEndDate],
//           },
//         },
//         ...filter,
//       });
//     }

//     // Return formatted response
//     res.status(200).json({
//       success: true,
//       data: {
//         outbound: {
//           count: outboundDataCount,
//           total: Number(outboundData[0].quantity),
//           prevTotal:
//             !filter.from_date && !filter.to_date
//               ? Number(outboundDataPrev[0].quantity)
//               : 0,
//         },
//         inbound: {
//           count: inboundDataCount,
//           total: Number(inboundData[0].quantity),
//           prevTotal:
//             !filter.from_date && !filter.to_date
//               ? Number(inboundDataPrev[0].quantity)
//               : 0,
//         },
//         return: {
//           count: returnDataCount,
//           total: Number(returnData[0].quantity),
//           prevTotal:
//             !filter.from_date && !filter.to_date
//               ? Number(returnDataPrev[0].quantity)
//               : 0,
//         },
//         jobListing: {
//           count: jobListingDataCount,
//           confirm: Number(
//             ((confirm * 100) / (confirm + pending + cancelled)).toFixed(0)
//           ),
//           pending: Number(
//             ((pending * 100) / (confirm + pending + cancelled)).toFixed(0)
//           ),
//           cancelled: Number(
//             ((cancelled * 100) / (confirm + pending + cancelled)).toFixed(0)
//           ),
//         },
//       },
//     });
//     return;
//   } catch (error: any) {
//     console.error("Error:", error); // Log the error for debugging
//     res.status(400).json({ success: false, message: error.message });
//   }
// };
