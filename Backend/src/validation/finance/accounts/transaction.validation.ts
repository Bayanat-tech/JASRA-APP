import Joi from "joi";
import constants from "../../../helpers/constants";

export const chequePaymentSchema = (
  data: any,
  userCompany?: string,
  isBulkOperation?: boolean
) => {
  const baseSchema = Joi.object({
// Define the Joi schema for the cheque payment document
doc_no: Joi.number().optional().allow("", null), // Document number (optional)
doc_type: Joi.string() // Document type (required)
  .valid(
    constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT, // Cheque payment
    constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_RECEIPT, // Cheque receipt
    constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT // Cash receipt
  )
  .required(),
bank_ac_code: Joi.string().when("doc_type", { // Bank account code (conditional)
  is: constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT, // If document type is cash receipt
  then: Joi.forbidden(), // Then bank account code is forbidden
  otherwise: Joi.allow("", null), // Otherwise bank account code is optional
}),
cheque_bank: Joi.string().when("doc_type", { // Cheque bank (conditional)
  is: [
    constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT, // If document type is cash receipt
    constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT, // or cheque payment
  ],
  then: Joi.forbidden(), // Then cheque bank is forbidden
  otherwise: Joi.allow("", null), // Otherwise cheque bank is optional
}),
cheque_no: Joi.string().when("doc_type", { // Cheque number (conditional)
  is: constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT, // If document type is cash receipt
  then: Joi.forbidden(), // Then cheque number is forbidden
  otherwise: Joi.allow("", null), // Otherwise cheque number is optional
}),
cheque_date: Joi.date().when("doc_type", { // Cheque date (conditional)
  is: constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT, // If document type is cash receipt
  then: Joi.forbidden(), // Then cheque date is forbidden
  otherwise: Joi.allow("", null), // Otherwise cheque date is optional
}),
ac_code: Joi.string().required(), // Account code (required)
doc_date: Joi.date(), // Document date
remarks: Joi.string().optional().allow("", null), // Remarks (optional)
ex_rate: Joi.number().default(1), // Exchange rate (default 1)
curr_code: Joi.string().required(), // Currency code (required)
files: Joi.array() // Files (conditional)
  .items(Joi.any())
  .when("doc_type", {
    is: constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT, // If document type is cheque payment
    then: Joi.allow(null), // Then files are optional
    otherwise: Joi.forbidden(), // Otherwise files are forbidden
  }),
ac_payee: Joi.string().when("doc_type", { // Account payee (conditional)
  is: constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT, // If document type is cheque payment
  then: Joi.allow("", null), // Then account payee is optional
  otherwise: Joi.forbidden(), // Otherwise account payee is forbidden
}),
div_code: Joi.string().required(), // Division code (required)
...(isBulkOperation && { company_code: userCompany }), // Company code (conditional)
detail: Joi.array() // Detail (required)
  .items(
    Joi.object({
      doc_date: Joi.date(), // Document date
      company_code: Joi.string().required(), // Company code (required)
      ac_code: Joi.string().required(), // Account code (required)
      remarks: Joi.string().optional().allow("", null), // Remarks (optional)
      curr_code: Joi.string().required(), // Currency code (required)
      ex_rate: Joi.number(), // Exchange rate
      amount: Joi.number().required(), // Amount (required)
      sign_ind: Joi.number().valid(-1, 1).allow(null), // Sign indicator (optional)
      tx_compntcat_code_1: Joi.string().allow(null, ""), // Transaction component category code 1 (optional)
      tx_compnt_1_expmt: Joi.string().allow(null), // Transaction component 1 expense (optional)
      tx_compnt_perc_1: Joi.number().allow(null), // Transaction component 1 percentage (optional)
      tx_compnt_amt_1: Joi.number().allow(null), // Transaction component 1 amount (optional)
      job_no: Joi.string().optional().allow("", null), // Job number (optional)
      dept_code: Joi.string().allow("", null), // Department code (optional)
      lcur_amount: Joi.number().allow("", null), // Local currency amount (optional)
      tx_compnt_lcuramt_1: Joi.number().allow("", null), // Transaction component 1 local currency amount (optional)
      tx_cat_code: Joi.string().allow("", null), // Transaction category code (optional)
      div_code: Joi.string().required(), // Division code (required)
      doc_no: Joi.number().required(), // Document number (required)
      doc_type: Joi.string() // Document type (required)
        .valid(
          constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT, // Cheque payment
          constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_RECEIPT, // Cheque receipt
          constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT // Cash receipt
        )
        .required(),
      serial_no: Joi.number().required(), // Serial number (required)
    })
  )
  .min(1) // Minimum 1 detail item
  .required() // Detail is required
  .custom((value, helper) => {
    // Ensure 'doc_type' in 'detail' matches the root 'doc_type'
    for (const item of value) {
      if (item.doc_type !== helper.state.ancestors[0].doc_type) {
        throw new Error("doc_type in detail must match root doc_type");
      }
    }
    return value;
  }),
    children: Joi.object({
  // Invoice details
  invoice: Joi.array()
    .items(
      Joi.object({
        // Document date
        doc_date: Joi.date(),
        // Account code (required)
        ac_code: Joi.string().required(),
        // Is deletable (optional, default false)
        IsDeletable: Joi.boolean().optional().default(false),
        // Serial number (required)
        serial_no: Joi.number().required(),
        // Detail serial number (required)
        dtl_sr_no: Joi.number().required(),
        // Document number (optional)
        doc_no: Joi.number().allow(null, ""),
        // Document type (required, valid values: CHEQUE_PAYMENT, CHEQUE_RECEIPT, CASH_RECEIPT)
        doc_type: Joi.string()
          .valid(
            constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT,
            constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_RECEIPT,
            constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT
          )
          .required(),
        // Division code (required)
        div_code: Joi.string().required(),
        // Company code (required)
        company_code: Joi.string().required(),
        // Sign indicator (optional)
        sign_ind: Joi.number().valid(-1, 1).allow(null),
        // Invoice number (optional)
        inv_no: Joi.string().allow("", null).allow("", null),
        // Invoice date (optional)
        inv_date: Joi.date().allow(null).optional(),
        // Invoice amount (optional)
        inv_amt: Joi.number().allow(null).optional(),
        // Current balance amount (optional)
        c_bal_amt_org: Joi.number().allow(null).optional(),
        // Amount (optional, default 0)
        amount: Joi.number().default(0).optional(),
        // Currency code (optional)
        curr_code: Joi.string().allow(null).optional(),
        // Exchange rate (optional)
        ex_rate: Joi.number().allow(null).optional(),
        // Current currency amount (optional)
        c_curr_amt: Joi.number().allow(null).optional(),
      })
    )
    .optional()
    .custom((value, helper) => {
      // Ensure 'doc_type' in 'invoice' matches the root 'doc_type'
      for (const item of value) {
        if (
          item.doc_type !==
          helper.state.ancestors[helper.state.ancestors.length - 1].doc_type
        ) {
          throw new Error("doc_type in invoice must match root doc_type");
        }
      }
      return value;
    }),

  // Job details
  job: Joi.array()
    .items(
      Joi.object({
        // Account code (required)
        ac_code: Joi.string().required(),
        // Serial number (required)
        serial_no: Joi.number().required(),
        // Detail serial number (required)
        dtl_sr_no: Joi.number().required(),
        // Document number (optional)
        doc_no: Joi.number().allow(null, ""),
        // Document type (required, valid values: CHEQUE_PAYMENT, CHEQUE_RECEIPT, CASH_RECEIPT)
        doc_type: Joi.string()
          .valid(
            constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT,
            constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_RECEIPT,
            constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT
          )
          .required(),
        // Division code (required)
        div_code: Joi.string().required(),
        // Document date (required)
        doc_date: Joi.date().required(),
        // Company code (required)
        company_code: Joi.string().required(),
        // Sign indicator (optional)
        sign_ind: Joi.number().valid(-1, 1).allow(null),
        // Job number (optional)
        job_no: Joi.string().allow("", null).optional(),
        // Document reference number (optional)
        doc_refno: Joi.string().allow("", null).optional(),
        // Document reference number 2 (optional)
        doc_refno_2: Joi.string().allow("", null).optional(),
        // Amount (optional)
        amount: Joi.number().allow(null).optional(),
      })
    )
    .optional()
    .custom((value, helper) => {
      // Ensure 'doc_type' in 'job' matches the root 'doc_type'
      for (const item of value) {
        if (
          item.doc_type !==
          helper.state.ancestors[helper.state.ancestors.length - 1].doc_type
        ) {
          throw new Error("doc_type in job must match root doc_type");
        }
      }
      return value;
    }),

  // Expense details
  expense: Joi.array()
    .items(
      Joi.object({
        // Account code (required)
        ac_code: Joi.string().required(),
        // Serial number (required)
        serial_no: Joi.number().required(),
        // Detail serial number (required)
        dtl_sr_no: Joi.number().required(),
        // Document number (optional)
        doc_no: Joi.number().allow(null, ""),
        // Document type (required, valid values: CHEQUE_PAYMENT, CHEQUE_RECEIPT, CASH_RECEIPT)
        doc_type: Joi.string()
          .valid(
            constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_PAYMENT,
            constants.TRANSACTION_DOCUMENT_TYPE.CHEQUE_RECEIPT,
            constants.TRANSACTION_DOCUMENT_TYPE.CASH_RECEIPT
          )
          .required(),
        // Division code (required)
        div_code: Joi.string().required(),
        // Document date (required)
        doc_date: Joi.date().required(),
        // Company code (required)
        company_code: Joi.string().required(),
        // Sign indicator (optional)
        sign_ind: Joi.number().valid(-1, 1).allow(null),
        // Expense type code (required)
        exp_type_code: Joi.string().required(),
        // Expense subtype code (optional)
        exp_subtype_code: Joi.string().optional().allow("", null),
        // Expense subtype description (optional)
        exp_subtype_description: Joi.string().optional().allow("", null),
        // Expense code (optional)
        exp_code: Joi.string().optional().allow("", null),
        // Expense description (optional)
        exp_description: Joi.string().optional().allow("", null),
        // Job number (optional)
        job_no: Joi.string().optional().allow("", null),
        // Amount (required)
        amount: Joi.number(),
      })
    )
    .optional()
    .custom((value, helper) => {
      // Ensure 'doc_type' in 'expense' matches the root 'doc_type'
      for (const item of value) {
        if (
          item.doc_type !==
          helper.state.ancestors[helper.state.ancestors.length - 1].doc_type
        ) {
          throw new Error("doc_type in expense must match root doc_type");
        }
      }
      return value;
    }),
}).optional(),
  });// Define the Joi schema for the cheque payment document
const schema = Joi.array().items(baseSchema);
// Validate the data using the schema, depending on whether it's a bulk operation
return isBulkOperation ? schema.validate(data) : baseSchema.validate(data);
};
