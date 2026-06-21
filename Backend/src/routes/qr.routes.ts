import * as express from "express";
import {
  getQRStatus,
  validateQRWithParameters,
} from "../controllers/qr.controller";

/**
 * Public QR Routes - No Authentication Required
 */
const router = express.Router();
router.get("/validate", validateQRWithParameters);
router.get("/status", getQRStatus);

export default router;
