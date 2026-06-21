import Joi from "joi";
import { IPackingDetails } from "../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import { IShipmentDetails } from "../../../interfaces/wms/transaction/inbound/shipmentDetails_wms.interface";
import { ITallyDetailsWms } from "../../../interfaces/wms/transaction/inbound/tallyDetails_wms.interface";
import { IConfirmInboundjob } from "../../../interfaces/wms/transaction/inbound/confirminboundJobWms.interface";

export const shipmentDetailsSchema = (
  data: IShipmentDetails,
  isBulkOperation: boolean,
  companyCode: string
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(companyCode).required(),
    prin_code: Joi.string().required(),
    job_no: Joi.string().allow(""),
    vessel_name: Joi.string().allow(""),
    voyage_no: Joi.string().allow(""),
    container_no: Joi.string().required(),
    seal_no: Joi.string().allow(""),
    container_size: Joi.number().allow(null),
    container_type: Joi.string().allow(""),
    bl_no: Joi.string().allow(""),
    packdet_entered: Joi.string().allow(""),
    user_id: Joi.string().allow(""),
    user_dt: Joi.date().allow(null),
    moc1: Joi.string().allow(""),
    moc2: Joi.string().allow(""),
    act_code: Joi.string().allow(""),
    uoc: Joi.string().allow(""),
    volume: Joi.number().allow(null),
    net_weight: Joi.number().allow(null),
    assigned_pda_user: Joi.string().allow(""),
    po_no: Joi.string().allow(""),
    sr_comp_code: Joi.string().allow(""),
    sr_cust_code: Joi.string().allow(""),
    supp_code: Joi.string().allow(""),
    assigned_tally_user: Joi.string().allow(""),
    unstuff_start: Joi.date().allow(null),
    unstuff_end: Joi.date().allow(null),
    tally_start_time: Joi.date().allow(null),
    tally_end_time: Joi.date().allow(null),
    putaway_start_time: Joi.date().allow(null),
    putaway_end_time: Joi.date().allow(null),
    old_container_no: Joi.string().allow(""),
    old_vessel_name: Joi.string().allow(""),
    old_voyage_no: Joi.string().allow(""),
    sr_reason_code: Joi.string().allow(""),
    promo_shift: Joi.string().allow(""),
    hbl_no: Joi.string().allow(""),
    asn_no: Joi.string().allow(""),
    doc_ref_no: Joi.string().allow(""),
    cust_decl_no: Joi.string().allow(""),
    truck_no: Joi.string().allow(""),
  });

  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

export const packingDetailsSchema = (
  data: IPackingDetails,
  isBulkOperation: boolean,
  companyCode: string
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(companyCode).required(),
    prod_code: Joi.string().required(),
    prin_code: Joi.any().required(),
    job_no: Joi.any().required(),
    qty_puom: Joi.number().required(),
    p_uom: Joi.string().allow(""),
    l_uom: Joi.string().allow(""),
    qty_luom: Joi.number().required(),
    quantity: Joi.number().required(),
    batch_no: Joi.string().allow(""),
    lot_no: Joi.string().allow(""),
      upp: Joi.number().allow(null),
    mfg_date: Joi.date().allow(null),
    prod_mfg_date: Joi.date().allow(null),
    exp_date: Joi.date().allow(""),
    po_no: Joi.string().allow(""),
    origin_country: Joi.string().allow(""),
    manu_code: Joi.string().allow(""),
    gross_weight: Joi.number().allow(null),
    volume: Joi.number().allow(null),
    shelf_life_days: Joi.number().allow(null),
    shelf_life_date: Joi.date().allow(null),
    container_no: Joi.allow(""),
    bl_no: Joi.allow(""),
    doc_ref: Joi.string().allow(""),
    clearance: Joi.string().allow(""),
      uppp: Joi.number().allow(null)
  });

  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

