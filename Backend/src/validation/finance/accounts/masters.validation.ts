// Import Joi validation library and required interfaces
import Joi from "joi";
import {
  IAccountFinanceAttributes,
  IAccountLevelFourAttributes,
  IAccountLevelThreeAttributes,
} from "../../../interfaces/finance/accounts/masters/actree_finance.interface";

// Validation schema for level three finance accounts
// Validates description and parent level 2 code
export const accountLevelThreeFinanceSchema = (
  data: IAccountLevelThreeAttributes
) => {
  const schema = Joi.object().keys({
    l3_description: Joi.string().required(),
    l2_code: Joi.string().required(),
  });
  return schema.validate(data);
};

// Validation schema for level four finance accounts
// Validates parent level 3 code, description and various Y/N flags
export const accountLevelFourFinanceSchema = (
  data: IAccountLevelFourAttributes
) => {
  const schema = Joi.object().keys({
    l3_code: Joi.string().required(),
    l4_description: Joi.string().required(),
    l4_type: Joi.string().valid("Y", "N").required(),
    l4_job: Joi.string().valid("Y", "N").required(),
    l4_bill: Joi.string().valid("Y", "N").required(),
  });
  return schema.validate(data);
};

// Main finance account validation schema
// Contains comprehensive validation rules for all account related information
export const accountFinanceSchema = (data: IAccountFinanceAttributes) => {
  const schema = Joi.object().keys({
    //--------contact---------
    // Basic account identification and contact details
    l4_code: Joi.string().required(),        // Required level 4 code identifier
    ac_name: Joi.string().required(),        // Required account name
    address_1: Joi.string().optional().allow(null).allow(""),  // Primary address line
    address_2: Joi.string().optional().allow(null).allow(""),  // Secondary address line
    address_3: Joi.string().optional().allow(null).allow(""),  // Tertiary address line
    territory_code: Joi.string().optional().allow(null).allow(""),  // Territory identifier
    city_name: Joi.string().allow(null).allow(""),            // City name
    country_code: Joi.string().optional().allow(null).allow(""),  // Country identifier
    phone: Joi.string().optional().allow(null).allow(""),     // Phone number
    mobile_no: Joi.string().optional().allow(null).allow(""), // Mobile number
    fax: Joi.string().optional().allow(null).allow(""),      // Fax number
    e_mail: Joi.string().email().optional().allow(null).allow(""), // Email address with validation
    contact_person: Joi.string().optional().allow(null).allow(""), // Contact person name

    //--------account---------
    // Account specific financial details
    dept_code: Joi.string().optional().allow(null).allow(""),      // Department code
    credit_period: Joi.number().integer().min(0).optional().allow(null), // Credit period in days
    credit_amount: Joi.number().min(0).optional().allow(null),     // Credit limit amount
    curr_code: Joi.string().optional().allow(null).allow(""),      // Currency code

    //--------bank---------
    // Banking information
    bank_ac_code: Joi.string().optional().allow(null).allow(""),   // Bank account code
    bank_name: Joi.string().optional().allow(null).allow(""),      // Bank name
    bank_swift: Joi.string().optional().allow(null).allow(""),     // SWIFT code

    //--------contract---------
    // Contract related information
    contract_expry_date: Joi.date().optional().allow(null).allow(""), // Contract expiry date
    ac_infze: Joi.string().optional().allow(null).allow(""),         // Account info

    //--------sales---------
    // Sales and tax related information
    salesman_code: Joi.string().optional().allow(null).allow(""),    // Salesperson identifier
    sector_code: Joi.string().optional().allow(null).allow(""),      // Business sector code
    trn_no: Joi.string().optional().allow(null).allow(""),          // Tax registration number
    tax_registrd: Joi.string().optional().allow(null).allow(""),    // Tax registration status
    tax_country_code: Joi.string().optional().allow(null).allow(""), // Tax country code
    rcm_apply: Joi.string().optional().allow(null).allow(""),       // Reverse charge mechanism flag

    //--------bi---------
    // Business intelligence and grouping information
    bi_main_group: Joi.string().optional().allow(null).allow(""),    // Main group classification
    bi_sub_group: Joi.string().optional().allow(null).allow(""),     // Sub group classification
    pl_bl_code: Joi.string().optional().allow(null).allow(""),       // P&L/Balance sheet code
    bi_exp_type: Joi.string().optional().allow(null).allow(""),      // Expense type
    bi_pl_bs_ind: Joi.string().optional().allow(null).allow(""),     // P&L/BS indicator
    bi_dept: Joi.string().optional().allow(null).allow(""),          // BI department code
    files: Joi.array().items(Joi.any()).allow(null),                 // Associated files array
  });
  return schema.validate(data);
};
