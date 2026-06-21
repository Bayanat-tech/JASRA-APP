import { IUser } from "../../interfaces/user.interface";

import express, {
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";
//import { cancelFinalApproval Fetchmessagebox } from "../../controllers/Purchaseflow/purchaseRequest_pf.Controller";
import { CheckCostcontroller } from "./../../../src/controllers/Purchaseflow/checkcostcontoller";

import {
  upsertAMCDetails  
  } from "../../controllers/Purchaseflow/update_requestAMCdata"
//import { getBudgetexcel } from "../../controllers/Purchaseflow/budgetRequest_pf.Controller";
//import { budgetexcelupload } from "../../controllers/Purchaseflow/budgetRequest_pf.Controller";
//import { CheckBudgetStatus } from "../../controllers/Purchaseflow/budgetRequest_pf.Controller";
import passport from "passport";
import { TCostbudget } from "../../interfaces/Purchaseflow/Budgetflow.interface";
//import { handleInsertBudgetCosts } from "../../controllers/Purchaseflow/budgetRequest_pf.Controller";
import { saveExcelBudgetData } from "../../controllers/Purchaseflow/saveexcelbudgetdata";
export interface RequestWithUser extends Request {
  user?: IUser; // Optional user if not always present
}
import { checkUserAuthorization } from "../../middleware/checkUserAthorization";
import { CostmasterController } from "../../controllers/Purchaseflow/pf_costmaster.controller";
import { getddProductMaster } from "../../controllers/Purchaseflow/getdddivisiondata_pf.cotroller";

import {proc_build_dynamic_sql} from "../../controllers/Purchaseflow/proc_build_dynamic_sql"
import { getPurchaserequest } from "../../controllers/Purchaseflow/getPurchaserequest.controller";
import { fetchRequestNoFromGTSession } from "../../controllers/Purchaseflow/fetchRequestNoFromGTSession";
import { FetchGenPOString } from "../../controllers/Purchaseflow/FetchGenPOString";
import { updatePrintSignatureInfo } from "../../controllers/Purchaseflow/updateprintSignatureinfo";
import { updateReasonForPO } from "../../controllers/Purchaseflow/updateReasonForPO";
import { cancelFinalApproval } from "../../controllers/Purchaseflow/cancelFinalApproval";
import { fetchPOlisting } from "../../controllers/Purchaseflow/fetchPOlisting";
import { handleSaveExpSamt } from "../../controllers/Purchaseflow/handleSaveExpSamt";
import { handleGenerateExpenseAdj } from "../../controllers/Purchaseflow/handleGenerateExpenseAdj";
import { fetchCostwisebudgetAllocation } from "../../controllers/Purchaseflow/fetchCostwisebudgetAllocation";
import { CheckBudgetStatus } from "../../controllers/Purchaseflow/CheckBudgetStatus";
import { getBudgetexcel } from "../../controllers/Purchaseflow/getBudgetexcel";
import { fetchUserlevel } from "../../controllers/Purchaseflow/fetchUserlevel";
import { createOrUpdatePurchaseRequestSequential } from "../../../src/controllers/Purchaseflow/createOrUpdatePurchaseRequestSequential"
import { updateCancelRejectSentBack } from "../../controllers/Purchaseflow/updatecancelrejectsentBack";
import { updatePurchaseOrder } from "../../controllers/Purchaseflow/updatePurchaseOrder";
import { budgetExcelUpload } from "../../controllers/Purchaseflow/budgetexcelupload";
import { Fetchmessagebox } from "../../controllers/Purchaseflow/Fetchmessagebox.controller";
import { handleInsertBudgetCosts } from "../../controllers/Purchaseflow/handleInsertBudgetCosts";
import {getBudgetRequest} from "../../controllers/Purchaseflow/getBudgetRequest"
import { createOrUpdateBudgetRequestSequential } from "../../controllers/Purchaseflow/createOrUpdateBudgetRequestSequential";
import { SupplierMasterController } from "../../controllers/Purchaseflow/pf_suppiler.controller";

//import { createOrUpdatePurchaseRequestSequential } from "../../controllers/Purchaseflow/createOrUpdatePurchaseRequestSequential";
// import {
//   createcostmaster,
//   updatecostmaster,
// } from "../../controllers/Purchaseflow/costmaster_pf.controller";

// import {
//   creatematerialcategory,
//   updatematerialcategory,
//   deletematerialcategory,
// } from "../../controllers/Purchaseflow/material_category_pf_controller";

// import {
//   createOrUpdateBudgetRequestSequential,
//   getBudgetRequest,
// } from "../../controllers/Purchaseflow/budgetRequest_pf.Controller";
// import { getMaterialRequestNumber } from "../../controllers/Purchaseflow/materialRequest_pf.Controller";
// import {
//   createOrUpdateMaterialRequestSequential,
//   MaterialRequestListing
//   } from "../../controllers/Purchaseflow/materialRequest_pf.Controller";
// import {
//   createOrUpdatePurchaseRequestSequential,



//   getPurchaserequest,
//   updatePurchaseOrder,
//   getPurchaseRequestLog,
//   fetchPRregisterdata,
//   fetchPOregisterdata,
//   fetchRequestNoFromGTSession,
//   fetchUserlevel,
//   bugetcurstatusprojectwiseconsolidated,
//   CheckCostcontroller,
  //Fetchmessagebox,
//   FetchGenPOString,
//   fetchProjectwisebudgetAllocation,
//   fetchCostwisebudgetAllocation,
//   fetchPurchaseRecovery,
//   updatecancelrejectsentBack,
//   fetchPOlisting,
// } from "../../controllers/Purchaseflow/purchaseRequest_pf.Controller";
// import {
//   getddProjectMaster,
//   getddProductMaster,
// } from "../../controllers/Purchaseflow/getdddivisiondata_pf.cotroller";

import { getDashboardData } from "../../controllers/Purchaseflow/getDashboardData_pf_controller";

// import {
//   updateReasonForPO,
//   updatePrintSignatureInfo,
// } from "../../controllers/Purchaseflow/purchaseRquestdbupdate_pf.Controller";
// import { UpdPurchaseRecoveryData } from "../../controllers/Purchaseflow/purchaserecovery_pf.controller";
// import { deletepfMaster } from "../../controllers/Purchaseflow/purchaseflow.controller";
// import { getPfglobalseearch } from "../../controllers/Purchaseflow/purchaseflow.globalserch.controller";
// /*import {
//   createcostmaster,
//   updatecostmaster,
//   createOrUpdatePurchaseRequestSequential,
//   getPurchaserequest,
//   deletepfMaster,
// } from "../../controllers/Purchaseflow/purchaseflow.controller";*/

// import {
//   createitemmaster,
//   updateitemmaster,
// } from "../../controllers/Purchaseflow/itemmaster_pf.controller";

// import {
//   createprojectmaster,
//   updateprojectmaster,
// } from "../../controllers/Purchaseflow/projectmaster_pf.controller";
// import {
//   createSupplier,
//   updateSupplier,
// } from "../../controllers/Purchaseflow/supplier_pf_controller";

// import {
//   createcustomer,
//   updatecustomer,
// } from "../../controllers/Purchaseflow/customermaster_pf.controller";

 import { saveFile } from "../../controllers/Purchaseflow/purchaseRequest_pf.Controller";

const router = express.Router();

router.post("/costmaster", CostmasterController.createcostmaster);
router.put("/costmaster", CostmasterController. updatecostmaster);
router.post("/proc_build_dynamic_sql", proc_build_dynamic_sql);

 router.post("/cancelFinalApproval", cancelFinalApproval);
// router.post("/CatMatMaster", creatematerialcategory);
// router.put("/CatMatMaster", updatematerialcategory);
// router.delete("/CatMatMaster", deletematerialcategory);

// router.post("/projectmaster", createprojectmaster);
// router.put("/projectmaster", updateprojectmaster);
// router.delete("/projectmaster", deletepfMaster);

////-----Item Master---------------
// router.post("/itemmaster", createitemmaster);
// router.put("/itemmaster", updateitemmaster);

// ------------------Supplier Master ------------------

router.post("/suppliermaster",SupplierMasterController.createSuppilerMaster);
router.put("/suppliermaster",SupplierMasterController.updateSuppilerMaster);

// //-----Purchase Request-----------
router.get("/purchaseRequest/:request_number", getPurchaserequest);
// router.get(
//   "/getMaterialRequestNumber/:request_number",
//   getMaterialRequestNumber
// );

// // Define the route

router.get("/getDashboardData", getDashboardData);
// router.get("/getPfglobalsearch/:master", getPfglobalsearch);
// router.get("/fetchPRregisterdata", fetchPRregisterdata);
 router.get("/fetchPOlisting/:request_number", fetchPOlisting);
// router.get("/MaterialRequestListing", MaterialRequestListing);
// router.post("/executeRawSql", executeRawSql);
 router.post("/handleGenerateExpenseAdj", handleGenerateExpenseAdj);
 router.post("/handleSaveExpSamt", handleSaveExpSamt);

// router.get(
//   "/fetchProjectwisebudgetAllocation",
//   fetchProjectwisebudgetAllocation
// );


router.get("/getddProductMaster", getddProductMaster);


router.get("/fetchCostwisebudgetAllocation", fetchCostwisebudgetAllocation);

// //below is to get data from temp_load and display on the screen.
 router.get("/excebudget/:request_number", getBudgetexcel);
 router.post("/CheckbudgetStatus", CheckBudgetStatus);

router.get(
  "/budgetrequest/:request_number/:cost_code?",
    passport.authenticate("jwt", { session: false }),
   checkUserAuthorization,
   getBudgetRequest as unknown as RequestHandler
 );
router.get("/fetchRequestNoFromGTSession", fetchRequestNoFromGTSession);
router.get("/fetchUserlevel", fetchUserlevel);
router.get("/CheckCostcontroller", CheckCostcontroller);
router.get("/Fetchmessagebox", Fetchmessagebox);
router.get("/FetchGenPOString", FetchGenPOString);

router.post("/budgetrequest/cost", handleInsertBudgetCosts);
router.post("/purchaserequest", createOrUpdatePurchaseRequestSequential);
// router.post("/materialrequest", createOrUpdateMaterialRequestSequential);
 router.post("/budgetrequest", createOrUpdateBudgetRequestSequential);
 router.post("/purchaseorder", updatePurchaseOrder);
 router.post("/budgetexcelupload",budgetExcelUpload );
 router.post("/updatecancelrejectsentback", updateCancelRejectSentBack );
// router.post("/UpdPurchaseRecoveryData", UpdPurchaseRecoveryData);
 router.post("/updateReasonForPO", updateReasonForPO);
router.post("/updatePrintSignatureInfo", updatePrintSignatureInfo);

// router.get("/PRlogreport/:requestNumber", getPurchaseRequestLog);

// router.get("/fetchPurchaseRecovery/:type_of_pr", fetchPurchaseRecovery);

 router.post("/saveexcelbudgetdata", saveExcelBudgetData);
 router.post("/saveFile", saveFile as unknown as RequestHandler);

// //------------------CUSTOMER MASTER------------------
// router.post("/customermaster", createcustomer);
// router.put("/customermaster", updatecustomer);



// router.post("/upsertAMCDetails",upsertAMCDetails);
export default router;
