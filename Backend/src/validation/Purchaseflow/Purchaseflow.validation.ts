import Joi from "joi";

import {
  ICostmaster,
  IItemtmaster,
  ISupplier,
  IMsPsCustomer,
  IDivisionmaster,
} from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { IProjectmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";

export const divisionmasterSchema = (data: IDivisionmaster) => {
   const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    div_code: Joi.string().required(),
    div_name: Joi.string().required(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const materialcategorySchema = (data: ICostmaster) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    mater_category_code: Joi.string().required(),
    mater_category_desp: Joi.string().required(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const costmasterSchema = (data: ICostmaster) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    cost_code: Joi.string().required(),
    cost_name: Joi.string().required(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const projectmasterSchema = (data: IProjectmaster) => {
  const schema = Joi.object().keys({
    project_code: Joi.string().optional().allow(null),
    project_name: Joi.string().optional().allow(null),
    company_code: Joi.string().optional().allow(null),
    div_code: Joi.string().required(),
    prno_pre_fix: Joi.string().required(),
    flag_proj_department: Joi.string().optional().allow(null),
    project_date_from: Joi.date().optional().allow(null),
    project_date_to: Joi.date().optional().allow(null),
    total_project_cost: Joi.number().required(),
    facility_mgr_name: Joi.string().required(),
    facility_mgr_email: Joi.string().email().required(),
    facility_mgr_phone: Joi.string()
      .required()
      .pattern(/^[0-9\s\-()+]+$/),
    project_type: Joi.string().optional().allow(null),
    updated_at: Joi.date().optional().allow(null),
    updated_by: Joi.string().optional().allow(null),
    created_at: Joi.date().optional().allow(null),
    created_by: Joi.string().optional().allow(null),
  });

  return schema.validate(data, { abortEarly: false });
};

export const itemmasterSchema = (data: IItemtmaster) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().required(),
    item_code: Joi.string().required(),
    item_desp: Joi.string().required(),
    cost_code: Joi.string().required(),
  });
  return schema.validate(data);
};

export const supplierSchema = (data: ISupplier) => {
  const schema = Joi.object({
    company_code: Joi.string().optional().allow(null, ""),
  supp_code: Joi.string().optional().allow(null, ""),
  curr_code: Joi.string().optional().allow(null, ""),
  country_code: Joi.string().optional().allow(null, ""),
  supp_name: Joi.string().required(),

  supp_addr1: Joi.string().optional().allow(null, ""),
  supp_addr2: Joi.string().optional().allow(null, ""),
  supp_addr3: Joi.string().optional().allow(null, ""),
  supp_addr4: Joi.string().optional().allow(null, ""),
  supp_city: Joi.string().optional().allow(null, ""),

  supp_contact1: Joi.string().optional().allow(null, ""),
  supp_telno1: Joi.string().optional().allow(null, ""),
  supp_faxno1: Joi.string().optional().allow(null, ""),
  supp_email1: Joi.string().optional().allow(null, ""),

  supp_contact2: Joi.string().optional().allow(null, ""),
  supp_telno2: Joi.string().optional().allow(null, ""),
  supp_faxno2: Joi.string().optional().allow(null, ""),
  supp_email2: Joi.string().email().optional().allow(null, ""),

  supp_contact3: Joi.string().optional().allow(null, ""),
  supp_telno3: Joi.string().optional().allow(null, ""),
  supp_faxno3: Joi.string().optional().allow(null, ""),
  supp_email3: Joi.string().email().optional().allow(null, ""),

  supp_ref1: Joi.string().optional().allow(null, ""),
  supp_ref2: Joi.string().optional().allow(null, ""),
  supp_ref3: Joi.string().optional().allow(null, ""),

  service_date: Joi.date().optional().allow(null, ""),
  supp_acref: Joi.string().optional().allow(null, ""),
  supp_credit: Joi.number().optional().allow(null),
  supp_stat: Joi.string().optional().allow(null, ""),
  supp_imp_code: Joi.string().optional().allow(null, ""),
  supp_lic_no: Joi.string().optional().allow(null, ""),
  supp_lic_type: Joi.string().optional().allow(null, ""),
  price_check: Joi.string().optional().allow(null, ""),

  importer_code: Joi.string().optional().allow(null, ""),
  old_supplier_code: Joi.string().optional().allow(null, ""),
  mobile: Joi.string().optional().allow(null, ""),
  address: Joi.string().optional().allow(null, ""),
  cr_number: Joi.string().optional().allow(null, ""),

  created_at: Joi.date().optional().allow(null),
  updated_at: Joi.date().optional().allow(null),
  created_by: Joi.string().optional().allow(null, ""),
  updated_by: Joi.string().optional().allow(null, ""),

  prin_code: Joi.string().optional().allow(null, ""),
  payment_terms: Joi.string().optional().allow(null, ""),
  mater_category_code: Joi.string().optional().allow(null, ""),
  });

  return schema.validate(data);
};

export const customerSchema = (data: IMsPsCustomer) => {
  const schema = Joi.object({
    cust_code: Joi.string().optional().allow(null, ""),
    cust_name: Joi.string().optional().allow(null, ""),
    cust_add1: Joi.string().optional().allow(null, ""),
    cust_add2: Joi.string().optional().allow(null, ""),
    cust_add3: Joi.string().optional().allow(null, ""),
    pincode: Joi.string().optional().allow(null, ""),
    phone_number: Joi.string().optional().allow(null, ""),
    email_id: Joi.string().email().optional().allow(null, ""),
    company_code: Joi.string().optional().allow(null, ""),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};
