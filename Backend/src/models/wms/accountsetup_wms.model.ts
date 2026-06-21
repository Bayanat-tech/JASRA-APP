// Import necessary Sequelize components and interfaces
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IAccountsetup } from "../../interfaces/wms/gm_wms.interface";
import { IAcSetup } from "../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";

// Define Accountsetup model class that extends Sequelize Model with IAcSetup interface
class Accountsetup extends Model<IAcSetup> {}

// Initialize Accountsetup model with its attributes and configuration
Accountsetup.init(
  {
    // Company identification - Part of composite primary key
    company_code: {
      type: DataTypes.STRING(7),
      primaryKey: true,
      allowNull: false,
    },
    // Post-dated check receipt reference
    pdc_receipt_code: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    // Post-dated check issue reference
    pdc_issue_code: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    // Flag to control document date editing (Y/N)
    doc_date_editable: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    // Account code - Part of composite primary key
    ac_code: {
      type: DataTypes.STRING(15),
      primaryKey: true,
      allowNull: false,
    },
    // Bank details
    bank_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Account name/description
    ac_name: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    // Bank SWIFT/BIC code
    swift_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Base currency for the account
    base_curr_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Decimal precision settings
    price_decimal_nos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount_decimal_nos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lcur_decimal_nos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty_decimal_nos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Financial year period configuration
    financial_yr_start: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    financial_yr_end: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Document editing period configuration
    doc_edit_from: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    doc_edit_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    // Job classification indicator
    job_class: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Account for exchange rate differences
    exchange_diff_ac: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    // Principal account grouping
    principal_ac_group: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Expense sub-types for different categories
    expsubtype_accident: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expsubtype_fine: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expsubtype_fuel: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expsubtype_ins: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expsubtype_reg: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expsubtype_repair: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expsubtype_service: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // Supplier account grouping
    supplier_ac_group: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Vehicle expense code
    expcode_vehicle: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    // Aging periods for reports/analysis
    age_1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    age_2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    age_3: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    age_4: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    age_5: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Document numbering type
    docno_type: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // Inter-company account grouping
    intercompany_ac_group: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    // Multi-division accounting flag (Y/N)
    multy_div_accounting: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Bill settlement currency flag
    bill_settle_lcur: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // Default tax business type
    default_tax_bstype: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    // Additional aging period
    age_6: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Audit trail fields
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
      tax_perc: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,              // Database connection instance
    modelName: "Accountsetup", // Model name
    tableName: constants.TABLE.MS_AC_SETUP, // Physical table name
    createdAt: "created_at", // Creation timestamp column
    updatedAt: "updated_at", // Last update timestamp column
  }
);

// Export the Accountsetup model
export default Accountsetup;
