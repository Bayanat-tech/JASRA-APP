// // --------- Get Ageing Stock Report -----------
// import { Response } from "express";
// import { Op } from "sequelize";
// import { sequelize } from "../../../../database/connection";
// import {
//   ageingStockFormatData,
//   getSearchFilterQuery,
// } from "../../../../helpers/functions";
// import {
//   ISearch,
//   RequestWithUser,
// } from "../../../../interfaces/common.interface";
// import { IUser } from "../../../../interfaces/user.interface";
// import AgeingReportView from "../../../../models/wms/reports/stockCriteria/ageing_report_view.model";
// import MsCompanyInfo from "../../../../models/wms/reports/stockCriteria/ms_company_info.interface";
// import ReportDate from "../../../../models/wms/reports/stockCriteria/report_date.model";

// // --------- Get Ageing Stock Report -----------
// export const getAgeingStockReport = async (
//   req: RequestWithUser,
//   res: Response
// ) => {
//   try {
//     const requestUser: IUser = req.user;
//     const { date_to, age_1, age_2, age_3, age_4, age_5 } = req.query;
//     const filter: ISearch = req.query.filter
//       ? JSON.parse(req.query.filter)
//       : {};

//     let outsideQuery = {
//       [Op.and]: [{ company_code: requestUser.company_code }],
//     };

//     outsideQuery = getSearchFilterQuery({
//       insideQuery: [],
//       filter: filter.search,
//       outsideQuery,
//     });
//     await MsCompanyInfo.update(
//       { age_1, age_2, age_3, age_4, age_5 },
//       { where: { company_code: requestUser.company_code } }
//     );
//     await ReportDate.update({ date_to }, { where: {} });
//     // Build sequelize query with aggregations and filtering
//     const ageingStockReport = await AgeingReportView.findAll({
//       attributes: [
//         "COMPANY_CODE",
//         "PRIN_CODE",
//         "PRIN_NAME",
//         [
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               `CASE WHEN FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) < MsCompanyInfo.AGE_1 THEN volume ELSE 0 END`
//             )
//           ),
//           "BELOW_AGE1",
//         ],
//         [
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               `CASE WHEN FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) >= MsCompanyInfo.AGE_1 AND FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) < MsCompanyInfo.AGE_2 THEN volume ELSE 0 END`
//             )
//           ),
//           "AGE_1",
//         ],
//         [
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               `CASE WHEN FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) >= MsCompanyInfo.AGE_2 AND FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) < MsCompanyInfo.AGE_3 THEN volume ELSE 0 END`
//             )
//           ),
//           "AGE_2",
//         ],
//         [
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               `CASE WHEN FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) >= MsCompanyInfo.AGE_3 AND FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) < MsCompanyInfo.AGE_4 THEN volume ELSE 0 END`
//             )
//           ),
//           "AGE_3",
//         ],
//         [
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               `CASE WHEN FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) >= MsCompanyInfo.AGE_4 AND FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) < MsCompanyInfo.AGE_5 THEN volume ELSE 0 END`
//             )
//           ),
//           "AGE_4",
//         ],
//         [
//           sequelize.fn(
//             "SUM",
//             sequelize.literal(
//               `CASE WHEN FLOOR(AgeingReportView.TXN_DATE - ReportDate.DATE_TO) >= MsCompanyInfo.AGE_5 THEN volume ELSE 0 END`
//             )
//           ),
//           "ABOVE_AGE5",
//         ],
//         [sequelize.fn("MAX", sequelize.col("MsCompanyInfo.age_1")), "d_age1"],
//         [sequelize.fn("MAX", sequelize.col("MsCompanyInfo.age_2")), "d_age2"],
//         [sequelize.fn("MAX", sequelize.col("MsCompanyInfo.age_3")), "d_age3"],
//         [sequelize.fn("MAX", sequelize.col("MsCompanyInfo.age_4")), "d_age4"],
//         [sequelize.fn("MAX", sequelize.col("MsCompanyInfo.age_5")), "d_age5"],
//       ],
//       include: [
//         {
//           model: MsCompanyInfo,
//           attributes: [],
//         },
//         {
//           model: ReportDate,
//           attributes: [],
//         },
//       ],
//       where: {
//         ...outsideQuery,
//       },
//       group: ["AgeingReportView.COMPANY_CODE", "PRIN_CODE"],
//     });
//     if (!!ageingStockReport) {
//       let StructuredResult = ageingStockFormatData(ageingStockReport);
//       res.status(200).json({
//         success: true,
//         data: StructuredResult,
//       });
//       return;
//     }
//   } catch (error: any) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
