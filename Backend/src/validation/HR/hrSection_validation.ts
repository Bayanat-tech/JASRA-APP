import Joi from 'joi';
import { IHrSection } from '../../interfaces/Hr/hr_section'; 

export const sectionSchema = (
  data: IHrSection | IHrSection[],
  userCompany: string,
  isBulkOperation: boolean
) => {
  const baseSchema = Joi.object().keys({
    company_code: Joi.string().allow('', null).max(20), // Allows empty string or null
    div_code: Joi.string().allow('', null).max(20),
    dept_code: Joi.string().allow('', null).max(20),
    section_code: Joi.string().max(10).required(), // Mandatory
    section_name: Joi.string().max(50).required(), // Mandatory
    section_short_name: Joi.string().allow('', null).max(10),
    sect_addr1: Joi.string().allow('', null).max(100),
    sect_addr2: Joi.string().allow('', null).max(100),
    sect_addr3: Joi.string().allow('', null).max(100),
    phone: Joi.string().allow('', null).max(15),
    fax: Joi.string().allow('', null).max(15),
    email: Joi.string().email().allow('', null), // Validate as email if present
    sect_head_id: Joi.string().allow('', null).max(20),
    remarks: Joi.string().allow('', null).max(100),
    status: Joi.string().length(1).valid('Y', 'N').required(),
    user_id: Joi.string().allow('', null).max(20),
    user_dt: Joi.date().allow('', null),
    enterprice_code: Joi.string().allow('', null).max(20),
    staff_cntrl_ac_group: Joi.string().allow('', null).max(20),
    staff_loan_ac_group: Joi.string().allow('', null).max(20),
    salary_expense_ac_code: Joi.string().allow('', null).max(20),
    expense_sub_type: Joi.string().allow('', null).max(50),
    expense_type: Joi.string().allow('', null).max(50)
  });

  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};
