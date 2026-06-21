import Joi from "joi";
import { IHrDesignation } from "../../interfaces/Hr/hr_designation";

export const designationSchema = (
  data: IHrDesignation,
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().valid(userCompany).required(),
    desg_code: Joi.string().required(),
    desg_name: Joi.string().required(),
    desg_short_name: Joi.string().required(),
    remarks: Joi.string().allow(null),
    status: Joi.string().allow(null),
  });
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};
