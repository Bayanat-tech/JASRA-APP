import Joi from "joi";
import { IIndustrysector } from "../../interfaces/wms/industrysector_wms.interface";
import {
  IPrincipalContactDetlWMs,
  IPrincipalWms,
} from "../../interfaces/wms/principal_wms.interface";

import {
  IGroup,
  IBrand,
  IManufacture,
  ICountry,
  IDepartment,
  ISalesman,
  IUom,
  IMoc,
  IMoc2,
  IUoc,
  IAccountsetup,
  IProduct,
  IAlert,
  IProducttype,
} from "../../interfaces/wms/gm_wms.interface";
import { ICurrency } from "../../interfaces/wms/currency_wms.interface";
import { ILocation } from "../../interfaces/wms/location_wms.interface";
import { ILine } from "../../interfaces/wms/line_wms.interface";
//import { IDepartment } from "../../interfaces/wms/gm_wms.interface";
import { IHarmonize } from "../../interfaces/wms/harmonize.interface";
import { IPort } from "../../interfaces/wms/port_wms.interface";
//import { IDepartment } from "../../interfaces/wms/gm_wms.interface";
import { IActivityGroup } from "../../interfaces/wms/activitygroup_wms.interface";
import { IActivitysubgroup } from "../../interfaces/wms/activity_subgroup_wms.interface";
import { IVessel } from "../../interfaces/wms/vessel_wms.interface";
//import { IDepartment } from "../../interfaces/wms/gm_wms.interface";
import { IActivityBilling } from "../../interfaces/wms/activity_billing_wms.interface";
import { ISupplier } from "../../interfaces/wms/supplier_wms.interface";
import { IAirLine } from "../../interfaces/wms/airline_wms.interface";
import { IPartner } from "../../interfaces/wms/partner_wms.interface";
import { IHrBank } from "../../interfaces/Hr/hr_bank";
import { IAssetgroup } from "../../interfaces/wms/assetgroup_wms.interface";
import { IWarehouse } from "../../interfaces/wms/warehouse_wms";
import { ILocationType } from "../../interfaces/wms/locationtype_wms.interface";
import { ICustomer } from "../../interfaces/wms/customer_wms.interface";

export const countrySchema = (
  data: ICountry,
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(userCompany).required(),
    country_code: Joi.required(),
    country_name: Joi.string().required(),
    country_gcc: Joi.string().valid("Y", "N").required(),
    short_desc: Joi.string().allow("", null),
    nationality: Joi.string().allow("", null),
  });
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

export const activityKpiSchema = (
  data: any,
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    prin_code: Joi.string().max(5).required(),
    job_type: Joi.string().max(4).required(),
    act_code: Joi.string().max(5).required(),
    cust_code: Joi.string().max(20).allow("", null),
    exp_hours: Joi.number().precision(2).required(),
    company_code: Joi.string().valid(userCompany).required(),
    updated_at: Joi.date().default(Date.now),
    updated_by: Joi.string().max(50).allow("", null),
    created_by: Joi.string().max(20).allow("", null),
    created_at: Joi.date().default(Date.now),
  });

  const schema = Joi.array().items(baseSchema);

  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};
export const producttypeSchema = (
  data: IProducttype,
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(userCompany).required(),
    prodtype_code: Joi.string().required(),
    prodtype_desc: Joi.string().required(),
  });
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

export const alertSchema = (
  data: IAlert | IAlert[],
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(userCompany).required(),
    op_code: Joi.number().required(),
    op_type: Joi.string().required(),
    op_desc: Joi.string().required(),
    op_sequence: Joi.number().required(),
    op_module: Joi.string().allow("", null),
    op_mode: Joi.string().allow("", null),
    instruction: Joi.string().valid("Y", "N").required(),
    updated_at: Joi.date().allow(null, ""),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow(null, ""),
  });

  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

