// Import the express module and create a new router instance
import * as express from "express";
const router = express.Router();

// Import employee controller functions
import {
  createBulkEmployee, // Create multiple employees in bulk
  createEmployee, // Create a single employee
  exportEmployee, // Export employee data
  getSingleEmployee, // Retrieve a single employee by employee code
  updateEmployee, // Update an existing employee
} from "../../controllers/HR/hr_employee.controller";

// Define routes for employee master management
// -------------- Employee master ----------------
router.post("/employeemaster", createEmployee); // Create a new employee
router.put("/:employeeCode", updateEmployee); // Update an existing employee
router.get("/employeemaster/export", exportEmployee); // Export employee data
router.post("/employeemaster/bulk", createBulkEmployee); // Create multiple employees in bulk
router.get("/:employeeCode", getSingleEmployee); // Retrieve a single employee by employee code


// Export the router instance
export default router;