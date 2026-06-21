// Import required modules and controllers
import * as express from "express";
import passport from "passport";
import { deleteHrMaster, getHrMaster } from "../controllers/hr.controller";
import hrGmRoutes from "./HR/gmHr.routes";
import employeeHrRoutes from "./HR/employeHr.routes";
import { checkUserAuthorization } from "../middleware/checkUserAthorization";

// Initialize the Express router
const router = express.Router();

console.log("HR Routes Loaded");

// Define a common GET API endpoint to retrieve HR master data based on the master name
router.get(
  "/:masters",
  // Authenticate the request using JWT and disable session
  passport.authenticate("jwt", { session: false }),
  // Check user authorization
  checkUserAuthorization,
  // Call the getHrMaster controller function to handle the request
  getHrMaster
);

// Define a route for GM HR-related endpoints
router.use(
  "/gm",
  // Authenticate the request using JWT and disable session
  passport.authenticate("jwt", { session: false }),
  // Check user authorization
  checkUserAuthorization,
  // Mount the hrGmRoutes router
  hrGmRoutes
);

// Define a route for employee HR-related endpoints
router.use(
  "/employee",
  // Authenticate the request using JWT and disable session
  passport.authenticate("jwt", { session: false }),
  // Check user authorization
  checkUserAuthorization,
  // Mount the employeeHrRoutes router
  employeeHrRoutes
);

// Define a DELETE API endpoint to delete HR master data
router.delete(
  "/leavetype/delete",
  // Authenticate the request using JWT and disable session
  passport.authenticate("jwt", { session: false }),
  // Check user authorization
  checkUserAuthorization,
  // Call the deleteHrMaster controller function to handle the request
  deleteHrMaster
);

// Define a POST API endpoint to create HR master data
router.post(
  "/:master",
  // Authenticate the request using JWT and disable session
  passport.authenticate("jwt", { session: false }),
  // Call the deleteHrMaster controller function to handle the request (Note: This might be a typo and should be a createHrMaster function)
  deleteHrMaster
);

//JASRA routes 
router.get(
  "/JASRA/:masters",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getHrMaster
);


// Export the router as the default module
export default router;
