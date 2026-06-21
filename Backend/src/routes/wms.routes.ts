// Import required modules and dependencies
import * as express from "express";
import passport from "passport";
import { getWmsMaster, deleteWmsMaster } from "../controllers/wms.controller";
import gmWmsRouter from "./wms/gm_wms.routes";
import dashboardRouter from "./../routes/wms/dashboard_wms.routes";
import jobInboundRouter from "./wms/transaction/inbound_wms.routes";
import stocktransferWmsRouter from "./wms/transaction/stocktransfer_wms.routes";
import stockAdjustmentRouter from "./StockAdjustment/stockAdjustment.routes";
//import jobOutboundRouter from "./wms/transaction/outbound_wms.routes";
import jobOutboundRouter from "./wms/transaction/outbound_wms.routes"; // ✅ CORRECT
import {
  getAllReports,
  // getAllOutboundReports,
  // getAllVendorReports,
  // getAllEmployeeReports,
  // getAllDynamicReports,
} from "../controllers/wms/transaction/inbound/allReport_wms.controller";
import { checkUserAuthorization } from "../middleware/checkUserAthorization";
import stockReportCriteria from "./wms/reports/stockCriteria_wms.routes";

// Initialize Express Router
const router = express.Router();

// Route to get all inbound reports
router.get(
  "/inbound-reports",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getAllReports
);

// Route to get all outbound reports
// router.get(
//   "/outbound-reports",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   getAllOutboundReports
// );

//route for vendor reports
// router.get(
//   "/vendor-reports",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   getAllVendorReports
// );

// //route for Employee reports
// router.get(
//   "/employee-reports",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   getAllEmployeeReports
// );

// //route for Dynamic reports
// router.get(
//   "/dynamic-reports",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   getAllDynamicReports
// );

// Route for outbound operations
router.use(
  "/outbound",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  jobOutboundRouter
);

//console.log(router.use);

// Route for inbound operations
router.use(
  "/inbound",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  jobInboundRouter
);

// Route for reports management
router.use(
  "/reports",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  stockReportCriteria
);

// Route for general management operations
router.use(
  "/gm",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  gmWmsRouter
);
router.use(
  "/stocktransfer",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  stocktransferWmsRouter
);

// Route for dashboard operations
router.use(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  dashboardRouter
);

// Route for stock adjustment operations
router.use(
  "/stock-adjustment",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  stockAdjustmentRouter
);

// Route to get WMS master data by parameter
router.get(
  "/:master",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getWmsMaster
);

// Route to delete WMS master data
router.post(
  "/:master",
  passport.authenticate("jwt", { session: false }),
  deleteWmsMaster
);

// Export router for use in main application
export default router;
