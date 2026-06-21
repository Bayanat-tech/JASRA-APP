
/**
 * @fileoverview Inbound WMS Routes - Handles all inbound warehouse management system routes
 * @requires express
 * @requires passport
 */

import * as express from "express";
import passport from "passport";
import {
  // getInboundJob,
  // getReports,
  getTallyProductData,
} from "../../../controllers/wms/transaction/inbound/inboundJobWms.controller";
import {
  createBulkPAckingDetails, // Create multiple packing details at once
  createPackingItem, // Create single packing item
  deletePackingItem, // Delete packing item
  exportPackingDetails, // Export packing details
  getPackingDetail, // Get packing details
  updatePackingItem, // Update packing item
  addReceivingDetails, // Add receiving details (qty1_arrived, qty2_arrived)
  updateClearanceStatus, // Update clearance status to 'Y'
} from "../../../controllers/wms/transaction/inbound/packingDetails_wms.controller";
import {
  // createBulkTallyDetails, // Create multiple tally details
  createTallyItem, // Create single tally item
  // deleteTallyItem, // Delete tally item
  // exportTallyDetails, // Export tally details
  // getTallyDetail, // Get tally details
  // updateTallyItem, // Update tally item
} from "../../../controllers/wms/transaction/inbound/tallyDetails_wms.controller";

import {
  createBulkShipmentDetails, // Create multiple shipment details
  createShipmentItem, // Create single shipment item
  deleteShipmentItem, // Delete shipment item
  exportShipmentDetails, // Export shipment details
  getAllShipmentDetails, // Get all shipment details with pagination
  getShipmentDetail, // Get shipment details
  updateShipmentItem, // Update shipment item
} from "../../../controllers/wms/transaction/inbound/shipmentdetails_wms.controller";
import {
  exportPutwayPackingItem, // Export putway packing items
  putwayPackingItem, // Update putway packing item
} from "../../../controllers/wms/transaction/inbound/putwayPackingItem_wms.controller";
import { checkUserAuthorization } from "../../../middleware/checkUserAthorization"; // Middleware for user authorization
// import { updateQualityclearance } from "../../../controllers/wms/transaction/inbound/qualityClearance_wms.controller";
import createinboundjobWms from "../../../views/wms/transportation/inbound/createinboundJobWms";
import {executeRawSql, executeRawSqlbody, proc_build_dynamic_sql_wms} from "../../../../src/controllers/wms.controller"
import {createInboundjob} from "../../../controllers/wms/transaction/inbound/createinboundJobWms.controller";
 import {Putawaywithpalletid} from "../../../../src/controllers/wms/transaction/inbound/putwaywithtally_wms_controller"
// import  { getddSiteLocation }   from "../../../../src/views/wms/transportation/inbound/ddSiteLocation"
import  {getddPrinceProduct }   from "../../../../src/views/wms/transportation/inbound/ddPrinceProduct"
import {
  getInboundJob, // Get single inbound job
  GetsingleInboundjob, // Update inbound job
} from "../../../controllers/wms/transaction/inbound/createinboundJobWms.controller";
import {
  // getconfirmInboundjob, // Get confirmation details
  confirmInboundjob, // Confirm inbound job
} from "../../../controllers/wms/transaction/inbound/confirminboundjob_wms.controller";
import { createOrUpdateJob } from "../../../controllers/wms/transaction/outbound/createTojob";
//import { upsertTIJobHandler } from "../../../controllers/Purchaseflow/updateinsertti_job";
//import { createOrUpdateJob } from "../../../controllers/wms/transaction/outbound/createTojob";
// import {
//   getconfirmInboundjob, // Get confirmation details
//   confirmInboundjob, // Confirm inbound job
// } from "../../../controllers/wms/transaction/inbound/confirminboundjob_wms.controller";
import {cancelInboundJob} from "../../../controllers/wms/transaction/inbound/createinboundJobWms.controller"
import {upsertPackDetailEDIHandler,getEDIPackdetHandler,copyEDIToPackdetHandler} from "../../../controllers/wms/transaction/inbound/packdet_wms.controller";
import {upsertPutawaymanualOracle} from "../../../controllers/wms/transaction/inbound/manualputaway.controller";
const router = express.Router();

