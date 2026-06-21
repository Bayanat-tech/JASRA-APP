// This is for Almadina
import { IUser } from "../../interfaces/user.interface";
import express, {
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";

//import { getBudgetexcel } from "../../controllers/Purchaseflow_Al/budgetRequest_pf.Controller";
//import { budgetexcelupload } from "../../controllers/Purchaseflow_Al/budgetRequest_pf.Controller";
//import { CheckBudgetStatus } from "../../controllers/Purchaseflow_Al/budgetRequest_pf.Controller";
import passport from "passport";
import { TCostbudget } from "../../interfaces/Purchaseflow/Budgetflow.interface";
//import { handleInsertBudgetCosts } from "../../controllers/Purchaseflow_Al/budgetRequest_pf.Controller";
//import { saveexcelbudgetdata } from "../../controllers/Purchaseflow_Al/budgetRequest_pf.Controller";
export interface RequestWithUser extends Request {
  user?: IUser; // Optional user if not always present
}
import { checkUserAuthorization } from "../../middleware/checkUserAthorization";

import {
  createcostmaster,
  updatecostmaster,
} from "../../controllers/Purchaseflow_Al/costmaster_pf.controller";
import { getLatestRequestNumber } from "../../controllers/Purchaseflow/requestController";
import {
  createOrUpdateBudgetRequestSequential,
  getBudgetRequest,
  fetchPRregisterdata,
} from "../../controllers/Purchaseflow_Al/budgetRequest_pf.Controller";

import {
  checkUserFlow,
  getUserFlowOptions,
} from "../../controllers/Purchaseflow_Al/userFlowController";

import {
  createOrUpdatePurchaseRequestSequential,
  getPurchaserequest,
  updatePurchaseOrder,
} from "../../controllers/Purchaseflow_Al/purchaseRequest_pf.Controller";
import { deletepfMaster } from "../../controllers/Purchaseflow_Al/purchaseflow.controller";
/*import {
  createcostmaster,
  updatecostmaster,
  createOrUpdatePurchaseRequestSequential,
  getPurchaserequest,
  deletepfMaster,
} from "../../controllers/Purchaseflow/purchaseflow.controller";*/

import {
  createitemmaster,
  updateitemmaster,
} from "../../controllers/Purchaseflow/itemmaster_pf.controller";

import {
  createprojectmaster,
  updateprojectmaster,
} from "../../controllers/Purchaseflow/projectmaster_pf.controller";
import {
  createSupplier,
  updateSupplier,
} from "../../controllers/Purchaseflow/supplier_pf_controller";
import { insertBudgetCost } from "../../controllers/Purchaseflow/budgetRequestdbupdate_pf.Controller";

const router = express.Router();

router.post("/costmaster", createcostmaster);
router.put("/costmaster", updatecostmaster);

router.post("/CategoryMaterialmst", createcostmaster);
router.put("/CategoryMaterialmst", updatecostmaster);


router.post("/projectmaster", createprojectmaster);
router.put("/projectmaster", updateprojectmaster);
router.delete("/projectmaster", deletepfMaster); // Changed to DELETE for delete operation

//-----Item Master---------------
router.post("/itemmaster", createitemmaster);
router.put("/itemmaster", updateitemmaster);

// ------------------Supplier Master ------------------

router.post("/suppliermaster", createSupplier);
router.put("/suppliermaster", updateSupplier);

//-----Purchase Request-----------
router.get("/purchaserequest/:request_number", getPurchaserequest);
// Define the route
router.get("/fetchPRregisterdata", fetchPRregisterdata);
//below is to get data from temp_load and display on the screen.
//router.get("/excebudget/:request_number", getBudgetexcel);
//router.post("/CheckbudgetStatus", CheckBudgetStatus);

router.get(
  "/budgetrequest/:request_number/:cost_code?",
  passport.authenticate("jwt", { session: false }), // Authentication middleware
  checkUserAuthorization, // Authorization middleware
  getBudgetRequest as unknown as RequestHandler // Cast to `unknown` first, then `RequestHandler`
);

console.log("inside purchase router");

//router.post("/budgetrequest/cost", handleInsertBudgetCosts);
router.post("/purchaserequest", createOrUpdatePurchaseRequestSequential);
router.post("/budgetrequest", createOrUpdateBudgetRequestSequential);
router.post("/purchaseorder", updatePurchaseOrder);

// Route to check the flow count for a specific user
router.get("/check/:userCode", checkUserFlow);
router.get("/fetchNewRequestNumber", getLatestRequestNumber);

// Route to fetch available flow options for a specific user
router.get("/flow_options/:userCode", getUserFlowOptions);
//router.post("/budgetexcelupload", budgetexcelupload);

//router.post("/saveexcelbudgetdata", saveexcelbudgetdata);

export default router;
