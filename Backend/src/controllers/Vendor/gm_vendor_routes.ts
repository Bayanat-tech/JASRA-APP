import express, { RequestHandler } from "express";
import { createVendor } from "./vendorregistration.controller";
import {
  postLpoRequestHandler,
  getAccountsList,
  getDivisionList,
  getPendingLPOList,
  getPendingLPODetail,
  getdynamicdata,
  checkAccountEmployeeHandler,
  getPartyAccountStatement,
  getPartyOutstanding,
  saveFileVendorHR,
  getInvoiceStatusHandler,
  getTmpAcHeaderWithErpDocNoHandler,
  updateLpoStatusHandler,
  executeRawSql,
  executeRawSqlbody,
  proc_build_dynamic_sql,
  executeVendorInvoicePrintHandler
} from "./vendorupdation.controller";
import { getVendorrequest } from "./getVendorrequest";

const router = express.Router();
console.log("Vendor routes initialized");
router.get("/getVendorrequest/:doc_no", getVendorrequest);
router.post("/postLpoRequestHandler", postLpoRequestHandler);
router.post("/saveFile", saveFileVendorHR as RequestHandler);
router.get("/accounts", getAccountsList);
router.get("/getdynamicdata", getdynamicdata);
router.get("/divisions", getDivisionList);
router.get("/pending-lpo", getPendingLPOList);
router.post("/executeRawSql", executeRawSql,proc_build_dynamic_sql);
router.post("/executeRawSqlbody", executeRawSqlbody);
router.get("/pending-lpo-detail", getPendingLPODetail);
router.get("/checkAccountEmployee", checkAccountEmployeeHandler);
router.get("/party-account-statement", getPartyAccountStatement);
router.get("/party-outstanding", getPartyOutstanding);
router.get("/getInvoiceStatus", getInvoiceStatusHandler);
router.get("/tmp-ac-header-with-erp-doc", getTmpAcHeaderWithErpDocNoHandler);
router.post("/createVendor", createVendor);
router.post("/updateLpoStatus", updateLpoStatusHandler);
router.post("/executeVendorInvoicePrintHandler",executeVendorInvoicePrintHandler);

export default router;