export const productSchema = (data: any) => {
  const schema = Joi.object({
    prod_code: Joi.string().optional().allow(null, ''), // Make optional for create
    company_code: Joi.string().required(),
    prin_code: Joi.string().required(),
    prod_name: Joi.string().required(),

    // Required Number Fields
    uppp: Joi.number().required(),

    // Not Required String Fields
    brand_code: Joi.string().allow(null, ""),
    group_code: Joi.string().allow(null, ""),
    packdesc: Joi.string().allow(null, ""),
    barcode: Joi.string().allow(null, ""),
    p_uom: Joi.string().allow(null, ""),
    suom: Joi.string().allow(null, ""),
    foc: Joi.string().allow(null, ""),
    harm_code: Joi.string().allow(null, ""),
    imco_code: Joi.string().allow(null, ""),
    kitting: Joi.string().allow(null, ""),
    manu_code: Joi.string().allow(null, ""),
    site_type: Joi.string().allow(null, ""),
    site_ind: Joi.string().allow(null, ""),
    pack_key: Joi.string().allow(null, ""),
    chargetime: Joi.string().allow(null, ""),
    prod_status: Joi.string().allow(null, ""),
    category_abc: Joi.string().allow(null, ""),
    alt_prod_code: Joi.string().allow(null, ""),
    pref_site: Joi.string().allow(null, ""),
    pref_loc_from: Joi.string().allow(null, ""),
    pref_loc_to: Joi.string().allow(null, ""),
    pref_aisle_from: Joi.string().allow(null, ""),
    pref_aisle_to: Joi.string().allow(null, ""),
    chk_manucode: Joi.string().allow(null, ""),
    chk_lotno: Joi.string().allow(null, ""),
    chk_mfgexpdt: Joi.string().allow(null, ""),
    l_uom: Joi.string().allow(null, ""),
    twoplus_uom: Joi.string().allow(null, ""),
    product_stage: Joi.string().allow(null, ""),
    co_pack: Joi.string().allow(null, ""),
    model_number: Joi.string().allow(null, ""),
    variant_code: Joi.string().allow(null, ""),
    cnt_origin: Joi.string().allow(null, ""),
    serialize: Joi.string().allow(null, ""),
    packing: Joi.string().allow(null, ""),
    prod_image_path_web: Joi.string().allow(null, ""),
    qty_as_wt: Joi.string().allow(null, ""),
    hazmat_ind: Joi.string().allow(null, ""),
    hazmat_class: Joi.string().allow(null, ""),
    food_ind: Joi.string().allow(null, ""),
    pharma_ind: Joi.string().allow(null, ""),
    special_instructions: Joi.string().allow(null, ""),
    strength: Joi.string().allow(null, ""),
    group_code_bk: Joi.string().allow(null, ""),
    sap_prod_code: Joi.string().allow(null, ""),
    sap_prod_desc: Joi.string().allow(null, ""),
    temp_code: Joi.string().allow(null, ""),
    edit_user: Joi.string().allow(null, ""),
    class: Joi.string().allow(null, ""),
    unified_code: Joi.string().allow(null, ""),
    current_season: Joi.string().allow(null, ""),
    product_category: Joi.string().allow(null, ""),
    generic_article: Joi.string().allow(null, ""),
    prod_gender: Joi.string().allow(null, ""),
    prod_color: Joi.string().allow(null, ""),
    prod_size: Joi.string().allow(null, ""),
    prnt_p_code: Joi.string().allow(null, ""),

    // Not Required Number Fields
    length: Joi.number().allow("", null),
    breadth: Joi.number().allow("", null),
    height: Joi.number().allow("", null),
    volume: Joi.number().allow("", null),
    gross_wt: Joi.number().allow("", null),
    net_wt: Joi.number().allow("", null),
    cpu: Joi.number().allow("", null),
    base_price: Joi.number().allow("", null),
    flat_storage: Joi.number().allow("", null),
    prod_ti: Joi.number().allow("", null),
    prod_hi: Joi.number().allow("", null),
    shelf_life: Joi.number().allow("", null),
    reord_level: Joi.number().allow("", null),
    reord_qty: Joi.number().allow("", null),
    pref_col_from: Joi.number().allow("", null),
    pref_col_to: Joi.number().allow("", null),
    pref_ht_from: Joi.number().allow("", null),
    pref_ht_to: Joi.number().allow("", null),
    puom_volume: Joi.number().allow("", null),
    puom_netwt: Joi.number().allow("", null),
    puom_grosswt: Joi.number().allow("", null),
    luppp: Joi.number().allow("", null),
    uom_count: Joi.number().allow("", null),
    prod_type: Joi.number().allow("", null),
    upp: Joi.number().allow("", null),
    wave_code: Joi.number().allow("", null),
    old_upp: Joi.number().allow("", null),
    avg_consumption: Joi.number().allow("", null),
    minperiod_exppick: Joi.number().allow("", null),
    rcpt_exp_limit: Joi.number().allow("", null),
    pack_size: Joi.number().allow("", null),
    batch_type: Joi.number().allow("", null),
    wob: Joi.number().allow("", null),
  });
  return schema.validate(data);
};

export const decimalSchema = (precision: number, scale: number) =>
  Joi.number()
    .precision(scale)
    .max(Number("9".repeat(precision - scale) + "." + "9".repeat(scale)));

