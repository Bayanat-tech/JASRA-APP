// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import interface for Tax Component Category attributes
import { IMsTaxCompntcategory } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
// Import application constants
import constants from "../../../../helpers/constants";

// Define TaxCompntancy (Tax Component Category) model class extending Sequelize Model
class TaxCompntancy extends Model<IMsTaxCompntcategory> {}

// Initialize the TaxCompntancy model with its attributes and configuration
TaxCompntancy.init(
  {
    // Company identifier
    // Maximum length of 5 characters, required field
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Division code within company
    // Maximum length of 5 characters, required field
    div_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Serial number for record identification
    // Required integer field
    sr_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Tax component code
    // Maximum length of 5 characters, required field
    tx_compnt_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Tax category code
    // Maximum length of 5 characters, required field
    tx_cat_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Tax sub-category code
    // Maximum length of 5 characters, required field
    tx_subcat_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Tax component category code
    // Maximum length of 5 characters, required field
    tx_compntcat_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Tax component category name/description
    // Maximum length of 70 characters, required field
    tx_compntcat_name: {
      type: DataTypes.STRING(70),
      allowNull: false,
    },
    // Type of tax (e.g., VAT, GST)
    // Maximum length of 10 characters, required field
    tx_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // Tax percentage rate
    // Decimal with 15 digits total, 3 decimal places
    tx_percnt: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: false,
    },
    // Tax input account reference
    // Maximum length of 15 characters, required field
    tx_in_ac: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    // Tax output account reference
    // Maximum length of 15 characters, required field
    tx_out_ac: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    // Tax reverse charge account reference
    // Maximum length of 15 characters, required field
    tx_reverse_ac: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    // Tax asset account reference
    // Maximum length of 15 characters, required field
    tx_asset_ac: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    // User who created/modified the record
    // Maximum length of 10 characters, required field
    user_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // Date of record creation/modification
    // Stores date without time, required field
    user_dt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,              // Database connection instance
    modelName: "TaxCompntancy", // Model name for Sequelize
    tableName: constants.TABLE.MS_TAX_COMPNTCATEGORY, // Actual table name in database
    timestamps: false,      // Disable automatic timestamp fields
  }
);

// Remove default id attribute as composite natural key is used
TaxCompntancy.removeAttribute("id");

// Export the TaxCompntancy model
export default TaxCompntancy;

/* Table Purpose:
This model represents the Tax Component Category configuration:
- Manages tax component definitions and categories
- Supports hierarchical tax structure (category -> subcategory -> component)
- Maintains tax rates and types
- Links to various tax-related accounts
- Enables division-specific tax configurations
- Used for:
  * Tax calculation and application
  * Tax reporting
  * Account mapping for tax transactions
  * Tax rate management
  * Division-based tax handling
*/
