import { Router, Request, Response } from "express";
import oracledb from "oracledb";
import constants from "../../../../helpers/constants";
import { createInboundSchema } from "../../../../../src/validation/wms/transaction/createinbound.validation";

const router = Router();

/* =========================
   UPDATE SQL
========================= */
const UPDATE_SQL = `
UPDATE TI_JOB SET
  job_date = :job_date,
  job_type = :job_type,
  job_class = :job_class,
  dept_code = :dept_code,
  transport_mode = :transport_mode,
  doc_ref = :doc_ref,
  port_code = :port_code,
  description1 = :description1,
  description2 = :description2,
  prin_ref1 = :prin_ref1,
  prin_ref2 = :prin_ref2,
  remarks = :remarks,
  eta = :eta,
  ata = :ata,
  etd = :etd,
  schedule_date = :schedule_date,
  payment_terms = :payment_terms,
  curr_code = :curr_code,
  ex_rate = :ex_rate,
  frieght_value = :frieght_value,
  insurance_value = :insurance_value,
  cust_code = :cust_code,
  container_flag = :container_flag,
  container = :container,
  packdet = :packdet,
  allocated = :allocated,
  canceled = :canceled,
  confirmed = :confirmed,
  grn_no = :grn_no,
  invoiced = :invoiced,
  completed = :completed,
  exp_jobno = :exp_jobno,
  picked = :picked,
  ordered = :ordered,
  destination_port = :destination_port,
  vessel_name = :vessel_name,
  voyage_no = :voyage_no,
  payableat = :payableat,
  place_receipt = :place_receipt,
  place_delivery = :place_delivery,
  no_of_original_bl = :no_of_original_bl,
  broker_code = :broker_code,
  quotation_ref = :quotation_ref,
  be_deposits = :be_deposits,
  ind_freight = :ind_freight,
  country_origin = :country_origin,
  country_destination = :country_destination,
  custom_recno = :custom_recno,
  doc_ref2 = :doc_ref2,
  hawb = :hawb,
  reexport = :reexport,
  ref_jobno = :ref_jobno,
  combined_jobno = :combined_jobno,
  carrier = :carrier,
  job_lock = :job_lock,
  courier_code = :courier_code,
  delivery_point = :delivery_point,
  div_code = :div_code,
  salesman_code = :salesman_code,
  transit_time = :transit_time,
  document_check = :document_check,
  delivery_remarks = :delivery_remarks,
  cargo_received = :cargo_received,
  delivered_by = :delivered_by,
  canceled_by = :canceled_by,
  cancel_remarks = :cancel_remarks,
  send_mail = :send_mail,
  backlog_mail = :backlog_mail,
  dplan_flag = :dplan_flag,
  trans_batch_id = :trans_batch_id,
  send_mail_dn = :send_mail_dn,
  kpi_inc = :kpi_inc,
  kpi_exc_remark = :kpi_exc_remark,
  job_category = :job_category,
  edit_user = :edit_user,
  tx_cat_code = :tx_cat_code,
  bcf_code = :bcf_code,
  request_category = :request_category,
  load_point = :load_point,
  created_at = :created_at,
  created_by = :created_by,
  updated_at = :updated_at,
  updated_by = :updated_by,
  job_classification = :job_classification
WHERE company_code = :company_code
  AND job_no = :job_no
`;