export const productediSchema = Joi.object({
  PRIN_CODE: Joi.string().max(7).required(),
  PROD_CODE: Joi.string().max(40).required(),
  PROD_NAME: Joi.string().max(250).required(),
  GROUP_CODE: Joi.string().max(5).allow("", null),
  BRAND_CODE: Joi.string().max(5).allow("", null),
  PACKDESC: Joi.string().max(50).allow("", null),
  BARCODE: Joi.string().max(40).allow("", null),
  P_UOM: Joi.string().max(5).allow("", null),
  SUOM: Joi.string().max(5).allow("", null),
  LENGTH: decimalSchema(12, 6).allow("", null),
  BREADTH: decimalSchema(12, 6).allow("", null),
  HEIGHT: decimalSchema(12, 6).allow("", null),
  VOLUME: decimalSchema(12, 6).allow("", null),
  GROSS_WT: decimalSchema(12, 6).allow("", null),
  NET_WT: decimalSchema(12, 6).allow("", null),
  FOC: Joi.string().max(20).allow("", null),
  CPU: decimalSchema(10, 4).allow("", null),
  HARM_CODE: Joi.string().max(20).allow("", null),
  IMCO_CODE: Joi.string().max(20).allow("", null),
  KITTING: Joi.string().length(1).allow("", null),
  manu_code: Joi.string().max(25).allow("", null),
  BASE_PRICE: decimalSchema(16, 6).allow("", null),
  FLAT_STORAGE: decimalSchema(10, 4).allow("", null),
  SITE_TYPE: Joi.string().max(5).allow("", null),
  SITE_IND: Joi.string().max(5).allow("", null),
  PACK_KEY: Joi.string().max(40).allow("", null),
  PROD_TI: Joi.number().integer().allow(null),
  PROD_HI: Joi.number().integer().allow(null),
  CHARGETIME: Joi.string().max(5).allow("", null),
  PROD_STATUS: Joi.string().max(2).allow("", null),
  SHELF_LIFE: Joi.number().integer().allow(null),
  CATEGORY_ABC: Joi.string().max(2).allow("", null),
  REORD_LEVEL: Joi.number().integer().allow(null),
  REORD_QTY: decimalSchema(12, 1).allow("", null),
  ALT_PROD_CODE: Joi.string().max(40).allow("", null),
  PREF_SITE: Joi.string().max(5).allow("", null),
  PREF_LOC_FROM: Joi.string().max(15).allow("", null),
  PREF_LOC_TO: Joi.string().max(15).allow("", null),
  PREF_AISLE_FROM: Joi.string().max(5).allow("", null),
  PREF_AISLE_TO: Joi.string().max(5).allow("", null),
  PREF_COL_FROM: Joi.number().integer().allow(null),
  PREF_COL_TO: Joi.number().integer().allow(null),
  PREF_HT_FROM: Joi.number().integer().allow(null),
  PREF_HT_TO: Joi.number().integer().allow(null),
  UPPP: Joi.number().integer().allow(null),
  CHK_MANUCODE: Joi.string().length(1).allow("", null),
  CHK_LOTNO: Joi.string().length(1).allow("", null),
  CHK_MFGEXPDT: Joi.string().length(1).allow("", null),
  PUOM_VOLUME: decimalSchema(12, 6).allow("", null),
  PUOM_NETWT: decimalSchema(12, 6).allow("", null),
  PUOM_GROSSWT: decimalSchema(12, 6).allow("", null),
  L_UOM: Joi.string().max(5).allow("", null),
  LUPPP: Joi.number().integer().allow(null),
  UOM_COUNT: Joi.number().integer().allow(null),
  PROD_TYPE: Joi.number().integer().allow(null),
  COMPANY_CODE: Joi.string().max(7).required(),
  TWOPLUS_UOM: Joi.string().length(1).allow("", null),
  UPP: Joi.number().integer().allow(null),
  WAVE_CODE: Joi.number().integer().allow(null),
  PRODUCT_STAGE: Joi.string().length(1).allow("", null),
  CO_PACK: Joi.string().length(1).allow("", null),
  MODEL_NUMBER: Joi.string().max(50).allow("", null),
  VARIANT_CODE: Joi.string().max(4).allow("", null),
  CNT_ORIGIN: Joi.string().max(20).allow("", null),
  SERIALIZE: Joi.string().length(1).allow("", null),
  PACKING: Joi.string().max(20).allow("", null),
  OLD_UPP: decimalSchema(38, 0).allow("", null),
  AVG_CONSUMPTION: decimalSchema(38, 0).allow("", null),
  PROD_IMAGE_PATH_WEB: Joi.string().max(250).allow("", null),
  MINPERIOD_EXPPICK: Joi.number().integer().allow(null),
  RCPT_EXP_LIMIT: Joi.number().integer().allow(null),
  QTY_AS_WT: Joi.string().length(1).allow("", null),
  HAZMAT_IND: Joi.string().length(1).allow("", null),
  HAZMAT_CLASS: Joi.string().max(10).allow("", null),
  FOOD_IND: Joi.string().length(1).allow("", null),
  PHARMA_IND: Joi.string().length(1).allow("", null),
  SPECIAL_INSTRUCTIONS: Joi.string().max(100).allow("", null),
  STRENGTH: Joi.string().max(50).allow("", null),
  PACK_SIZE: decimalSchema(10, 0).allow("", null),
  GROUP_CODE_BK: Joi.string().max(10).allow("", null),
  BATCH_TYPE: Joi.number().integer().allow(null),
  SAP_PROD_CODE: Joi.string().max(20).allow("", null),
  SAP_PROD_DESC: Joi.string().max(250).allow("", null),
  TEMP_CODE: Joi.string().max(250).allow("", null),
  EDIT_USER: Joi.string().max(10).allow("", null),
  CLASS: Joi.string().length(1).allow("", null),
  WOB: decimalSchema(10, 0).allow("", null),
  UNIFIED_CODE: Joi.string().max(20).allow("", null),
  CURRENT_SEASON: Joi.string().max(50).allow("", null),
  PRODUCT_CATEGORY: Joi.string().max(50).allow("", null),
  GENERIC_ARTICLE: Joi.string().max(50).allow("", null),
  PROD_GENDER: Joi.string().max(50).allow("", null),
  PROD_COLOR: Joi.string().max(50).allow("", null),
  PROD_SIZE: Joi.string().max(50).allow("", null),
  PRNT_P_CODE: Joi.string().max(50).allow("", null),
  updated_at: Joi.date().allow(null),
  updated_by: Joi.string().max(50).allow("", null),
  created_by: Joi.string().max(20).allow("", null),
  created_at: Joi.date().allow(null),
  DIV_CODE: Joi.string().max(20).allow("", null),
});

