// import constants from "../../helpers/constants";
// import { RequestWithUser } from "../../interfaces/common.interface";
// import { IUser } from "../../interfaces/user.interface";
// import { Response } from "express";
// import { PurchaseFlowMasterService } from "../../services/purchaseFlow/PfMaster.service";

// export const getPfMaster = async (
//   req: RequestWithUser, 
//   res: Response
// ): Promise<void> => {
//   try {
//     const { master } = req.params;
//     const requestUser: IUser = req.user;
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 4000;

//     let result: { fetchedData: any[]; totalCount: number } = {
//       fetchedData: [],
//       totalCount: 0,
//     };

//     switch (master) {
//       case "division":
//         result = await PurchaseFlowMasterService.getDivisionMaster(
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;

//       case "cost_master":
//         result = await PurchaseFlowMasterService.getCostMaster (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;

//       case "matcat_master":
//         result = await PurchaseFlowMasterService.getMaterialCategoryMaster (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;

//       case "supplier_master":
//         result = await PurchaseFlowMasterService.getSupplierMaster (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;

//       case "customer_master":
//         result = await PurchaseFlowMasterService.getCustomerMaster (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;

//       case "ddCurrency":
//         result = await PurchaseFlowMasterService.getddcurrency (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;

//       case "ddMaterialCateotry":
//          result = await PurchaseFlowMasterService.ddMaterialCateotry (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;
      
//       case "item_master":
//         result = await PurchaseFlowMasterService.getItemmaster (
//           requestUser.company_code,
//           page,
//           limit
//         );
//         break;
 
//     }

//     res.status(constants.STATUS_CODES.OK).json({
//       success: true,
//       data: result.fetchedData,
//       total: result.totalCount,
//       message: "data fetched successfully.",
//     });
//   } catch (error) {
//     console.error("Error in getPfMaster:", error);
//     res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: "Error fetching master data.",
//     });
//   }
// };