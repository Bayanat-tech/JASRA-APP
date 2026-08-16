// Import required modules and dependencies
import * as express from "express";
import passport from "passport";
import { getWmsMaster, deleteWmsMaster } from "../controllers/wms.controller";
import gmWmsRouter from "./wms/gm_wms.routes";
import dashboardRouter from "./../routes/wms/dashboard_wms.routes";
import jobInboundRouter from "./wms/transaction/inbound_wms.routes";
import stocktransferWmsRouter from "./wms/transaction/stocktransfer_wms.routes";
import stockAdjustmentRouter from "./StockAdjustment/stockAdjustment.routes";
import jobOutboundRouter from "./wms/transaction/outbound_wms.routes";
import {
  getAllReports,
} from "../controllers/wms/transaction/inbound/allReport_wms.controller";
import { checkUserAuthorization } from "../middleware/checkUserAthorization";
import stockReportCriteria from "./wms/reports/stockCriteria_wms.routes";
import budgetStatusRouter from "./budgetStatus.routes"; // ⬅️ adjust path if needed

const router = express.Router();

// Route to get all inbound reports
router.get(
  "/inbound-reports",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getAllReports
);

// Route for outbound operations
router.use(
  "/outbound",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  jobOutboundRouter
);

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

// ─────────────────────────────────────────────────────────────
// Budget Status Report  →  GET /api/wms/budget-status
// Must be registered BEFORE the "/:master" catch-all below
// ─────────────────────────────────────────────────────────────
router.use(
  "/",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  budgetStatusRouter
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

// Route to get WMS master data by parameter  (catch-all — keep last)
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

export default router;