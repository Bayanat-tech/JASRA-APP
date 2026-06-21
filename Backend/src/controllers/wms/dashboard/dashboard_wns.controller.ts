// // Import required dependencies
// import { Response } from "express";
// import moment from "moment-timezone";
// import { QueryTypes } from "sequelize";
// import { sequelize } from "../../../database/connection";
// import { RequestWithUser } from "../../../interfaces/common.interface";
// import { IUser } from "../../../interfaces/user.interface";
// import { getWareHouseUtilization } from "../../../utils/query";

// /**
//  * Controller function to handle warehouse dashboard data
//  * @param req Request object with user information
//  * @param res Response object
//  */
// export const warehouseDashboard = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   // Parse filter from query parameters
//   const filter = JSON.parse(req.query.filter);
//   const requestUser: IUser = req.user;
//   let stDate, endDate;
//   try {
//     // Handle date range based on filter
//     if (!!filter.from_date && !!filter.to_date) {
//       // Use specific date range if provided
//       stDate = moment(filter.from_date).format("DD MMM YYYY");
//       endDate = moment(filter.to_date).format("DD MMM YYYY");
//     } else {
//       // Calculate date range based on time filter
//       stDate = moment();
//       endDate = moment();
//       switch (filter.time) {
//         case "current-week":
//           // Set date range for current week
//           stDate = stDate
//             .subtract(stDate.day() - 1, "days")
//             .format("DD MMM YYYY");
//           endDate = endDate
//             .add(7 - endDate.day(), "days")
//             .format("DD MMM YYYY");
//           break;
//         case "current-month":
//           // Set date range for current month
//           stDate = stDate
//             .subtract(stDate.date() - 1, "days")
//             .format("DD MMM YYYY");
//           endDate = endDate
//             .add(endDate.daysInMonth() - endDate.date(), "days")
//             .format("DD MMM YYYY");
//           break;
//         case "current-year":
//           // Set date range for current year
//           stDate = stDate.subtract(stDate.month(), "months");
//           stDate = stDate
//             .subtract(stDate.date() - 1, "days")
//             .format("DD MMM YYYY");
//           endDate = endDate.add(11 - endDate.month(), "months");
//           endDate = endDate
//             .add(endDate.daysInMonth() - endDate.date(), "days")
//             .format("DD MMM YYYY");
//           break;
//       }
//     }

//     // Fetch warehouse utilization data from database
//     let fetchedData: any[] = await sequelize.query(getWareHouseUtilization, {
//       type: QueryTypes.SELECT,
//       replacements: {
//         start_date: stDate,
//         end_date: endDate,
//         ...(filter.site_code.length > 0
//           ? {
//               site_code: filter.site_code,
//             }
//           : { site_code: "" }),
//       },
//     });

//     // Initialize temporary data structure for processing
//     let tempData: {
//       data: { [key: string]: string[] };
//       time: string[];
//     } = {
//       data: {},
//       time: [],
//     };

//     // Process fetched data into required format
//     fetchedData.forEach((eachData) => {
//       if (!!eachData.CAPACITY && !!eachData.SITE_CODE) {
//         tempData.data[eachData.SITE_CODE] = [
//           ...(tempData.data[eachData.SITE_CODE] ?? []),
//           eachData.CAPACITY,
//         ];
//         tempData.time = Array.from(
//           new Set([...tempData.time, eachData.TXN_DATE])
//         );
//       }
//     });

//     // Transform data for response
//     const wareHouseUtilizationData = Object.keys(tempData.data).map(
//       (eachKey) => ({
//         name: eachKey,
//         data: tempData.data[eachKey],
//       })
//     );

//     // Send successful response
//     res.status(200).json({
//       success: true,
//       data: {
//         data: wareHouseUtilizationData,
//         categories: tempData.time,
//       },
//     });
//     return;
//   } catch (error: any) {
//     // Handle and log any errors
//     console.error("Export Error:", error);
//     res.status(400).json({ success: false, message: error.message });
//   }
// };
