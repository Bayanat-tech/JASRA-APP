import * as express from "express";
import passport from "passport";

import gmVendorRouter from "./../../src/controllers/Vendor/gm_vendor_routes";

import { checkUserAuthorization } from "../middleware/checkUserAthorization";
const router = express.Router();

router.use(
  "/gm",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  gmVendorRouter
);

export default router;
