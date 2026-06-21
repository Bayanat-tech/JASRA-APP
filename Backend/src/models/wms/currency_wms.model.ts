// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import interface for Currency attributes
import { ICurrency } from "../../interfaces/wms/currency_wms.interface";
// Import database connection instance
import { sequelize } from "../../database/connection";
// Import application constants
import constants from "../../helpers/constants";

// Define Currency model class extending Sequelize Model
class Currency extends Model<ICurrency> {}

// Initialize the Currency model with its attributes and configuration
Currency.init(
  {
    // Currency code identifier (e.g., USD, EUR, GBP)
    // Primary key, maximum length of 5 characters
    curr_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    // Full name of the currency (e.g., US Dollar, Euro)
    // Maximum length of 50 characters
    curr_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Exchange rate relative to base currency
    // Decimal with 10 digits total, 2 decimal places
    ex_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Division classification for currency
    // Maximum length of 50 characters
    division: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Subdivision value (e.g., cents in dollar)
    // Decimal with 10 digits total, 2 decimal places
    subdivision: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Company identifier
    // Maximum length of 5 characters
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Currency symbol (e.g., $, €, £)
    // Maximum length of 5 characters
    curr_sign: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // Audit trail fields
    // Last update user, maximum length of 50 characters
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Record creator, maximum length of 20 characters
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,              // Database connection instance
    modelName: "Currency", // Model name for Sequelize
    tableName: constants.TABLE.MS_CURRENCY, // Actual table name in database
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_at", // Custom column name for update timestamp
  }
);

// Export the Currency model
export default Currency;

/* Table Purpose:
This model represents the currency master data:
- Maintains currency definitions and configurations
- Stores exchange rates for currency conversion
- Manages currency symbols and names
- Supports company-specific currency settings
- Tracks currency subdivisions (e.g., cents, pence)
- Enables multi-currency transactions
- Used for:
  * Currency conversion calculations
  * Financial reporting in multiple currencies
  * Exchange rate management
  * International transactions
  * Monetary value display formatting
*/