export const tallyDetailsSchema = (
  data: ITallyDetailsWms,
  isBulkOperation: boolean,
  companyCode: string
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(companyCode).required(),
    prin_code: Joi.any().required(),
    job_no: Joi.string().allow(""),
    container_no: Joi.string().allow(""),
    prod_code: Joi.string().allow(""),
    prod_attrib_code: Joi.string().allow(""),
    quantity: Joi.number().allow(null),
    pda_quantity: Joi.number().allow(null),
    location_code: Joi.string().allow(""),
    barcode: Joi.string().allow(""),
    size_value: Joi.string().allow(""),
    seq_number: Joi.number().allow(null),
    user_id: Joi.string().allow(""),
    user_dt: Joi.date().allow(null),
    packdet_no: Joi.number().allow(null),
    carton_no: Joi.string().allow(""),
    batch_no: Joi.string().allow(""),
    prod_exp_date: Joi.date().allow(null),
    pallet_id: Joi.string().allow(""),
    selected: Joi.string().allow(""),
    allocated: Joi.string().allow(""),
    pda_qty_puom: Joi.number().allow(null),
    pda_puom: Joi.string().allow(""),
    pda_qty_luom: Joi.number().allow(null),
    pda_luom: Joi.string().allow(""),
    lot_no: Joi.string().allow(""),
    prod_mfg_date: Joi.date().allow(null),
    site_ind: Joi.string().allow(""),
    tally_processed: Joi.string().allow(""),
    putaway_processed: Joi.string().allow(""),
    target_location: Joi.string().allow(""),
    receipt_type: Joi.string().allow(""),
    vessel_name: Joi.string().allow(""),
    exp_date: Joi.date().allow(null),
    mgf_date: Joi.date().allow(null),
    mfg_date: Joi.date().allow(null),
    uppp: Joi.number().allow(null),
    upp: Joi.number().allow(null),
    origin_country: Joi.string().allow(""),
    batch_id: Joi.string().allow(""),
    carton_tally: Joi.string().allow(""),
    putaway_pda_processed: Joi.string().allow(""),
    prod_exp_char: Joi.string().allow(""),
    prod_mfg_char: Joi.string().allow(""),
    po_no: Joi.string().allow(""),
    volume: Joi.number().allow(null),
    shelf_life_days: Joi.number().allow(null),
    shelf_life_date: Joi.date().allow(null),
    gross_weight: Joi.number().allow(null),
  });

  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

export const putwayPackingItemSchema = (data: {
  site_from: string;
  site_to: string;
  location_from: string;
  location_to: string;
  packdet_no: string[];
}) => {
  const schema = Joi.object().keys({
    site_from: Joi.string().required(),
    site_to: Joi.string().required(),
    location_from: Joi.string().required(),
    location_to: Joi.string().required(),
    packdet_no: Joi.array().items(Joi.string()).required(),
  });

  return schema.validate(data);
};

export const qualityClearanceSchema = (data: {
  truck_condition: string;
  container_condition: string;
  container_type: string;
  ref_box_temp: string;
  prod_temp: string;
  prod_con_acceptance: string;
  packdet_no: string[];
}) => {
  const schema = Joi.object().keys({
    prod_con_acceptance: Joi.string().required(),
prod_temp: Joi.string().allow(null),
    ref_box_temp: Joi.string().required(),
    container_type: Joi.string().required(),
    container_condition: Joi.string().required(),
    truck_condition: Joi.string().required(),
    packdet_no: Joi.array().items(Joi.string()).required(),
  });

  return schema.validate(data);
};

export const InboundJobConfirmSchema = (data: {
  job_no: string;
  prin_code: string;
  packdet_no: string[];
}) => {
  const schema = Joi.object().keys({
    job_no: Joi.string().required(),
    prin_code: Joi.string().required(),
    packdet_no: Joi.array().items(Joi.string()).required(),
  });

  return schema.validate(data);
};
