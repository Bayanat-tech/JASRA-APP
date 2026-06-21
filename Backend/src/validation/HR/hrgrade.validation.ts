import Joi from "joi";
import { IHrGrade } from "../../interfaces/Hr/hr_grade";

export const gradeSchema = (
  data: IHrGrade,
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(userCompany).required(),
    grade_code: Joi.string().required(),
    grade_name: Joi.string().required(),
    grade_short_name: Joi.string().required(),
    ot_eligibility: Joi.string().valid("Y", "N").required(),
    grade_status: Joi.string().allow(null),
    remarks: Joi.string().allow(null),
    status: Joi.string().allow(null),
    type: Joi.string().allow(null),
    dep_med_entitlement: Joi.string().allow(null),
    spouse_med_entitlement: Joi.string().allow(null),
    medical_entitlement: Joi.string().allow(null),
    dep_af_entitlement: Joi.string().allow(null),
    spouse_af_entitlement: Joi.string().allow(null),
    airfare_entitlement: Joi.string().allow(null),
  });
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};
