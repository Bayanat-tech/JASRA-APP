// // controllers/StockTransfer/stocktransferget.controller.ts

// import { Request, Response } from "express";
// import { sequelize } from "../../database/connection";
// import { QueryTypes } from "sequelize";

// export const getTSSTNWithDetails = async (req: Request, res: Response) => {
//   const { stn_no, company_code, prin_code } = req.query;

//   console.log("Received query parameters:", { stn_no, company_code, prin_code });

//   if (!stn_no || !company_code || !prin_code) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "Missing required query parameters: stn_no, company_code, or prin_code",
//     });
//   }

//   try {
//     // Fetch TS_STN Header
// const header = await sequelize.query(
//   `SELECT * 
//    FROM TS_STN 
//    WHERE COMPANY_CODE = :company_code
//      AND PRIN_CODE IN ('10001', '10004')
//    ORDER BY PRIN_CODE, STN_NO`,
//   {
//     type: QueryTypes.SELECT,
//     replacements: { company_code },
//   }
// );


//     // Fetch TS_STNDETAIL Items
// let details = [];
// if (stn_no) {
//   details = await sequelize.query(
//     `SELECT * 
//      FROM TS_STNDETAIL 
//      WHERE STN_NO = :stn_no
//        AND COMPANY_CODE = :company_code
//        AND PRIN_CODE IN ('10001', '10004')`,
//     {
//       type: QueryTypes.SELECT,
//       replacements: { stn_no, company_code },
//     }
//   );
// }


//     if (!header.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No STN record found for the given parameters",
//       });
//     }

//     // Always return header + details
//     res.status(200).json({
//       success: true,
//       data: {
//         header
       
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching TS_STN data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching TS_STN data",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };
