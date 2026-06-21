import * as express from "express";
import { RequestHandler } from "express";
import {
  createcompanymaster,
  updatecompanymaster,
} from "../../controllers/SMS/company_sms.controller";
import {
  createservicemaster,
  updateservicemaster,
} from "../../controllers/SMS/service_sms.controller";
import {
  createsegmentmaster,
  updatesegmentmaster,
} from "../../controllers/SMS/segment_sms.controller";
import {
  createsalesmaster,
  updatesalesmaster,
} from "../../controllers/SMS/sales_sms.controller";
import {
  createreasonmaster,
  updatereasonmaster,
} from "../../controllers/SMS/reason_sms.controller";
import {
  createdealmaster,
  updatedealmaster,
} from "../../controllers/SMS/dealstatus_sms_controller";
import {
  createprobabilitymaster,
  updateprobabilitymaster,
} from "../../controllers/SMS/dealProbability_sms_controller";
import {
  batchCreateSalesRequest,
  batchUpdateSalesRequest,
} from "../../controllers/SMS/Transaction/salesRequest_sms.controller";

const router = express.Router();

//SMS company master routes
router.post("/company_master", createcompanymaster);
router.put("/company_master", updatecompanymaster);

//SMS Service master routes
router.post("/service_master", createservicemaster);
router.put("/service_master", updateservicemaster);

//sms segment master routes
router.post("/segment_master", createsegmentmaster);
router.put("/segment_master", updatesegmentmaster);

//sms sales master routes
router.post("/sales_master", createsalesmaster);
router.put("/sales_master", updatesalesmaster);

//sms reason master routes
router.post("/reason_master", createreasonmaster);
router.put("/reason_master", updatereasonmaster);

//sms deal master routes
router.post("/deal_master", createdealmaster);
router.put("/deal_master", updatedealmaster);

//sms probability master routes
router.post("/probability_master", createprobabilitymaster);
router.put("/probability_master", updateprobabilitymaster);

//sms Sales Request master routes
router.post("/sales_request", (req, res, next) => {
  (
    batchCreateSalesRequest as unknown as (
      req: express.Request,
      res: express.Response
    ) => Promise<any>
  )(req, res).catch(next);
});

router.patch("/sales_request", (req, res, next) => {
  (
    batchUpdateSalesRequest as unknown as (
      req: express.Request,
      res: express.Response
    ) => Promise<any>
  )(req, res).catch(next);
});

export default router;