export const accountsetupSchema = (data: IAccountsetup) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    ac_code: Joi.string().required(),
    ac_name: Joi.string().required(),
    bank_name: Joi.string().allow("", null),
  });
  return schema.validate(data);
};

export const portSchema = (data: IPort) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    port_code: Joi.string().required(),
    port_name: Joi.string().required().allow("", null),
    country_code: Joi.string(),
    trp_mode: Joi.string().allow(null, ""),
  });
  return schema.validate(data);
};
export const manufactureSchema = (data: IManufacture) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    manu_code: Joi.string().required(),
    manu_name: Joi.string().required(),
    prin_code: Joi.string().allow("", null),
  });
  return schema.validate(data);
};

export const groupSchema = (data: IGroup) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    group_code: Joi.string().allow("", null).optional(), // Add .optional()
    group_name: Joi.string().required(),
    prin_code: Joi.string().allow("", null),
    // Add these optional fields to fix the "not allowed" errors
    pref_site: Joi.string().allow(null, "").optional(),
    pref_loc_from: Joi.string().allow(null, "").optional(),
    pref_loc_to: Joi.string().allow(null, "").optional(),
    pref_aisle_from: Joi.string().allow(null, "").optional(),
    pref_aisle_to: Joi.string().allow(null, "").optional(),
    pref_col_from: Joi.number().allow(null, "").optional(),
    pref_col_to: Joi.number().allow(null, "").optional(),
    pref_ht_from: Joi.number().allow(null, "").optional(),
    pref_ht_to: Joi.number().allow(null, "").optional(),
    expiry_cons_days: Joi.number().allow(null).optional()
  });
  return schema.validate(data);
};

export const brandSchema = (data: IBrand) => {
  const schema = Joi.object().keys({
    brand_code: Joi.string().allow("", null),
    prin_code: Joi.string().required(),
    group_code: Joi.string().required(),
    brand_name: Joi.string().allow("", null),
    pref_site: Joi.string().allow(null, ""),
    pref_loc_from: Joi.string().allow(null, ""),
    pref_loc_to: Joi.string().allow(null, ""),
    pref_aisle_from: Joi.string().allow(null, ""),
    pref_aisle_to: Joi.string().allow(null, ""),
    pref_col_from: Joi.number().allow(null, ""),
    pref_col_to: Joi.number().allow(null, ""),
    pref_ht_from: Joi.number().allow(null, ""),
    pref_ht_to: Joi.number().allow(null, ""),
    company_code: Joi.string().required(),
  });
  return schema.validate(data);
};

export const industrysectorSchema = (data: IIndustrysector) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    sector_code: Joi.string().required(),
    sector_name: Joi.string().required(),
    remarks: Joi.string().required(),
  });
  return schema.validate(data);
};

export const departmentSchema = (data: IDepartment) => {
  const schema = Joi.object().keys({
    dept_code: Joi.string().required(),
    dept_name: Joi.string().required(),
    inv_flag: Joi.string().allow("", null),
    jobno_seq: Joi.number().allow("", null),
    invno_seq: Joi.number().allow("", null),
    company_code: Joi.string().required(),
    operation_type: Joi.string().allow("", null),

    div_code: Joi.string().allow("", null),
    ac_div_code: Joi.string().allow("", null),
    dept_email: Joi.string().allow("", null),
    dn_email: Joi.string().allow("", null),
    grn_email: Joi.string().allow("", null),
    inv_gen: Joi.string().allow("", null),
    inb_oub_related: Joi.string().allow("", null),
    inv_prefix: Joi.string().allow("", null),
  });

  return schema.validate(data);
};

export const salesmanSchema = (data: ISalesman) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    salesman_code: Joi.string().required(),
    salesman_name: Joi.string().required(),
  });
  return schema.validate(data);
};

