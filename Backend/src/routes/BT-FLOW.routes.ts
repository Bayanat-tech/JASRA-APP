import * as express from "express";
import passport from "passport";
import {
  getPfMaster,
  deletepfMaster,
} from "../controllers/Purchaseflow_Al/purchaseflow.controller";

import gmPfRouter from "./Purchaseflow_Al/purchaseflow_Al.routes";
import gmpurchaserequestRouter from "./Purchaseflow_Al/transaction/purchaseflow_al_transaction";
import { checkUserAuthorization } from "../middleware/checkUserAthorization";

const router = express.Router();
// Route for transaction operations
router.use(
  "/purchase_request",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  gmpurchaserequestRouter
);

// Route for reports management
// router.use(
//   "/reports",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//
// );

router.get(
  "/:master",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getPfMaster
);

router.use(
  "/Transactions",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  gmPfRouter
);

router.post(
  "/:master",
  passport.authenticate("jwt", { session: false }),
  deletepfMaster
);
export default router;
