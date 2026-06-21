// // controllers/Product/productget.controller.ts
// import { Request, Response } from "express";
// import { sequelize } from "../../database/connection";
// import { QueryTypes } from "sequelize";

// export const getProductAvailability = async (req: Request, res: Response) => {
//   const { company_code, prod_code } = req.query;

//   console.log("Received query parameters:", { company_code, prod_code });

//   if (!company_code) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required query parameter: company_code",
//     });
//   }

//   try {
//     // Query from VW_PRODUCT_AVL_QTY
//     const productAvailability = await sequelize.query(
//       `
//       SELECT * 
//       FROM VW_PRODUCT_AVL_QTY
//       WHERE COMPANY_CODE = :company_code
//       ${prod_code ? "AND PROD_CODE = :prod_code" : ""}
//       ORDER BY PROD_CODE
//       `,
//       {
//         type: QueryTypes.SELECT,
//         replacements: { company_code, prod_code },
//       }
//     );

//     if (!productAvailability.length) {
//       return res.status(404).json({
//         success: false,
//         message: "No product data found for the given parameters",
//       });
//     }

//     // ✅ Return the array directly in data so frontend grid can consume it
//     res.status(200).json({
//       success: true,
//       data: productAvailability,
//     });
//   } catch (error) {
//     console.error("Error fetching product data:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching product data",
//       error: error instanceof Error ? error.message : error,
//     });
//   }
// };