export const locationSchema = (data: ILocation) => {
  const schema = Joi.object().keys({
    site_code: Joi.string().required(),
    location_code: Joi.string().allow(null, ""),
    loc_desc: Joi.string().allow(null, ""),
    loc_type: Joi.string().allow(null, ""),
    loc_stat: Joi.string().allow(null, ""),
    aisle: Joi.string().required(),
    column_no: Joi.number().required(),
    height: Joi.number().required(),
    job_no: Joi.string().allow(null, ""),
    prod_code: Joi.string().allow(null, ""),
    prin_code: Joi.string().allow(null, ""),
    stk_stat: Joi.string().allow(null, ""),
    pref_prin: Joi.string().allow(null, ""),
    pref_prod: Joi.string().allow(null, ""),
    pref_group: Joi.string().allow(null, ""),
    pref_brand: Joi.string().allow(null, ""),
    put_seqno: Joi.number().allow(null, ""),
    pick_seqno: Joi.number().allow(null, ""),
    push_level: Joi.string().allow(null, ""),
    max_qty: Joi.number().allow(null, ""),
    uom: Joi.string().allow(null, ""),
    reorder_qty: Joi.number().allow("", null),
    company_code: Joi.string().required(),
    barcode: Joi.string().allow(null, ""),
    prod_type: Joi.number().allow(null, ""),
    depth: Joi.number().allow(null, ""),
    check_digit: Joi.string().allow(null, ""),
    assigned_prin_code: Joi.string().allow(null, ""),
    assigned_prodgroup: Joi.string().allow(null, ""),
    assigned_userid: Joi.string().allow(null, ""),
    location_code_002: Joi.string().allow(null, ""),
    volume_cbm: Joi.number().allow(null, ""),
    height_cm: Joi.number().allow(null, ""),
    breadth_cm: Joi.number().allow(null, ""),
    length_cm: Joi.number().allow(null, ""),
    blockcyc: Joi.string().valid("Y", "N").allow(null, ""),
    trolley_no: Joi.string().allow(null, ""),
    bonded_area_code: Joi.string().allow(null, ""),
    location_reserved_for: Joi.string().allow(null, ""),
    updated_at: Joi.date().allow(null, ""),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow(null, ""),
  });

  return schema.validate(data);
};

export const activitygroupSchema = (data: IActivityGroup) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    activity_group_code: Joi.string().required(),
    act_group_name: Joi.string().required(),
    mandatory_flag: Joi.string().valid("N", "Y"),
    validate_flag: Joi.string().valid("N", "Y"),
    account_code: Joi.string().allow("", null),
    act_group_type: Joi.string().allow("", null),
    alternate_accode: Joi.string().allow("", null),
    exp_account_code: Joi.string().allow("", null),
    freight_flag: Joi.string().valid("Y", "N"),
    rpt_group_name: Joi.string().allow("", null),
    sw_flag: Joi.string().allow("", null),
    cost_group: Joi.string().allow("", null),
    updated_at: Joi.date().allow(null, ""),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow(null, ""),
  });
  return schema.validate(data);
};

export const lineSchema = (data: ILine) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    line_code: Joi.string().required(),
    line_name: Joi.string().required(),
    updated_at: Joi.date().allow(null, ""),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow(null, ""),
  });
  return schema.validate(data);
};

export const vesselSchema = (data: IVessel) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    vessel_name: Joi.string().required(),
    contact_person: Joi.string().allow("", null),
    vessel_code: Joi.string().required(),
    line_code: Joi.string().allow("", null),
    email: Joi.string().allow("", null),
    address: Joi.string().allow("", null),
    // tel_no: Joi.string().allow("",null),
    // fax_no: Joi.string().allow("",null),
  });
  return schema.validate(data);
};

export const airlineSchema = (data: IAirLine) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    airline_code: Joi.string().required(),
    airline_name: Joi.string().required(),
    airline_no: Joi.string().allow("", null),
    contact_person: Joi.string().allow("", null),
    email: Joi.string().allow("", null),
    address: Joi.string().allow("", null),
    tel_no: Joi.string().allow("", null),
    fax_no: Joi.string().allow("", null),
  });
  return schema.validate(data);
};

export const partnerSchema = (data: IPartner) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    broker_code: Joi.string().required(),
    broker_name: Joi.string().required(),
    broker_addr1: Joi.string().allow("", null),
    broker_city: Joi.string().allow("", null),
    broker_contact1: Joi.string().allow("", null),
    broker_telno1: Joi.string().allow("", null),
    broker_email1: Joi.string().allow("", null),
    //broker_stat: Joi.string().allow("",null),
  });
  return schema.validate(data);
};

export const bankSchema = (data: IHrBank) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    bank_code: Joi.string().required(),
    bank_name: Joi.string().required(),
    main_bank_code: Joi.string().allow("", null),
    bank_addr1: Joi.string().allow("", null),
    country_code: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    fax: Joi.string().allow("", null),
    email: Joi.string().allow("", null),
    remarks: Joi.string().allow("", null),
    //status: Joi.string().allow("",null),
  });
  return schema.validate(data);
};

export const currencySchema = (data: ICurrency) => {
  const schema = Joi.object().keys({
    curr_code: Joi.string().required(),
    curr_name: Joi.string().required(),
    ex_rate: Joi.string().allow("", null),
    division: Joi.string().allow(null, ""),
    subdivision: Joi.number().allow(null, ""),
    company_code: Joi.string().required(),
    curr_sign: Joi.string().allow(null, ""),
  });
  return schema.validate(data);
};

