import * as express from "express";
import { checkUserAuthorization } from "../../../../middleware/checkUserAthorization";
import passport from "passport";
import {
  getAccountDetails,
  getAgeingStockReportAccount,
} from "../../../../controllers/accounts/reports/ageing/ageing.controller";
import { getGroupAccountDetails } from "../../../../controllers/accounts/reports/ageing/ageing.controller";
import getProfitAndLossRouter from "../profit_and_loss/profit_and_loss.routes";
// Initialize an Express router
const router = express.Router();

// -------- Get Account Details -----------
// Define a GET route for fetching account details
// This route is protected and requires JWT authentication and user authorization
router.get(
  "/account-details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getAccountDetails
);

// --------- Get Group Account Details -----------
// Define a GET route for fetching group account details
// This route is protected and requires JWT authentication and user authorization
router.get(
  "/group-account-details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getGroupAccountDetails
);

// ---------- Get ageing Account Details Accounts --------
// Define a GET route for fetching ageing account details based on periods
// This route is protected and requires JWT authentication and user authorization
router.get(
  "/period-wise",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getAgeingStockReportAccount
);

// Define a route for handling profit and loss related requests
// This route uses a separate router defined in 'profit_and_loss.routes.ts'
// It is also protected and requires JWT authentication and user authorization
router.use(
  "/profit-and-loss",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getProfitAndLossRouter
);
// Export the router for use in other parts of the application
export default router;
