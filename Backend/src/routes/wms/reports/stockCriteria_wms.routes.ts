import * as express from "express"; // Importing the Express framework for building web applications.
import { checkUserAuthorization } from "../../../middleware/checkUserAthorization"; // Importing middleware to check user authorization.
import passport from "passport"; // Importing Passport for authentication.
// import { getStockDetailsReport } from "../../../controllers/wms/reports/stockCriteria/stock_details.controller"; // Importing the controller for handling stock details report requests.
// import { getSummaryStockReport } from "../../../controllers/wms/reports/stockCriteria/summary_stock.controller"; // Importing the controller for handling summary stock report requests.
// import { getAgeingStockReport } from "../../../controllers/wms/reports/stockCriteria/ageing_stock.controller"; // Importing the controller for handling ageing stock report requests.
const router = express.Router(); // Creating a new router instance.

// ----------- stock details report ------------
// Route to get stock details report
// router.get(
//   "/stock-criteria/detailstock",
//   passport.authenticate("jwt", { session: false }), // Authenticate using JWT without session
//   checkUserAuthorization, // Middleware to check if the user is authorized
//   getStockDetailsReport // Controller function to handle the request
// );

// ---------- summary report ------------
// Route to get summary stock report
// router.get(
//   "/stock-criteria/summarystock",
//   passport.authenticate("jwt", { session: false }), // Authenticate using JWT without session
//   checkUserAuthorization, // Middleware to check if the user is authorized
//   getSummaryStockReport // Controller function to handle the request
// );

// ---------- Ageing Report ---------
// Route to get ageing stock report
// router.get(
//   "/stock-criteria/aging",
//   passport.authenticate("jwt", { session: false }), // Authenticate using JWT without session
//   getAgeingStockReport // Controller function to handle the request
// );

export default router; // Exporting the router to be used in other parts of the application.
