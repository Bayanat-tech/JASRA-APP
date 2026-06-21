import Joi from "joi";
import { IHrLabourDesignation } from "../../interfaces/Hr/hr_labour_designation";

export const formaldesignationSchema = (
  data: IHrLabourDesignation,
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(userCompany).required(),
    labour_desg_code: Joi.string().required(),
    labour_desg_name: Joi.string().required(),
    labour_desg_short_name: Joi.string().required(),
    remarks: Joi.string().allow(null),
    status: Joi.string().allow(null),
  });
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};
