import Joi from 'joi';
import { IHrLeavetype } from '../../interfaces/Hr/hr_leavetype';

export const hrLeavetypeSchema = (data: IHrLeavetype) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().max(7).required(),
    leave_type: Joi.string().max(10).required(),
    leave_type_desc: Joi.string().max(50).required(),
    carry_forward:Joi.string().max(1).allow(null),
    half_day:Joi.string().max(1).allow(null),
    updated_at: Joi.date().allow(null),
    updated_by: Joi.string().max(50).allow(null),
    created_by: Joi.string().max(20),
    created_at: Joi.date(),
  });
  
  return schema.validate(data);
};
