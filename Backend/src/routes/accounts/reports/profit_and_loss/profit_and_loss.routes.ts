// Import the necessary modules
import * as express from "express";

// Import the middleware function to check user authorization
import { checkUserAuthorization } from "../../../../middleware/checkUserAthorization";

// Import the passport module
import passport from "passport";

// Import the function to get the profit and loss report
import { getProfitAndLossReport } from "../../../../controllers/accounts/reports/profit_and_loss/profit_and_loss.controller";

// Initialize an Express router
const router = express.Router();

// Define a GET route for fetching profit and loss report
// This route is protected and requires JWT authentication and user authorization
router.get(
  "/",
  
  // Use the passport.authenticate middleware to authenticate the user
  passport.authenticate("jwt", { session: false }),
  
  // Use the checkUserAuthorization middleware to check if the user is authorized to access this route
  checkUserAuthorization,
  
  // Call the getProfitAndLossReport function to handle the request
  getProfitAndLossReport
);

// Export the router for use in other parts of the application
export default router;