import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { IChequePaymentReport } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import constants from "../../../../helpers/constants";
/**
 * Define the ChequePaymentReport model.
 */
class ChequePaymentReport extends Model<IChequePaymentReport> {}

/**
 * Initialize the ChequePaymentReport model with its attributes.
 */
ChequePaymentReport.init(
  {
    /**
     * Document type.
     */
    doc_type: {
      type: DataTypes.STRING(5),
    },
    /**
     * Document number.
     */
    doc_no: {
      type: DataTypes.INTEGER,
    },
    /**
     * Document date.
     */
    doc_date: {
      type: DataTypes.DATEONLY,
    },
    /**
     * Header account code.
     */
    hdr_ac_code: {
      type: DataTypes.STRING(15),
    },
    /**
     * Header remarks.
     */
    hdr_remarks: {
      type: DataTypes.STRING(250),
    },
    /**
     * Header currency code.
     */
    hdr_curr_code: {
      type: DataTypes.STRING(10),
    },
    /**
     * Header exchange rate.
     */
    hdr_ex_rate: {
      type: DataTypes.DECIMAL(15, 8),
    },
    /**
     * Cheque number.
     */
    cheque_no: {
      type: DataTypes.STRING(20),
    },
    /**
     * Cheque date.
     */
    cheque_date: {
      type: DataTypes.DATEONLY,
    },
    /**
     * Serial number.
     */
    serial_no: {
      type: DataTypes.INTEGER,
    },
    /**
     * Detail account code.
     */
    dtl_ac_code: {
      type: DataTypes.STRING(15),
    },
    /**
     * Remarks.
     */
    remarks: {
      type: DataTypes.STRING(250),
    },
    /**
     * Amount.
     */
    amount: {
      type: DataTypes.DECIMAL(18, 2),
    },
    /**
     * Sign indicator.
     */
    sign_ind: {
      type: DataTypes.INTEGER,
    },
    /**
     * Currency code.
     */
    curr_code: {
      type: DataTypes.STRING(10),
    },
    /**
     * Exchange rate.
     */
    ex_rate: {
      type: DataTypes.DECIMAL(15, 8),
    },
    /**
     * Account name.
     */
    ac_name: {
      type: DataTypes.STRING(150),
    },
    /**
     * Account name 1.
     */
    ac_name_1: {
      type: DataTypes.STRING(150),
    },
    /**
     * Company code.
     */
    company_code: {
      type: DataTypes.STRING(15),
    },
    /**
     * Address 1.
     */
    address_1: {
      type: DataTypes.STRING(255),
    },
    /**
     * Address 2.
     */
    address_2: {
      type: DataTypes.STRING(255),
    },
    /**
     * Address 3.
     */
    address_3: {
      type: DataTypes.STRING(255),
    },
    /**
     * Phone number.
     */
    phone: {
      type: DataTypes.STRING(50),
    },
    /**
     * Fax number.
     */
    fax: {
      type: DataTypes.STRING(50),
    },
    /**
     * Reference number.
     */
    ref_no: {
      type: DataTypes.STRING(30),
    },
    /**
     * Reference date.
     */
    ref_date: {
      type: DataTypes.DATEONLY,
    },
    /**
     * Company address 1.
     */
    company_address1: {
      type: DataTypes.STRING(200),
    },
    /**
     * Company address 2.
     */
    company_address2: {
      type: DataTypes.STRING(200),
    },
    /**
     * Company address 3.
     */
    company_address3: {
      type: DataTypes.STRING(200),
    },
    /**
     * Account code.
     */
    ac_code: {
      type: DataTypes.STRING(15),
    },
    /**
     * Bank name.
     */
    bank_name: {
      type: DataTypes.STRING(100),
    },
    /**
     * Setup account name.
     */
    setup_ac_name: {
      type: DataTypes.STRING(70),
    },
    /**
     * Prepared by.
     */
    prepared: {
      type: DataTypes.STRING(50),
    },
    /**
     * Verified by.
     */
    verified: {
      type: DataTypes.STRING(50),
    },
    /**
     * Approved by.
     */
    approved: {
      type: DataTypes.STRING(50),
    },
    /**
     * Received by.
     */
    received: {
      type: DataTypes.STRING(50),
    },
    /**
     * Contact person.
     */
    contact_person: {
      type: DataTypes.STRING(50),
    },
    /**
     * Payment terms.
     */
    payment_terms: {
      type: DataTypes.STRING(250),
    },
    /**
     * Quantity.
     */
    qty: {
      type: DataTypes.DECIMAL(18, 6),
    },
    /**
     * Price.
     */
    price: {
      type: DataTypes.DECIMAL(18, 2),
    },
    /**
     * Currency sign.
     */
    curr_sign: {
      type: DataTypes.STRING(5),
    },
    /**
     * Swift code.
     */
    swift_code: {
      type: DataTypes.STRING(100),
    },
    /**
     * LPO number.
     */
    lpo_no: {
      type: DataTypes.STRING(50),
    },
    /**
     * LPO date.
     */
    lpo_date: {
      type: DataTypes.DATEONLY,
    },
    /**
     * Party name.
     */
    party_name: {
      type: DataTypes.STRING(70),
    },
    /**
     * Party address.
     */
    party_address: {
      type: DataTypes.STRING(255),
    },
    /**
     * Party phone number.
     */
    party_phone: {
      type: DataTypes.STRING(30),
    },
    /**
     * Party fax number.
     */
    party_fax: {
      type: DataTypes.STRING(30),
    },
    /**
     * Transaction component amount 1.
     */
    tx_compnt_amt_1: {
      type: DataTypes.DECIMAL(18, 2),
    },
    /**
     * Account transaction number.
     */
    ac_trn_no: {
      type: DataTypes.STRING(30),
    },
    /**
     * Transaction component percentage 1.
     */
    tx_compnt_perc_1: {
      type: DataTypes.DECIMAL(15, 8),
    },
    /**
     * Transaction component local currency amount 1.
     */
    tx_compnt_lcuramt_1: {
      type: DataTypes.DECIMAL(18, 4),
    },
    /**
     * Local currency amount.
     */
    lcur_amount: {
      type: DataTypes.DECIMAL(18, 8),
    },
    /**
     * Company transaction number.
     */
    company_trn_no: {
      type: DataTypes.STRING(30),
    },
    /**
     * Company name.
     */
    company_name: {
      type: DataTypes.STRING(70),
    },
    /**
     * Bank name (invoice).
     */
    bank_name_inv: {
      type: DataTypes.STRING(100),
    },
    /**
     * Account code (invoice).
     */
    ac_code_inv: {
      type: DataTypes.STRING(50),
    },
    /**
     * Reference number (invoice).
     */
    reference_no_inv: {
      type: DataTypes.STRING(50),
    },
    /**
     * Bank address (invoice).
     */
    bank_address_inv: {
      type: DataTypes.STRING(50),
    },
    /**
     * Swift code (invoice).
     */
    swift_code_inv: {
      type: DataTypes.STRING(100),
    },
  },
  {
    /**
     * Sequelize instance.
     */
    sequelize,
    /**
     * Model name.
     */
    modelName: "ChequePaymentReport",
    /**
     * Table name.
     */
    tableName: constants.VIEW.VW_AC_TXN_DET,
    /**
     * Disable timestamps.
     */
    timestamps: false,
  }
);

/**
 * Remove the 'id' attribute from the model.
 */
ChequePaymentReport.removeAttribute("id");

/**
 * Export the ChequePaymentReport model.
 */
export default ChequePaymentReport;