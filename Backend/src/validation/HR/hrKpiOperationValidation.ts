import Joi from 'joi';
import { IOperationMaster } from '../../interfaces/Hr/hr_category_interface'; 

export const hrKpiOperationSchema = (data: IOperationMaster) => {
  const schema = Joi.object().keys({
    company_code: Joi.string().max(7).required(),
    operation_name: Joi.string().max(50).required(),
    serial_no: Joi.number().required(),   
  });

  return schema.validate(data);
};
