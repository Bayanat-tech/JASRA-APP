import { IUser } from "../../../interfaces/user.interface";
import express, {
  Request,
  Response,
  RequestHandler,
  NextFunction,
} from "express";
import {
  getPurchaserequest,
  updatePurchaseOrder,
} from "../../../controllers/Purchaseflow/transaction/Purchase_Request/purchaseRequest_pf.Controller";

export interface RequestWithUser extends Request {
  user?: IUser; // Optional user if not always present
}

const router = express.Router();

console.log("gm_purchaserequest.routes.ts");

router.get("/purchaserequest/:request_number", getPurchaserequest);

router.post("/purchaseorder", updatePurchaseOrder);

export default router;