router.put("/upsertPackDetailEDIHandler", upsertPackDetailEDIHandler);
router.get("/getEDIPackdetHandler", getEDIPackdetHandler);
router.post("/copyEDIToPackdetHandler", copyEDIToPackdetHandler);
router.post("/upsertPutawaymanualHandler", async (req, res, next) => {
  try {
    const result = await upsertPutawaymanualOracle(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
router.post('/executeRawSql', executeRawSql);
router.post('/executeRawSqlbody', executeRawSqlbody);
router.post("/proc_build_dynamic_sql_wms", proc_build_dynamic_sql_wms);

// router.get('/getddSiteLocation',getddSiteLocation)

router.get('/getddPrinceProduct',getddPrinceProduct)
// router.get('/getEDIPackdetHandler', getEDIPackdetHandler);
// router.post('/copyEDIToPackdetHandler', copyEDIToPackdetHandler);

// Job routes - Handle individual job operations
router.get(
  "/job/:job_no",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getInboundJob
);

// Update inbound job
router.put(
  "/job/:job_no",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  GetsingleInboundjob
);

// Inbound Job routes - Handle creation and retrieval of inbound jobs
router.post("/inboundjob",createOrUpdateJob);

router.patch("/canceljob", cancelInboundJob)

router.put("/inboundjob",createOrUpdateJob);


//router.put("/inboundjob", GetsingleInboundjob);

// router.put(
//   "/inboundjob",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   GetsingleInboundjob
// );

// --------- Shipment Details---------
router.get("/shipment_details/export", exportShipmentDetails);
router.get(
  "/shipment_details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  getAllShipmentDetails
);
router.post(
  "/shipment_details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  createShipmentItem
);
router.put(
  "/shipment_details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  updateShipmentItem
);
router.post("/shipment_details/bulk", createBulkShipmentDetails);
router.post(
  "/shipment_details/delete",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  deleteShipmentItem
);

// // Packing Details routes - Handle all packing related operations
// router.get("/packing_details/export", exportPackingDetails);
// router.get("/packing_details", getPackingDetail);
router.post(
  "/packing_details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  createPackingItem
);
// router.post("/packing_details/bulk", createBulkPAckingDetails);
// router.post(
//   "/packing_details/delete",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   deletePackingItem
// );
// router.put(
//   "/packing_details/:packdet_no",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   updatePackingItem
// );

// Add receiving details route - Update qty1_arrived and qty2_arrived
router.put(
  "/packing_details/receiving",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  addReceivingDetails
);

// Update clearance status route - Update clearance to 'Y'
router.put(
  "/packing_details/clearance",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  updateClearanceStatus
);

// Tally Details routes - Handle all tally related operations
// router.get("/tally_details/export", exportTallyDetails);
// router.get("/tally_details", getTallyDetail);
router.get("/tally_product_data", getTallyProductData);

router.post(
   "/Putawaywithpalletid",  Putawaywithpalletid
 );


router.post(
  "/tally_details",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  createTallyItem
);
// router.post("/tally_details/bulk", createBulkTallyDetails);
// router.post(
//   "/tally_details/delete",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   deleteTallyItem
// );
// router.put(
//   "/tally_details/:packdet_no/:seq_number",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   updateTallyItem
// );

// Quality Clearance routes - Handle quality clearance operations
// router.put(
//   "/quality_clearance",
//   passport.authenticate("jwt", { session: false }),
//   checkUserAuthorization,
//   updateQualityclearance
// );

// Putway routes - Handle putway operations
router.get("/putway_details/export", exportPutwayPackingItem);
router.put(
  "/putway_details/:job_no",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  putwayPackingItem
);

// Job Confirmation routes - Handle job confirmation operations
// router.get("/job_confirmation", getconfirmInboundjob);
router.put(
  "/job_confirmation/:job_no", // This expects `job_no` as a URL parameter
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  confirmInboundjob
);

// --------- Reports ---------
router.get(
  "/report/grn",
  passport.authenticate("jwt", { session: false }),
  checkUserAuthorization,
  // getReports
);

export default router;