/* =========================
   INSERT SQL
========================= */
const INSERT_SQL = `
INSERT INTO TI_JOB (
  company_code, prin_code, job_no, job_date, job_type, job_class, dept_code,
  transport_mode, doc_ref, port_code, description1, description2, prin_ref1,
  prin_ref2, remarks, eta, ata, etd, schedule_date, payment_terms, curr_code,
  ex_rate, frieght_value, insurance_value, cust_code, container_flag, container,
  packdet, allocated, canceled, confirmed, grn_no, invoiced, completed, exp_jobno,
  picked, ordered, destination_port, vessel_name, voyage_no, payableat,
  place_receipt, place_delivery, no_of_original_bl, broker_code, quotation_ref,
  be_deposits, ind_freight, country_origin, country_destination, custom_recno,
  doc_ref2, hawb, reexport, ref_jobno, combined_jobno, carrier, job_lock,
  courier_code, delivery_point, div_code, salesman_code, transit_time,
  document_check, delivery_remarks, cargo_received, delivered_by, canceled_by,
  cancel_remarks, send_mail, backlog_mail, dplan_flag, trans_batch_id,
  send_mail_dn, kpi_inc, kpi_exc_remark, job_category, edit_user, tx_cat_code,
  bcf_code, request_category, load_point, created_at, created_by, updated_at,
  updated_by, job_classification
) VALUES (
  :company_code, :prin_code, :job_no, :job_date, :job_type, :job_class, :dept_code,
  :transport_mode, :doc_ref, :port_code, :description1, :description2,
  :prin_ref1, :prin_ref2, :remarks, :eta, :ata, :etd, :schedule_date,
  :payment_terms, :curr_code, :ex_rate, :frieght_value, :insurance_value,
  :cust_code, :container_flag, :container, :packdet, :allocated, :canceled,
  :confirmed, :grn_no, :invoiced, :completed, :exp_jobno, :picked, :ordered,
  :destination_port, :vessel_name, :voyage_no, :payableat, :place_receipt,
  :place_delivery, :no_of_original_bl, :broker_code, :quotation_ref,
  :be_deposits, :ind_freight, :country_origin, :country_destination,
  :custom_recno, :doc_ref2, :hawb, :reexport, :ref_jobno, :combined_jobno,
  :carrier, :job_lock, :courier_code, :delivery_point, :div_code,
  :salesman_code, :transit_time, :document_check, :delivery_remarks,
  :cargo_received, :delivered_by, :canceled_by, :cancel_remarks, :send_mail,
  :backlog_mail, :dplan_flag, :trans_batch_id, :send_mail_dn, :kpi_inc,
  :kpi_exc_remark, :job_category, :edit_user, :tx_cat_code, :bcf_code,
  :request_category, :load_point, :created_at, :created_by, :updated_at,
  :updated_by, :job_classification
)
`;