export const supplierSchema = (data: ISupplier) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    prin_code: Joi.string().required(),
    supp_code: Joi.string().required(),
    curr_code: Joi.string().allow("", null),
    country_code: Joi.string().allow("", null),
    supp_name: Joi.string().allow(null, ""),
    supp_addr1: Joi.string().allow(null, ""),
    supp_addr2: Joi.string().allow(null, ""),
    supp_addr3: Joi.string().allow(null, ""),
    supp_addr4: Joi.string().allow(null, ""),
    supp_city: Joi.string().allow(null, ""),
    supp_contact1: Joi.string().allow(null, ""),
    supp_telno1: Joi.string().allow(null, ""),
    supp_faxno1: Joi.string().allow(null, ""),
    supp_email1: Joi.string().allow(null, ""),
    supp_contact2: Joi.string().allow(null, ""),
    supp_telno2: Joi.string().allow(null, ""),
    supp_faxno2: Joi.string().allow(null, ""),
    supp_email2: Joi.string().allow(null, ""),
    supp_contact3: Joi.string().allow(null, ""),
    supp_telno3: Joi.string().allow(null, ""),
    supp_faxno3: Joi.string().allow(null, ""),
    supp_ref1: Joi.string().allow(null, ""),
    supp_ref2: Joi.string().allow(null, ""),
    supp_ref3: Joi.string().allow(null, ""),
    service_date: Joi.date().allow("", null),
    supp_acref: Joi.string().allow(null, ""),
    supp_credit: Joi.number().allow("", null),
    supp_stat: Joi.string().allow(null, ""),
    supp_imp_code: Joi.string().allow(null, ""),
    supp_lic_no: Joi.string().allow(null, ""),
    supp_lic_type: Joi.string().allow(null, ""),
    price_check: Joi.string().allow(null, ""),
    supp_email3: Joi.string().allow(null, ""),
    payment_terms: Joi.number().allow("", null),
    importer_code: Joi.string().allow(null, ""),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
    cr_number: Joi.string().allow(null, ""),
  });
  return schema.validate(data);
};
export const uomSchema = (data: IUom) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    uom_code: Joi.string().required(),
    uom_name: Joi.string().required(),
  });
  return schema.validate(data);
};

export const mocSchema = (data: IMoc) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    charge_code: Joi.string().required(),
    description: Joi.string().required(),
    charge_type: Joi.string().required(),
    activity_group_code: Joi.string().required(),
  });
  return schema.validate(data);
};

export const moc2Schema = (data: IMoc2) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    charge_code: Joi.string().required(),
    description: Joi.string().required(),
    charge_type: Joi.string().required(),
    activity_group_code: Joi.string().required(),
  });
  return schema.validate(data);
};

export const uocSchema = (data: IUoc) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    charge_code: Joi.string().required(),
    description: Joi.string().required(),
    charge_type: Joi.string().required(),
    activity_group_code: Joi.string().required(),
  });
  return schema.validate(data);
};

export const harmonizeSchema = (data: IHarmonize) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    harm_code: Joi.string().required(),
    harm_desc: Joi.string().required(),
  });
  return schema.validate(data);
};

export const assetgroupSchema = (data: IAssetgroup) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    asset_group_code: Joi.string().required(),
    asset_group_name: Joi.string().required(),
  });
  return schema.validate(data);
};

export const activitysubgroupSchema = (data: IActivitysubgroup) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    activity_subgroup_code: Joi.string().required(),
    act_subgroup_name: Joi.string().required(),
    //mandatory_flag:Joi.string().allow(null,""),
    act_group_code: Joi.string().required(),
    //validate_flag: Joi.string().allow(null,""),
    mandatory_flag: Joi.string().allow(null, ""),
    validate_flag: Joi.string().allow(null, ""),
  });
  return schema.validate(data);
};

