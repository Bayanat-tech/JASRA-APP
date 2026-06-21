import Joi from "joi";
import { ISmscompanymaster } from "../../interfaces/SMS/sms_interface";
import { IServicemaster } from "../../interfaces/SMS/sms_interface";
import { ISmsSegmentmaster } from "../../interfaces/SMS/sms_interface";
import { ISmsSalesmaster } from "../../interfaces/SMS/sms_interface";
import { ISmsReasonmaster } from "../../interfaces/SMS/sms_interface";
import { ISmsDealmaster } from "../../interfaces/SMS/sms_interface";
import { ISmsProbabilitymaster } from "../../interfaces/SMS/sms_interface";
import { ISmsSalesRequestmaster } from "../../interfaces/SMS/sms_interface";

export const cfscompanySchema = (data: ISmscompanymaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    company_code: Joi.string().allow(""),
    company_name: Joi.string().optional(),
    address: Joi.string(),
    city: Joi.string(),
    country: Joi.string(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const serviceSchema = (data: IServicemaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    service_code: Joi.string().allow(""),
    service_name: Joi.string().optional(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const segmentSchema = (data: ISmsSegmentmaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    segment_code: Joi.string().allow(""),
    segment_name: Joi.string().optional(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const salesSchema = (data: ISmsSalesmaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    sales_code: Joi.string().allow(""),
    sales_name: Joi.string().optional(),
    contact_no: Joi.string().optional(),
    email: Joi.string().optional(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const reasonSchema = (data: ISmsReasonmaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    reason_code: Joi.string().allow(""),
    lost_reason: Joi.string().required(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const dealSchema = (data: ISmsDealmaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    status_code: Joi.string().allow(""),
    deal_status: Joi.string().required(),
    status_percentage: Joi.number(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const probabilitySchema = (data: ISmsProbabilitymaster) => {
  const schema = Joi.object().keys({
    id: Joi.number().optional().allow(""),
    probability_code: Joi.string().allow(""),
    deal_probability: Joi.string().required(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};

export const salesRequestSchema = (data: ISmsSalesRequestmaster) => {
  const schema = Joi.object().keys({
    sr_no: Joi.number().optional().allow(""),
    sales_name: Joi.string().required(),
    company_name: Joi.string().required(),
    service_offered: Joi.string().required(),
    segment: Joi.string().required(),
    contact_name: Joi.string().required(),
    contact_number: Joi.number().optional().allow(""),
    deal_desc: Joi.string().required(),
    deal_ref: Joi.string().optional(),
    deal_date: Joi.date().optional().allow(""),
    deal_size: Joi.string().optional(),
    deal_probability: Joi.string().required(),
    deal_status: Joi.string().required(),
    weighted_forecast: Joi.string().optional(),
    lost_reason: Joi.string().optional(),
    status_update: Joi.string().optional(),
    project_closing_date: Joi.date().optional().allow(""),
    next_action: Joi.string().optional(),
    note: Joi.string().optional(),
    updated_at: Joi.date().allow("", null),
    updated_by: Joi.string().allow(null, ""),
    created_by: Joi.string().allow(null, ""),
    created_at: Joi.date().allow("", null),
  });
  return schema.validate(data);
};
