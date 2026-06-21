// Import express framework
import * as express from "express";
// Import warehouse dashboard controller for graph data
// import { warehouseDashboard } from "../../controllers/wms/dashboard/dashboard_wns.controller";
// Import warehouse dashboard controller for card data
// import { warehouseDashboardCard } from "../../controllers/wms/dashboard/dashboardCard_wms.controller";

// Initialize express router
const router = express.Router();

// Route to get warehouse graph data
// router.get("/warehouseGraph", warehouseDashboard);
// Route to get warehouse card data
// router.get("/warehouseData", warehouseDashboardCard);

// Export router for use in main application
export default router;