export const principalSchema = (
  data:
    | (IPrincipalWms & IPrincipalContactDetlWMs)
    | (IPrincipalWms & IPrincipalContactDetlWMs)[],
  companyCode: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object({
    //---------------basic----------
    prin_name: Joi.string().required(),
    company_code: Joi.string().valid(companyCode).required(),
    prin_dept_code: Joi.alternatives().try(
      Joi.string(),
      Joi.number().allow(null, "")
    ),
    prin_code: Joi.alternatives().try(
      Joi.string(),
      Joi.number().allow(null, "")
    ),
    prin_addr1: Joi.string().allow(null, ""),
    prin_addr2: Joi.string().allow(null, ""),
    prin_addr3: Joi.string().allow(null, ""),
    prin_addr4: Joi.string().allow(null, ""),
    prin_city: Joi.string().allow(null, ""),
    country_code: Joi.string().allow(null, ""),
    tax_country_code: Joi.string().allow(null, ""),
    tax_country_sn: Joi.string().allow(null, ""),
    territory_code: Joi.string().allow(null, ""),
    sector_code: Joi.string().allow(null, ""),
    prin_email1: Joi.string().email().allow(null, ""),
    prin_email2: Joi.string().email().allow(null, ""),
    prin_email3: Joi.string().email().allow(null, ""),
    prin_faxno1: Joi.string().allow(null, ""),
    prin_faxno2: Joi.string().allow(null, ""),
    prin_faxno3: Joi.string().allow(null, ""),
    prin_ref1: Joi.string().allow(null, ""),
    prin_status: Joi.string().allow(null, ""),
    acc_email: Joi.string().email().allow(null, ""),
    //---------------account-------------
    trn_no: Joi.number().allow(null),
    trn_exp_date: Joi.date().allow(null),
    comm_reg_no: Joi.number().allow(null),
    comm_reg_exp_date: Joi.date().allow(null),
    prin_lic_no: Joi.number().allow(null),
    prin_lic_type: Joi.string().allow("", null),
    curr_code: Joi.string().allow("", null),
    prin_infze: Joi.string().allow("", null),
    prin_acref: Joi.string().allow("", null),
    credit_limit: Joi.number().allow(null),
    creditdays: Joi.number().allow(null),
    creditdays_freight: Joi.number().allow(null),
    prin_imp_code: Joi.string().allow("", null),
    parent_prin_code: Joi.string().allow("", null),
    prin_invdate: Joi.date().allow(null),
    files: Joi.array().items(Joi.any()).allow(null),
    //---------------contact--------------
    prin_cont1: Joi.string().allow(null, ""),
    prin_cont2: Joi.string().allow(null, ""),
    prin_cont3: Joi.string().allow(null, ""),
    prin_cont_email1: Joi.string().email().allow(null, ""),
    prin_cont_email2: Joi.string().email().allow(null, ""),
    prin_cont_email3: Joi.string().email().allow(null, ""),
    prin_cont_telno1: Joi.string().allow(null, ""),
    prin_cont_telno2: Joi.string().allow(null, ""),
    prin_cont_telno3: Joi.string().allow(null, ""),
    prin_cont_faxno1: Joi.string().allow(null, ""),
    prin_cont_faxno2: Joi.string().allow(null, ""),
    prin_cont_faxno3: Joi.string().allow(null, ""),
    prin_cont_ref1: Joi.string().allow(null, ""),
    //---------------pick wave--------------

    pick_wave: Joi.string().allow(null, ""),
    pick_wave_qty_sort: Joi.number().allow("", null),
    pick_wave_ign_min_exp: Joi.number().allow("", null),

    //---------------settings--------------
    under_value: Joi.string().allow(null, ""),
    auto_insert_billactivity: Joi.string().allow(null, ""),
    prin_charge: Joi.string().allow(null, ""),
    prin_pricechk: Joi.string().allow(null, ""),
    prin_landedpr: Joi.string().allow(null, ""),
    auto_job: Joi.string().allow(null, ""),
    validate_lotno: Joi.string().allow("Y", "N"),
    storage_productwise: Joi.string().allow(null, ""),
    dir_shpmnt: Joi.string().allow(null, ""),
    validate_expdate: Joi.date().allow(null),
    minperiod_exppick: Joi.number().allow("", null),
    rcpt_exp_limit: Joi.number().allow("", null),
    perpectual_confirm_allow: Joi.string().allow(null, ""),
    //---------------storage--------------
    pref_site: Joi.string().allow(null, ""),
    pref_loc_from: Joi.string().allow(null, ""),
    pref_loc_to: Joi.string().allow(null, ""),
    pref_aisle_from: Joi.number().allow("", null),
    pref_aisle_to: Joi.number().allow("", null),
    pref_col_from: Joi.number().allow("", null),
    pref_col_to: Joi.number().allow("", null),
    pref_ht_from: Joi.number().allow("", null),
    pref_ht_to: Joi.number().allow("", null),
    prin_siteind: Joi.string().allow(null, ""),
    service_date: Joi.date().allow(null),
    storage_type: Joi.string().allow(null, ""),
    default_foc: Joi.string().allow(null, ""),
    automate_activity: Joi.string().allow(null, ""),
  });
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};

// ---------------Activity Billing--------------
export const activityBillingSchema = (data: IActivityBilling) => {
  const schema = Joi.object().keys({
    activityPassword: Joi.string(),
    prin_code: Joi.string(),
    act_code: Joi.string().allow("", null),
    from: Joi.string().allow("", null),
    to: Joi.string().allow("", null),
    wip_code: Joi.string(),
    cost: Joi.number().allow("", null),
    income_code: Joi.string(),
    bill_amount: Joi.number().allow("", null),
    jobtype: Joi.string().allow("", null),
    company_code: Joi.string(),
    freeze_flag: Joi.string().length(1),
    mandatory_flag: Joi.string().length(1),
    validate_flag: Joi.string().length(1),
    uoc: Joi.string().allow("", null),
    moc: Joi.number().allow("", null),
    moc1: Joi.string().allow("", null),
    moc2: Joi.string().allow("", null),
    cust_code: Joi.string(),
    start_point: Joi.string(),
    end_point: Joi.string(),
    customer_type: Joi.string(),
    vtype_code: Joi.string(),
    serial_no: Joi.number(),
    serial_no2: Joi.number(),
    updated_by: Joi.string(),
    created_by: Joi.string(),
  });

  return schema.validate(data);
};
// Calll Procedure
export const callProcedureSchema = (data: string) => {
  const schema = Joi.object().keys({
    activityPassword: Joi.string(),
    from: Joi.string().required(),
    to: Joi.string().required(),
  });

  return schema.validate(data);
};
// Division Schema
export const divisionSchema = (data: string) => {
  const schema = Joi.object().keys({
    div_code: Joi.string(),
    div_name: Joi.string(),
    div_short_name: Joi.string(),
    div_address1: Joi.string().allow(null, ""),
    div_address2: Joi.string().allow(null, ""),
    div_address3: Joi.string().allow(null, ""),
    country_code: Joi.string().allow(null, ""),
    phone: Joi.string().allow(null, ""),
    fax: Joi.string().allow(null, ""),
    company_code: Joi.string(),
    email: Joi.string(),
    div_head_id: Joi.string(),
    reamrks: Joi.string(),
    status: Joi.string(),
    user_id: Joi.string(),
    user_dt: Joi.date().allow("", null),
    enterprice_code: Joi.string(),
    payroll_date: Joi.date().allow("", null),
    payroll_status: Joi.string(),
    normal_working_hrs: Joi.number().allow("", null),
    day_off1: Joi.string(),
    day_off2: Joi.string(),
    hr_representative: Joi.string(),
    pay_month: Joi.number().allow("", null),
    pay_year: Joi.number().allow("", null),
    payroll_calc_type: Joi.string(),
    day_off1_half_day: Joi.string(),
    day_off2_half_day: Joi.string(),
    fin_year_start: Joi.date().allow("", null),
    fin_year_end: Joi.date().allow("", null),
    back_name_inv: Joi.string(),
    ac_code_inv: Joi.string(),
    reference_no_inv: Joi.string(),
    bank_address_inv: Joi.string(),
    swift_code_inv: Joi.string(),
    emp_document_path: Joi.string(),
    payroll_cutoff_date: Joi.date().allow("", null),
    payroll_day: Joi.number().allow("", null),
    emp_acgroup: Joi.string(),
    emp_cnt: Joi.string(),
    trn_no: Joi.string(),
    comp_logo: Joi.string(),
    logo_title: Joi.string(),
    default_grade: Joi.string(),
    employer_eid: Joi.string(),
    payer_eid: Joi.string(),
    payer_qid: Joi.string(),
    payer_bank: Joi.string(),
    payer_iban: Joi.string(),
    created_at: Joi.date().allow("", null),
    created_by: Joi.string(),
    update_at: Joi.date().allow("", null),
    updated_by: Joi.string(),
  });

  return schema.validate(data);
};

