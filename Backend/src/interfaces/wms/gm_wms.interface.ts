export interface ICountry {
  country_code: string;
  country_name: string;
  country_gcc: string;
  company_code?: string;
  short_desc?: string;
  nationality?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}
export interface IAlert {
  company_code: string;
  op_code: string;
  op_type: string;
  op_desc: string;
  op_sequence: string;
  op_module?: string | null;
  op_mode?: string | null;
  instruction: "Y" | "N";
  created_at?: Date;
  created_by?: string | null;
  updated_at?: Date;
  updated_by?: string | null;
}

export interface IProducttype {
  prodtype_code: string;
  prodtype_desc: string;
  company_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IAccountsetup {
  ac_code: string;
  ac_name: string;
  company_code?: string;
  amount_decimal_nos?: Number;
  bank_name?: string;
  lcur_decimal_nos?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IManufacture {
  manu_code: string;
  manu_name: string;
  company_code?: string;
  prin_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}
export interface IGroup {
  group_code: string;
  group_name: string;
  company_code?: string;
  prin_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IIndustrysector {
  sector_code: string;
  sector_name: string;
  remarks: string;
  company_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IProduct {
  prin_code: string;
  prod_code: string;
  prod_name: string;
  group_code?: string;
  brand_code?: string;
  packdesc?: string;
  barcode?: string;
  p_uom?: string;
  suom?: string;
  length?: number;
  breadth?: number;
  height?: number;
  volume?: number;
  gross_wt?: number;
  net_wt?: number;
  foc?: string;
  cpu?: number;
  harm_code?: string;
  imco_code?: string;
  kitting?: string;
  manu_code?: string;
  base_price?: number;
  flat_storage?: number;
  site_type?: string;
  site_ind?: string;
  pack_key?: string;
  prod_ti?: number;
  prod_hi?: number;
  chargetime?: string;
  prod_status?: string;
  shelf_life?: number;
  category_abc?: string;
  reord_level?: number;
  reord_qty?: number;
  alt_prod_code?: string;
  pref_site?: string;
  pref_loc_from?: string;
  pref_loc_to?: string;
  pref_aisle_from?: string;
  pref_aisle_to?: string;
  pref_col_from?: number;
  pref_col_to?: number;
  pref_ht_from?: number;
  pref_ht_to?: number;
  uppp?: number;
  chk_manucode?: string;
  chk_lotno?: string;
  chk_mfgexpdt?: string;
  puom_volume?: number;
  puom_netwt?: number;
  puom_grosswt?: number;
  l_uom?: string;
  luppp?: number;
  uom_count?: number;
  prod_type?: number;
  company_code?: string;
  twoplus_uom?: string;
  upp?: number;
  wave_code?: number;
  product_stage?: string;
  co_pack?: string;
  model_number?: string;
  variant_code?: string;
  cnt_origin?: string;
  serialize?: string;
  packing?: string;
  old_upp?: number;
  avg_consumption?: number;
  prod_image_path_web?: string;
  minperiod_exppick?: number;
  rcpt_exp_limit?: number;
  qty_as_wt?: string;
  hazmat_ind?: string;
  hazmat_class?: string;
  food_ind?: string;
  pharma_ind?: string;
  special_instructions?: string;
  strength?: string;
  pack_size?: number;
  group_code_bk?: string;
  batch_type?: number;
  sap_prod_code?: string;
  sap_prod_desc?: string;
  temp_code?: string;
  edit_user?: string;
  class?: string;
  wob?: number;
  unified_code?: string;
  current_season?: string;
  product_category?: string;
  generic_article?: string;
  prod_gender?: string;
  prod_color?: string;
  prod_size?: string;
  prnt_p_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IProductEdi {
  PRIN_CODE: string;
  PROD_CODE: string;
  COMPANY_CODE: string;
  PROD_NAME: string;
  GROUP_CODE?: string;
  BRAND_CODE?: string;
  PACKDESC?: string;
  BARCODE?: string;
  P_UOM?: string;
  SUOM?: string;
  LENGTH?: number;
  BREADTH?: number;
  HEIGHT?: number;
  VOLUME?: number;
  GROSS_WT?: number;
  NET_WT?: number;
  FOC?: string;
  CPU?: number;
  HARM_CODE?: string;
  IMCO_CODE?: string;
  KITTING?: string;
  MANU_CODE?: string;
  BASE_PRICE?: number;
  FLAT_STORAGE?: number;
  SITE_TYPE?: string;
  SITE_IND?: string;
  PACK_KEY?: string;
  PROD_TI?: number;
  PROD_HI?: number;
  CHARGETIME?: string;
  PROD_STATUS?: string;
  SHELF_LIFE?: number;
  CATEGORY_ABC?: string;
  REORD_LEVEL?: number;
  REORD_QTY?: number;
  ALT_PROD_CODE?: string;
  PREF_SITE?: string;
  PREF_LOC_FROM?: string;
  PREF_LOC_TO?: string;
  PREF_AISLE_FROM?: string;
  PREF_AISLE_TO?: string;
  PREF_COL_FROM?: number;
  PREF_COL_TO?: number;
  PREF_HT_FROM?: number;
  PREF_HT_TO?: number;
  UPPP?: number;
  CHK_MANUCODE?: string;
  CHK_LOTNO?: string;
  CHK_MFGEXPDT?: string;
  PUOM_VOLUME?: number;
  PUOM_NETWT?: number;
  PUOM_GROSSWT?: number;
  L_UOM?: string;
  LUPPP?: number;
  UOM_COUNT?: number;
  PROD_TYPE?: number;
  TWOPLUS_UOM?: string;
  UPP?: number;
  WAVE_CODE?: number;
  PRODUCT_STAGE?: string;
  CO_PACK?: string;
  MODEL_NUMBER?: string;
  VARIANT_CODE?: string;
  CNT_ORIGIN?: string;
  SERIALIZE?: string;
  PACKING?: string;
  OLD_UPP?: number;
  AVG_CONSUMPTION?: number;
  PROD_IMAGE_PATH_WEB?: string;
  MINPERIOD_EXPPICK?: number;
  RCPT_EXP_LIMIT?: number;
  QTY_AS_WT?: string;
  HAZMAT_IND?: string;
  HAZMAT_CLASS?: string;
  FOOD_IND?: string;
  PHARMA_IND?: string;
  SPECIAL_INSTRUCTIONS?: string;
  STRENGTH?: string;
  PACK_SIZE?: number;
  GROUP_CODE_BK?: string;
  BATCH_TYPE?: number;
  SAP_PROD_CODE?: string;
  SAP_PROD_DESC?: string;
  TEMP_CODE?: string;
  EDIT_USER?: string;
  CLASS?: string;
  WOB?: number;
  UNIFIED_CODE?: string;
  CURRENT_SEASON?: string;
  PRODUCT_CATEGORY?: string;
  GENERIC_ARTICLE?: string;
  PROD_GENDER?: string;
  PROD_COLOR?: string;
  PROD_SIZE?: string;
  PRNT_P_CODE?: string;
  UPDATED_AT?: Date | string;
  UPDATED_BY?: string;
  CREATED_BY?: string;
  CREATED_AT?: Date | string;
  DIV_CODE?: string;
  AWS_PATH?: string;
}

export interface IDepartment {
  dept_code: string;
  dept_name: string;
  inv_flag: string;
  jobno_seq: number;
  invno_seq: number;
  company_code: string;
  operation_type: string;
  div_code: number;
  ac_div_code: string;
  dept_email: string;
  dn_email: string;
  grn_email: string;
  inv_gen: string;
  inb_oub_related: string;
  inv_prefix: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISalesman {
  company_code: string;
  salesman_code?: string;
  salesman_name: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IBrand {
  brand_code: string;
  prin_code: string;
  group_code: string;
  brand_name?: string;
  pref_site?: string;
  pref_loc_from?: string;
  pref_loc_to?: string;
  pref_aisle_from?: string;
  pref_aisle_to?: string;
  pref_col_from?: number;
  pref_col_to?: number;
  pref_ht_from?: number;
  pref_ht_to?: number;
  company_code: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface ISupplier {
  company_code?: string;
  prin_code: string;
  supp_code: string;
  curr_code?: string;
  country_code?: string;
  supp_name?: string;
  supp_addr1?: string;
  supp_addr2?: string;
  supp_addr3?: string;
  supp_addr4?: string;
  supp_city?: string;
  supp_contact1?: string;
  supp_telno1?: string;
  supp_faxno1?: string;
  supp_email1?: string;
  supp_contact2?: string;
  supp_telno2?: string;
  supp_faxno2?: string;
  supp_email2?: string;
  supp_contact3?: string;
  supp_telno3?: string;
  supp_faxno3?: string;
  supp_ref1?: string;
  supp_ref2?: string;
  supp_ref3?: string;
  service_date?: Date;
  supp_acref?: string;
  supp_credit?: number;
  supp_stat?: string;
  supp_imp_code?: string;
  supp_lic_no?: string;
  supp_lic_type?: string;
  price_check?: string;
  supp_email3?: string;
  payment_terms?: number;
  importer_code?: string;
  old_supplier_code?: string;
  mobile?: string;
}

export interface ICountry {
  country_code: string;
  country_name: string;
  country_gcc: string;
  company_code?: string;
  short_desc?: string;
  nationality?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IIndustrysector {
  sector_code: string;
  sector_name: string;
  remarks: string;
}
export interface IUom {
  uom_code: string;
  uom_name: string;
  company_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IDepartment {
  dept_code: string;
  dept_name: string;
  inv_flag: string;
  jobno_seq: number;
  invno_seq: number;
  company_code: string;
  operation_type: string;
  div_code: number;
  ac_div_code: string;
  dept_email: string;
  dn_email: string;
  grn_email: string;
  inv_gen: string;
  inb_oub_related: string;
  inv_prefix: string;
}
export interface IMoc {
  charge_code: string;
  description: string;
  charge_type: string;
  company_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IMoc2 {
  charge_code: string;
  description: string;
  charge_type: string;
  company_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface IUoc {
  charge_code: string;
  description: string;
  charge_type: string;
  company_code?: string;
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface THarmonize {
  harm_code: string;
  harm_desc: string;
  short_desc: string;
  uom: string;
  permit_reqd: string;
  unit: string;
  company_code?: string;
  updated_at?: Date;
  updated_by?: string;
  created_by?: string;
  created_at?: Date;
}
