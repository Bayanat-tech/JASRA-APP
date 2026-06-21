import Joi from 'joi';
import { IKpiNameMaster } from '../../interfaces/Hr/hr_category_interface'; 

export const hrKpiNameSchema = (data: IKpiNameMaster) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().max(7).required(),
    kpi_name: Joi.string().max(50).required(),
    serial_no: Joi.number().required(),   
  });

  return schema.validate(data);
};
