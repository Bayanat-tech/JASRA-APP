import { IUser } from "../../../interfaces/user.interface";
import express, {
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";
import {
  createOrUpdatePurchaseRequestSequential,
  getPurchaserequest,
  updatePurchaseOrder,
} from "../../../controllers/Purchaseflow_Al/purchaseRequest_pf.Controller";

export interface RequestWithUser extends Request {
  user?: IUser; // Optional user if not always present
}

const router = express.Router();

router.get("/purchaserequest/:request_number", getPurchaserequest);

router.post("/purchaserequest", createOrUpdatePurchaseRequestSequential);

router.post("/purchaseorder", updatePurchaseOrder);

export default router;
