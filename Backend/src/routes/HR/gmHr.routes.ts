// Importing necessary modules and controllers
import express from "express";
import {
  upsertLeaveApprovalHandler,
  saveFileHR,
} from "../../jasra/controllers/JS_hr_leave_approval";
import {
  createhrcategory,
  updatehrcategory,
} from "../../controllers/HR/hr_category.controller";
import {
  createKpiName,
  updateKpiName,
} from "../../controllers/HR/hr_kpiName.controller";

import {
  createGrade,
  deleteGrades,
  updateGrade,
} from "../../controllers/HR/grade_hr.controller";

import {
  createDesignation,
  deleteDesignation,
  updateDesignation,
} from "../../controllers/HR/designation_hr.controller";

import {
  createFormaldesignation,
  deleteFormaldesignation,
  updateFormaldesignation,
} from "../../controllers/HR/formaldesignation_hr.controller";
import {
  createKpiOperation,
  updateKpiOperation,
} from "../../controllers/HR/hr_kpiOperationController";

import {
  createhrleavetype,
  updatehrleavetype,
} from "../../controllers/HR/hr_leavetype.controller";
import {
  createhrpaycomponent,
  updatehrpaycomponent,
} from "../../controllers/HR/hr_pay_component.controller";
import {
  createBulkSections,
  createSection,
  deleteSections,
  exportSection,
  updateSection,
} from "../../controllers/HR/hr_section.controller";
import {
  getEmployeesHandler,
  getLeaveBalanceHandler,
  getLeaveEntitleHandler,
  getLeaveHistoryHandler,
  validateLeaveHandler,
  getLeaveRequestsWithErpDocHandler,
  newvalidateLeaveHandler,
  
} from "../../controllers/HR/hr_net.controller";
import { executeRawSql } from "../../controllers/HR/rawSql_hr_controller";
import { getRequestFlowUsers } from "../../controllers/HR/hr_leave_flow_sentback";
import { getJSEmployeesHandler, JSgetLeaveEntitleHandler, JSvalidateLeaveHandler , leaveDaysCntHandler } from "../../jasra/controllers/JS_hr_net.controller";

// Creating an instance of the Express Router
const router = express.Router();

// Defining routes for HR category
// category
router.post("/category", createhrcategory); // Create a new HR category
router.put("/category", updatehrcategory); // Update an existing HR category

// Defining routes for HR category master
router.post("/categorymaster", createhrcategory); // Create a new HR category master
router.put("/categorymaster", updatehrcategory); // Update an existing HR category master

// Defining routes for KPI name
router.post("/kpiname", createKpiName); // Create a new KPI name
router.put("/kpiname", updateKpiName); // Update an existing KPI name

// Defining routes for KPI operation
router.post("/kpioperation", createKpiOperation); // Create a new KPI operation
router.put("/kpioperation", updateKpiOperation); // Update an existing KPI operation

// Defining routes for sections
router.post("/section", createSection); // Create a new section
router.put("/section", updateSection); // Update an existing section
router.post("/section/bulk", createBulkSections); // Create multiple sections in bulk
router.get("/section/export", exportSection); // Export sections
router.post("/section/delete", deleteSections); // Delete sections

// Defining routes for grades
router.post("/grade", createGrade); // Create a new grade
router.put("/grade", updateGrade); // Update an existing grade
router.post("/grade/delete", deleteGrades); // Delete grades
// Defining routes for designations
router.post("/designation", createDesignation); // Create a new designation
router.post("/designation/delete", deleteDesignation); // Delete designations
router.put("/designation", updateDesignation); // Update an existing designation

// Defining routes for formal designations
router.post("/formaldesignation", createFormaldesignation);
router.post("/formaldesignation/delete", deleteFormaldesignation);
router.put("/formaldesignation", updateFormaldesignation);

// Defining routes for leave types
// leavetype
router.post("/leavetype", createhrleavetype);
router.put("/leavetype", updatehrleavetype);

// Defining routes for pay components
// paycomponent
router.post("/paycomponent", createhrpaycomponent);
router.put("/paycomponent", updatehrpaycomponent);

router.put("/upsertLeaveApprovalHandler", upsertLeaveApprovalHandler);

// Save file route
router.post("/saveFile", (req, res, next) => {
  saveFileHR(req, res).catch(next);
});
router.get("/getRequestFlowUsers", getRequestFlowUsers as any );
// HR .NET API routes
router.get("/employees", getEmployeesHandler);
router.get("/leavebalance/:employeeId", getLeaveBalanceHandler);
router.get("/JS_leaveentitle/:employeeId", JSgetLeaveEntitleHandler);
router.get("/leavehistory", getLeaveHistoryHandler);
// router.get("/validateleave", validateLeaveHandler);  
router.get("/validateleave", JSvalidateLeaveHandler);
router.get("/leave-requests-erp-doc", getLeaveRequestsWithErpDocHandler);
router.get('/leaveDaysCount',leaveDaysCntHandler);

//raw sql execution route
router.post("/executeRawSql", executeRawSql); // Raw SQL execution route\

//HR JASRA routes
router.get("/jsemployees", getJSEmployeesHandler);

export default router;
