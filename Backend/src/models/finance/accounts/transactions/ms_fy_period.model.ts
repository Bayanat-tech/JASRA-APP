// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import interface for Financial Year Period attributes
import { IMS_FY_PERIOD } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";

// Define MS_FY_PERIOD (Master Financial Year Period) model class extending Sequelize Model
class MS_FY_PERIOD extends Model<IMS_FY_PERIOD> {}

// Initialize the MS_FY_PERIOD model with its attributes and configuration
MS_FY_PERIOD.init(
  {
    // Company identifier - Part of composite primary key
    // Maximum length of 10 characters, required field
    company_code: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    // Financial Year Period identifier - Part of composite primary key
    // Maximum length of 5 characters, required field
    // Usually in format like '23-24' for 2023-2024
    fy_period: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    // Start date of the financial period
    // Required field, stores date without time
    date_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // End date of the financial period
    // Required field, stores date without time
    date_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Sequence number for ordering periods
    // Required field, integer value
    // Helps in chronological arrangement of periods
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,              // Database connection instance
    modelName: "MS_FY_PERIOD", // Model name for Sequelize
    tableName: "MS_FY_PERIOD", // Actual table name in database
    timestamps: false,      // Disable automatic timestamp fields (created_at, updated_at)
  }
);

// Export the MS_FY_PERIOD model
export default MS_FY_PERIOD;

/* Table Purpose:
This model represents the Financial Year Period configuration:
- Defines financial year periods for each company
- Uses composite primary key (company_code + fy_period)
- Maintains period start and end dates
- Supports chronological ordering of periods
- Enables financial reporting by periods
- Facilitates period-based financial operations
- Helps in fiscal year management
- Used for:
  * Financial reporting
  * Period-based accounting
  * Fiscal year tracking
  * Financial data organization
*/
