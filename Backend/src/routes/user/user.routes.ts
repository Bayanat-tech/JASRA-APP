// Importing necessary modules and controllers
import * as express from "express";
import { updateLanguagePreference } from "../../controllers/user/user.controller";
import passport from "passport";

// Creating a new instance of the Express Router
const router = express.Router();

// Defining a PUT route to edit language preference
// This route is protected by JWT authentication
router.put(
  "/edit_lang_pref", // Route path
  passport.authenticate("jwt", { session: false }), // JWT authentication middleware
  updateLanguagePreference // Controller function to handle the request
);

// Exporting the router as the default module
export default router;