export const warehouseSchema = (data: IWarehouse) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    wh_code: Joi.string().required(),
    wh_name: Joi.string().required(),
    address: Joi.string().required(),
    country_code: Joi.string().required(),
    phone: Joi.string().required(),
    city: Joi.string().required(),
  });
  return schema.validate(data);
};

export const LocationtypeSchema = (data: ILocationType) => {
  const schema = Joi.object().keys({
    loc_type: Joi.string().required(),
    loc_cbm: Joi.number().allow("", null),
    loc_wt: Joi.number().allow("", null),
    push_level: Joi.number().allow("", null),
    user_id: Joi.string().required(),
    user_dt: Joi.date().allow("", null),
    company_code: Joi.string().required(),
    loc_name: Joi.string().required(),
  });
  return schema.validate(data);
};

export const customerSchemaWms = (data: ICustomer) => {
  const schema = Joi.object().keys({
  company_code: Joi.string().required(),
  prin_code: Joi.string().required(),
  cust_code: Joi.string().required(),
  curr_code: Joi.string().allow("", null),
  country_code: Joi.string().allow("", null),
  cust_name: Joi.string().required(),
  cust_addr1: Joi.string().allow("", null),
  cust_addr2: Joi.string().allow("", null),
  cust_addr3: Joi.string().allow("", null),
  cust_addr4: Joi.string().allow("", null),
  cust_city: Joi.string().allow("", null),
  cust_contact1: Joi.string().allow("", null),
  cust_telno1: Joi.string().allow("", null),
  cust_faxno1: Joi.string().allow("", null),
  cust_email1: Joi.string().email().allow("", null),
  cust_contact2: Joi.string().allow("", null),
  cust_telno2: Joi.string().allow("", null),
  cust_faxno2: Joi.string().allow("", null),
  cust_email2: Joi.string().email().allow("", null),
  cust_contact3: Joi.string().allow("", null),
  cust_telno3: Joi.string().allow("", null),
  cust_faxno3: Joi.string().allow("", null),
  cust_ref1: Joi.string().allow("", null),
  cust_ref2: Joi.string().allow("", null),
  cust_ref3: Joi.string().allow("", null),
  service_date: Joi.date().allow(null),
  cust_acref: Joi.string().allow("", null),
  cust_credit: Joi.number().allow(null),
  cust_stat: Joi.string().allow("", null),
  cust_imp_code: Joi.string().allow("", null),
  cust_lic_no: Joi.string().allow("", null),
  cust_lic_type: Joi.string().allow("", null),
  user_id: Joi.string().allow("", null),
  date_time: Joi.date().allow(null),
  price_check: Joi.string().allow("", null),
  cust_email3: Joi.string().email().allow("", null),
  payment_terms: Joi.number().allow(null),
  importer_code: Joi.string().allow("", null),
  reff_cust_code: Joi.string().allow("", null),
  min_exp_days: Joi.number().allow(null),
  cust_mobile_no: Joi.string().allow("", null),
  vat_no: Joi.string().allow("", null),
  cust_photo: Joi.string().allow("", null),
  label_seq_no: Joi.number().allow(null),
  cust_prefix: Joi.string().allow("", null),
  act_code: Joi.string().allow("", null),
  zone_id: Joi.string().allow("", null),
});
return schema.validate(data);
}

