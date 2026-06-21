import * as express from "express";
import {
  createAccountChildrenAcTreeNode,
  createLevel3AcTreeNode,
  createLevel4AcTreeNode,
  deleteAccountItem,
  getAccountChildrenAcTreeNode,
  getAcTree,
  getLevel3AcTreeNode,
  getLevel4AcTreeNode,
  updateAccountChildrenAcTreeNode,
  updateLevel3AcTreeNode,
  updateLevel4AcTreeNode,
} from "../../../controllers/finance/accounts/masters/acTree_finance.controller";

const router = express.Router();

//--------------------AC-Tree----------------
// Get the entire account tree
router.get("/ac_tree", getAcTree);

//------l3------
// Get, create, and update Level 3 account tree nodes
router.get("/ac_tree/level3/:ac_code", getLevel3AcTreeNode);
router.post("/ac_tree/level3", createLevel3AcTreeNode);
router.put("/ac_tree/level3/:ac_code", updateLevel3AcTreeNode);

//------l4------
// Get, create, and update Level 4 account tree nodes
router.get("/ac_tree/level4/:ac_code", getLevel4AcTreeNode);
router.post("/ac_tree/level4", createLevel4AcTreeNode);
router.put("/ac_tree/level4/:ac_code", updateLevel4AcTreeNode);

//------level5------
// Get, create, and update account children nodes
router.get("/ac_tree/account/:ac_code", getAccountChildrenAcTreeNode);
router.post("/ac_tree/account", createAccountChildrenAcTreeNode);
router.put("/ac_tree/account/:ac_code", updateAccountChildrenAcTreeNode);

//----------------delete----------
// Delete an account item based on level
router.delete("/ac_tree/:level", deleteAccountItem);

export default router;

