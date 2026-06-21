import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { ITransactionHeader } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import Accountsetup from "../../../wms/accountsetup_wms.model";
import Currency from "../../../wms/currency_wms.model";
import Division from "../../../wms/division_wms.model";
import Account from "../masters/account_finance.model";
import MS_AC_BANKCODE from "./ms_ac_bankcode.model";
// Define the TransactionHeader model
class TransactionHeader extends Model<ITransactionHeader> {}

// Initialize the TransactionHeader model with its attributes
TransactionHeader.init(
  {
    // Company code (primary key)
    company_code: {
      type: DataTypes.STRING(7),
      primaryKey: true,
      allowNull: false,
    },
    // Document type (primary key)
    doc_type: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    // Document number (primary key)
    doc_no: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    // Document date
    doc_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Account code
    ac_code: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    // Bank account code
    bank_ac_code: {
      type: DataTypes.STRING(13),
      allowNull: true,
    },
    // Reference number
    ref_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    // Reference date
    ref_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Remarks
    remarks: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    // Currency code
    curr_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // Exchange rate
    ex_rate: {
      type: DataTypes.DECIMAL(18, 12),
      allowNull: true,
    },
    // Cheque number
    cheque_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Cheque date
    cheque_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Canceled status
    canceled: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Create user
    create_user: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // Create date
    create_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Last serial number
    last_serial_no: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
    // Last detail serial number
    last_dtl_serial_no: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
    // Payment terms
    payment_terms: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    // LPO number
    lpo_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // LPO date
    lpo_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Credit period
    credit_period: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    // Due date
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Reference document type
    ref_doc_type: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Account payee
    ac_payee: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    // Cheque bank
    cheque_bank: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    // Party name
    party_name: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    // Party address
    party_address: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    // Party phone
    party_phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    // Party fax
    party_fax: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    // Remittance status
    remittance: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Auto reverse status
    auto_reverse: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Division code
    div_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Salesman code
    salesman_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // Sector code
    sector_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // System generated status
    sys_gen: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    // Transaction category code
    tx_cat_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // Transaction component category code 1
    tx_compntcat_code_1: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Transaction component category code 2
    tx_compntcat_code_2: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Transaction component category code 3
    tx_compntcat_code_3: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Transaction component category code 4
    tx_compntcat_code_4: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Tax filed status
    tx_tax_filed: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Tax filed date
    tx_tax_filed_dt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Tax filed reference number
    tx_tax_filed_refno: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    // Transaction component head discount amount 1
    tx_compnt_hdisc_amt_1: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    // Document path
    doc_path: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    // Reference document number
    ref_doc_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // VAT transaction number
    vat_trn_no: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    // Updated by
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Created by
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    // Sequelize instance
    sequelize,
    // Model name
    modelName: "TransactionHeader",
    // Table name
    tableName: constants.TABLE.TR_AC_HEADER,
    // Created at field
    createdAt: "created_at",
    // Updated at field
    updatedAt: "updated_at",
  }
);

// Remove the "id" field automatically created by Sequelize
TransactionHeader.removeAttribute("id");

// Define the associations
TransactionHeader.belongsTo(Accountsetup, {
  foreignKey: "ac_code",
  targetKey: "ac_code",
});
TransactionHeader.belongsTo(Account, {
  foreignKey: "ac_code",
  targetKey: "ac_code",
});
TransactionHeader.belongsTo(MS_AC_BANKCODE, {
  foreignKey: "bank_ac_code",
  targetKey: "ac_code",
});
TransactionHeader.belongsTo(Currency, {
  foreignKey: "curr_code",
  targetKey: "curr_code",
});
TransactionHeader.belongsTo(Division, {
  foreignKey: "div_code",
  targetKey: "div_code",
});

// Export the TransactionHeader model
export default TransactionHeader;