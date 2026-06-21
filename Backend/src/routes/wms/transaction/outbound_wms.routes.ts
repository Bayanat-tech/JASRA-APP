/**
 * Express router for outbound WMS operations
 * @module outbound_wms.routes
 */

import express, { Request, Response, Router } from "express";
import passport from "passport";

import { checkUserAuthorization } from "../../../middleware/checkUserAthorization";

import {getddPrinceCustomer} from "../../../../src/views/wms/transportation/outbound/ddPrinceCustomer"
// Controller imports
import { upsertOutboundOrderDetailManualHandler,getOutboundOrderDetailManualHandler, getAllOrderDetails, getSingleOrderDetail } from "../../../controllers/wms/transaction/outbound/orderEntryManualWMS.controller";
import {upsertEDIOrderDetailHandler,getEDIOrderDetailHandler,copyEDIToOrderDetailHandler} from "../../../controllers/wms/transaction/outbound/orderEntryEDIWms.controller";
import {
  exportPickingDetails,
  exportPickingStockDeatils,
  getPickingItemPreferenceDetails,
  getPickingOption,
  getProductStockDetails,

} from "../../../controllers/wms/transaction/outbound/pickingDetails_wms.controller";
import { pickOrder,confirmorder,oubcancelPick } from "../../../controllers/wms/transaction/outbound/pickingDetails_wms.controller";
import { getOutboundJob, getOutboundJobOrder } from "../../../controllers/wms/transaction/outbound/outboundJobWms.controller";
import { deleteOrderEntry, getAllOrderEntries, getSingleOrderEntry, updateSingleOrderEntry,deleteToOrderDetHandler, getddSiteCode, getddLocationCode, getddLotNum,getTotalAvailableQty } from "../../../controllers/wms/transaction/outbound/orderEntryWms.controller";
import { createToOrder } from "../../../controllers/wms/transaction/outbound/createToOrder";

// Ensure getToOrder uses Express.Request and Express.Response types for compatibility.

// Initialize Express Router

const router = express.Router();

// -----------------------------------------
// Middleware: Protect all routes below
// -----------------------------------------
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkUserAuthorization);

// --------- Job Routes ---------
/**
 * @route GET /job/:job_no
 * @desc Get outbound job details by job number
 */
router.get("/job/:job_no", getOutboundJob);
router.get("/job/:job_no", getOutboundJobOrder);

// --------- Order Entry Routes ---------
/**
/**
 * @route GET /order_entry
 * @desc Get order entry data
 */
router.get("/order_entry", async (req: Request, res: Response) => {
  await getAllOrderEntries(req, res);
});
router.get("/single_order", async (req: Request, res: Response) => {
  await getSingleOrderEntry(req, res);
});
/**
 * @route POST /orders
 * @desc Create a new TO_ORDER entry
 */
router.post('/orders', createToOrder);

/**
 * @route PUT /updateOrder
 * @desc update outbound order entry
 */

router.delete("/deleteToOrderDetHandler", deleteToOrderDetHandler);


router.put("/update_order", async (req: Request, res: Response) => {
  await updateSingleOrderEntry(req, res);
});
/**
 * @route delete /delete
 * @desc delete outbound order entry
 */
router.delete("/delete_order/:id", async (req: Request, res: Response) => {
  await deleteOrderEntry(req, res);
});


// --------- Picking Details Routes ---------
/**
 * @route GET /picking_details/stock_details
 * @desc Get product stock details for picking
 */
router.get("/picking_details/stock_details", getProductStockDetails);

/**
 * @route GET /picking_details/preference
 * @desc Get picking item preference details
 */
router.get("/picking_details/preference", getPickingItemPreferenceDetails);

/**
 * @route GET /picking_details/picking_option
 * @desc Get picking options
 */
router.get("/picking_details/picking_option", getPickingOption);

/**
 * @route PUT /picking_details/pick_order/:job_no
 * @desc Update picking order by job number
 */
console.log(typeof upsertOutboundOrderDetailManualHandler); // should be 'function'
router.put("/picking_details/pick_order/:job_no", pickOrder);
router.put("/picking_details/confirm_order/:job_no", confirmorder);
router.put("/picking_details/oubcancelPick/:job_no", oubcancelPick);

router.put("/upsertOutboundOrderDetailManualHandler", upsertOutboundOrderDetailManualHandler);
router.put("/upsertEDIOrderDetailHandler", upsertEDIOrderDetailHandler);

router.get('/getOutboundOrderDetailManualHandler', getOutboundOrderDetailManualHandler);
router.get('/getAllOrderDetails', getAllOrderDetails);
router.get('/getSingleOrderDetail', getSingleOrderDetail);
router.get('/getEDIOrderDetailHandler', getEDIOrderDetailHandler);
router.post('/copyEDIToOrderDetailHandler', copyEDIToOrderDetailHandler);
router.get('/getddPrinceCustomer',getddPrinceCustomer)
router.get('/getddSiteCode',getddSiteCode)
router.get('/getddLocationCode',getddLocationCode)
router.get('/getddLotNum',getddLotNum)
router.post('/getTotalAvailableQty', getTotalAvailableQty);

/**
 * @route GET /picking_details/export
 * @desc Export picking details
 */
router.get("/picking_details/export", exportPickingDetails);

/**
 * @route GET /picking_details/stock_details/export
 * @desc Export picking stock details
 */
router.get("/picking_details/stock_details/export", exportPickingStockDeatils);

// Export router
export default router;
