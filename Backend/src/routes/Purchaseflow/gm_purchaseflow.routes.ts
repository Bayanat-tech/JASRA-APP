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

import { getDashboardData } from "../../controllers/Purchaseflow/getDashboardData_pf_controller";

import { saveFile } from "../../controllers/Purchaseflow/purchaseRequest_pf.Controller";

// ── Budget Status / common dynamic SQL (manager: register here) ──────────────
import {
  proc_build_dynamic_sql_common,
  
} from "../../controllers/common/common_controller"; // adjust path if your folder differs

import {procBuildCommonProcedurewmc} from '../../controllers/common/common_controller'

const router = express.Router();

router.post("/costmaster", CostmasterController.createcostmaster);
router.put("/costmaster", CostmasterController.updatecostmaster);
router.post("/proc_build_dynamic_sql", proc_build_dynamic_sql);

// Budget Status Summary — uses PROC_BUILD_DYNAMIC_SQL_common → BSTATUS_*
router.post(
  "/proc_build_dynamic_sql_common",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  proc_build_dynamic_sql_common
);

router.post("/cancelFinalApproval", cancelFinalApproval);

router.post("/suppliermaster", SupplierMasterController.createSuppilerMaster);
router.put("/suppliermaster", SupplierMasterController.updateSuppilerMaster);

router.get("/purchaseRequest/:request_number", getPurchaserequest);

router.get("/getDashboardData", getDashboardData);
router.get("/fetchPOlisting/:request_number", fetchPOlisting);
router.post("/handleGenerateExpenseAdj", handleGenerateExpenseAdj);
router.post("/handleSaveExpSamt", handleSaveExpSamt);

router.get("/getddProductMaster", getddProductMaster);

router.get("/fetchCostwisebudgetAllocation", fetchCostwisebudgetAllocation);

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
router.post("/budgetrequest", createOrUpdateBudgetRequestSequential);
router.post("/purchaseorder", updatePurchaseOrder);
router.post("/budgetexcelupload", budgetExcelUpload);
router.post("/updatecancelrejectsentback", updateCancelRejectSentBack);
router.post("/updateReasonForPO", updateReasonForPO);
router.post("/updatePrintSignatureInfo", updatePrintSignatureInfo);
router.post("/proc_build_dynamic_ins_upd_common", procBuildCommonProcedurewmc)
router.post("/saveexcelbudgetdata", saveExcelBudgetData);
router.post("/saveFile", saveFile as unknown as RequestHandler);

export default router;