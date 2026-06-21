import Joi from 'joi';
import { ICategorymaster } from '../../interfaces/Hr/hr_category_interface';

/**
 * Validates the provided data against the hrCategory schema.
 * 
 * @param {ICategorymaster} data - The data to be validated.
 * @returns {Object} The result of the validation.
 */
export const hrCategorySchema = (data: ICategorymaster) => {
  /**
   * Defines the schema for validating hrCategory data.
   */
  const schema = Joi.object().keys({
    /**
     * The company code (max 7 characters).
     */
    company_code: Joi.string().max(7).required(),
    /**
     * The category code (max 10 characters).
     */
    category_code: Joi.string().max(10).required(),
    /**
     * The category name (max 50 characters).
     */
    category_name: Joi.string().max(50).required(),
    /**
     * The category short name (max 10 characters).
     */
    category_short_name: Joi.string().max(10).allow(null),
    /**
     * Remarks (max 100 characters).
     */
    remarks: Joi.string().max(100).allow(null),
    /**
     * The status (either 'A' or 'N').
     */
    status: Joi.string().length(1).valid('A', 'N').required(),
    /**
     * The date of last update.
     */
    updated_at: Joi.date().allow(null),
    /**
     * The user who last updated the data.
     */
    updated_by: Joi.string().max(50).allow(null),
    /**
     * The user who created the data.
     */
    created_by: Joi.string().max(20),
    /**
     * The date of creation.
     */
    created_at: Joi.date(),
  });
  
  /**
   * Validates the provided data against the schema.
   */
  return schema.validate(data);
};