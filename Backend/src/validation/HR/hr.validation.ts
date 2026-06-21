import Joi from "joi";
import { IHrEmployee } from "../../interfaces/Hr/hr_employee";

/**
 * Employee schema validation function.
 * 
 * @param {IHrEmployee | IHrEmployee[]} data - Employee data to be validated.
 * @param {boolean} [isBulkOperation] - Flag to indicate bulk operation.
 * @param {string} [company_code] - Company code for bulk operation.
 * @returns {Joi.ValidationResult} - Validation result.
 */
export const employeeSchema = (
  data: IHrEmployee | IHrEmployee[],
  isBulkOperation?: boolean,
  company_code?: string
) => {
  /**
   * Base schema for employee data.
   */
  const baseSchema = Joi.object({
    /**
     * Employee code.
     */
    employee_code: Joi.optional().allow(null, ""),
    /**
     * Employee photo.
     */
    emp_photo: Joi.optional().allow(null, ""),
    /**
     * Alternate ID.
     */
    alternate_id: Joi.required(),
    /**
     * Reporting name.
     */
    rpt_name: Joi.required(),
    /**
     * Grade code.
     */
    grade_code: Joi.required(),
    /**
     * Designation code.
     */
    desg_code: Joi.required(),
    /**
     * Labour designation code.
     */
    labour_desg_code: Joi.required(),
    /**
     * Category code.
     */
    category_code: Joi.required(),
    /**
     * Birth date.
     */
    birth_date: Joi.date().required(),
    /**
     * Join date.
     */
    join_date: Joi.date().required(),
    /**
     * Division code.
     */
    div_code: Joi.required(),
    /**
     * Department code.
     */
    dept_code: Joi.required(),
    /**
     * Section code.
     */
    section_code: Joi.required(),
    /**
     * Probation end date.
     */
    probation_end_date: Joi.date().required(),
    /**
     * Probation confirm date.
     */
    probation_confirm_date: Joi.date().required(),
    /**
     * Employee status.
     */
    emp_status: Joi.required(),
    /**
     * Country code.
     */
    country_code: Joi.required(),
    /**
     * Include in payroll.
     */
    include_in_payroll: Joi.valid("Y", "N").required(),
    /**
     * Payroll start date.
     */
    payroll_start_date: Joi.date().optional().allow(null, ""),
    /**
     * Payment mode.
     */
    payment_mode: Joi.optional().valid("A", "I", "O").allow("", null),
    /**
     * Company bank code.
     */
    company_bank_code: Joi.optional().allow(null, ""),
    /**
     * Salary account number.
     */
    salary_acct_no: Joi.optional().allow(null, ""),
    /**
     * Salary bank code.
     */
    salary_bank_code: Joi.optional().allow(null, ""),
    /**
     * Currency ID.
     */
    currency_id: Joi.optional().allow(null, ""),
    /**
     * Exchange rate.
     */
    exch_rate: Joi.number().optional().allow(null),
    /**
     * Employee IBAN number.
     */
    emp_iban_no: Joi.optional().allow(null, ""),
    /**
     * Passport number.
     */
    ppt_no: Joi.optional().allow(null, ""),
    /**
     * Passport name.
     */
    ppt_name: Joi.optional().allow(null, ""),
    /**
     * Passport country.
     */
    ppt_country: Joi.optional().allow(null, ""),
    /**
     * Passport status.
     */
    ppt_status: Joi.valid("A", "I").optional().allow(null, ""),
    /**
     * Passport valid from.
     */
    ppt_valid_from: Joi.date().optional().allow(null, ""),
    /**
     * Passport valid to.
     */
    ppt_valid_to: Joi.date().optional().allow(null, ""),
    /**
     * Passport with.
     */
    passport_with: Joi.valid("A", "I").optional().allow(null, ""),
    /**
     * Contract type.
     */
    contract_type: Joi.required(),
    /**
     * Contract start date.
     */
    contract_start_date: Joi.date().required(),
    /**
     * Contract end date.
     */
    contract_end_date: Joi.date().required(),
    /**
     * Contract renewable.
     */
    contract_renewable: Joi.valid("Y", "N").required(),
    /**
     * Sponsor ID.
     */
    sponsor_id: Joi.required(),
    /**
     * Visa type.
     */
    visa_type: Joi.valid("A", "I").required(),
    /**
     * Visa valid from.
     */
    visa_valid_from: Joi.date().required(),
    /**
     * Visa valid to.
     */
    visa_valid_to: Joi.date().required(),
    /**
     * Insurance card number.
     */
    ins_card_no: Joi.optional().allow(null, ""),
    /**
     * Insurance card issue date.
     */
    ins_card_issue_dt: Joi.date().optional().allow(null, ""),
    /**
     * Insurance card expiry date.
     */
    ins_card_exp_dt: Joi.date().optional().allow(null, ""),
    /**
     * Insurance card type.
     */
    ins_card_type: Joi.optional().allow(null, ""),
    /**
     * Labour card number.
     */
    labourcard_no: Joi.required(),
    /**
     * Pasi number.
     */
    pasi_no: Joi.optional().allow(null, ""),
    /**
     * Labour card valid from.
     */
    labourcard_valid_from: Joi.required(),
    /**
     * Labour card valid to.
     */
    labourcard_valid_to: Joi.required(),
    /**
     * Labour card status.
     */
    labourcard_status: Joi.valid("A", "I").required(),
    /**
     * Airport code.
     */
    airport_code: Joi.optional().allow(null, ""),
    /**
     * Ticket eligibility.
     */
    ticket_eligibility: Joi.valid("Y", "N").optional().allow(null, ""),
    /**
     * Ticket dependant adult.
     */
    ticket_dpend_adult: Joi.number().optional().allow(null),
    /**
     * TA number.
     */
    ta_no: Joi.number().optional().allow(null),
    /**
     * TC number.
     */
    tc_no: Joi.number().optional().allow(null),
    /**
     * TI number.
     */
    ti_no: Joi.number().optional().allow(null),
    /**
     * Ticket eligible period.
     */
    ticket_eligible_period: Joi.number().optional().allow(null),
    /**
     * Company code for bulk operation.
     */
    ...(isBulkOperation
      ? {
          company_code: Joi.string().valid(company_code),
        }
      : null),
  });
  /**
   * Schema for array of employee data.
   */
  const schema = Joi.array().items(baseSchema);
  return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};