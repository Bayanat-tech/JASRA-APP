import Joi from 'joi';
import { IHrPaycomponent } from '../../interfaces/Hr/hr_paycomponents';

export const hrPaycomponentsSchema = (data: IHrPaycomponent) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().max(7).required(),
    pay_comp_id: Joi.string().max(10).required(),
    pay_comp_desc: Joi.string().max(50).required(),
    remarks:Joi.string().max(100).allow(null),
    updated_at: Joi.date().allow(null),
    updated_by: Joi.string().max(50).allow(null),
    created_by: Joi.string().max(20),
    created_at: Joi.date(),
  });
  
  return schema.validate(data);
};
