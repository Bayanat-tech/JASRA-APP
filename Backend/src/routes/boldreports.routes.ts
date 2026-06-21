import { Router } from "express";
import { BoldReportsController } from "../controllers/BoldReportsController";

const router = Router();
const controller = new BoldReportsController();

router.post("/authorize", controller.authorize);
router.get("/get-report-info", controller.getReportInfo);
router.post("/viewer-settings", controller.getViewerSettings.bind(controller));
router.post(
  "/designer-settings",
  controller.getDesignerSettings.bind(controller)
);

export default router;