/* =========================
   CONTROLLER
========================= */
export const createOrUpdateJob = async (req: Request, res: Response): Promise<void> => {
  let connection: oracledb.Connection | undefined;

  try {
    const { prin_code, job_no } = req.query as { prin_code: string; job_no: string };
    const requestUser = req.body.user || {
      loginid: "SYSTEM",
      company_code: req.body.company_code || ""
    };

    const { error } = createInboundSchema(req.body, false, requestUser.company_code);
    if (error) {
      res.status(constants.STATUS_CODES.BAD_REQUEST).json({ success: false, message: error.message });
      return;
    }

    // Utility to safely convert date strings to JS Date
    const toDate = (val: any) => val ? new Date(val) : null;

    // Build SAFE bind data (ALL fields)
    const bindData = {
      company_code: requestUser.company_code,
     prin_code: req.body.prin_code ?? null,
     job_no: req.body.job_no ?? null,

      job_type: req.body.job_type ?? null,
      job_date: toDate(req.body.job_date),
      job_class: req.body.job_class ?? null,
      dept_code: req.body.dept_code ?? null,
      transport_mode: req.body.transport_mode ?? null,
      doc_ref: req.body.doc_ref ?? null,
      port_code: req.body.port_code ?? null,
      description1: req.body.description1 ?? null,
      description2: req.body.description2 ?? null,
      prin_ref1: req.body.prin_ref1 ?? null,
      prin_ref2: req.body.prin_ref2 ?? null,
      remarks: req.body.remarks ?? null,
      eta: toDate(req.body.eta),
      ata: toDate(req.body.ata),
      etd: toDate(req.body.etd),
      schedule_date: toDate(req.body.schedule_date),
      payment_terms: req.body.payment_terms ?? null,
      curr_code: req.body.curr_code ?? null,
      ex_rate: req.body.ex_rate ?? null,
      frieght_value: req.body.frieght_value ?? null,
      insurance_value: req.body.insurance_value ?? null,
      cust_code: req.body.cust_code ?? null,
      container_flag: req.body.container_flag ?? null,
      container: req.body.container ?? null,
      packdet: req.body.packdet ?? null,
      allocated: req.body.allocated ?? null,
      canceled: req.body.canceled ?? null,
      confirmed: req.body.confirmed ?? null,
      grn_no: req.body.grn_no ?? null,
      invoiced: req.body.invoiced ?? null,
      completed: req.body.completed ?? null,
      exp_jobno: req.body.exp_jobno ?? null,
      picked: req.body.picked ?? null,
      ordered: req.body.ordered ?? null,
      destination_port: req.body.destination_port ?? null,
      vessel_name: req.body.vessel_name ?? null,
      voyage_no: req.body.voyage_no ?? null,
      payableat: req.body.payableat ?? null,
      place_receipt: req.body.place_receipt ?? null,
      place_delivery: req.body.place_delivery ?? null,
      no_of_original_bl: req.body.no_of_original_bl ?? null,
      broker_code: req.body.broker_code ?? null,
      quotation_ref: req.body.quotation_ref ?? null,
      be_deposits: req.body.be_deposits ?? null,
      ind_freight: req.body.ind_freight ?? null,
      country_origin: req.body.country_origin ?? null,
      country_destination: req.body.country_destination ?? null,
      custom_recno: req.body.custom_recno ?? null,
      doc_ref2: req.body.doc_ref2 ?? null,
      hawb: req.body.hawb ?? null,
      reexport: req.body.reexport ?? null,
      ref_jobno: req.body.ref_jobno ?? null,
      combined_jobno: req.body.combined_jobno ?? null,
      carrier: req.body.carrier ?? null,
      job_lock: req.body.job_lock ?? null,
      courier_code: req.body.courier_code ?? null,
      delivery_point: req.body.delivery_point ?? null,
      div_code: req.body.div_code ?? null,
      salesman_code: req.body.salesman_code ?? null,
      transit_time: req.body.transit_time ?? null,
      document_check: req.body.document_check ?? null,
      delivery_remarks: req.body.delivery_remarks ?? null,
      cargo_received: req.body.cargo_received ?? null,
      delivered_by: req.body.delivered_by ?? null,
      canceled_by: req.body.canceled_by ?? null,
      cancel_remarks: req.body.cancel_remarks ?? null,
      send_mail: req.body.send_mail ?? null,
      backlog_mail: req.body.backlog_mail ?? null,
      dplan_flag: req.body.dplan_flag ?? null,
      trans_batch_id: req.body.trans_batch_id ?? null,
      send_mail_dn: req.body.send_mail_dn ?? null,
      kpi_inc: req.body.kpi_inc ?? null,
      kpi_exc_remark: req.body.kpi_exc_remark ?? null,
      job_category: req.body.job_category ?? null,
      edit_user: req.body.edit_user ?? null,
      tx_cat_code: req.body.tx_cat_code ?? null,
      bcf_code: req.body.bcf_code ?? null,
      request_category: req.body.request_category ?? null,
      load_point: req.body.load_point ?? null,

      created_at: toDate(req.body.created_at) || new Date(),
      created_by: requestUser.loginid,
      updated_at: new Date(),
      updated_by: requestUser.loginid,
      job_classification: req.body.job_classification ?? null
    };

    connection = await oracledb.getConnection();

    const result = await connection.execute<{ COUNT: number }>(
      `SELECT COUNT(*) AS COUNT FROM TI_JOB
       WHERE company_code = :company_code AND job_no = :job_no`,
      { company_code: bindData.company_code, job_no: bindData.job_no },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const exists = (result.rows?.[0]?.COUNT ?? 0) > 0;

    if (exists) {
      await connection.execute(UPDATE_SQL, bindData, { autoCommit: true });
      res.status(constants.STATUS_CODES.OK).json({ success: true, message: "Job updated successfully" });
    } else {
      await connection.execute(INSERT_SQL, bindData, { autoCommit: true });
      res.status(constants.STATUS_CODES.OK).json({ success: true, message: "Job created successfully" });
    }

  } catch (error: any) {
    console.error("Error in createOrUpdateJob:", error);
    res.status(constants.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection:", err);
      }
    }
  }
};
