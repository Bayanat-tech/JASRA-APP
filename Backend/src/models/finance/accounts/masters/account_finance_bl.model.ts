// Import required Sequelize ORM components
import { Model, DataTypes } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import application constants
import constants from "../../../../helpers/constants";
// Import interface for Account BL Setup attributes
import { IAccountFinanceBLSetup } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";

// Define AccountBlSetup model class extending Sequelize Model
// BL typically stands for Business Line or Balance Line
class AccountBlSetup extends Model<IAccountFinanceBLSetup> {}

// Initialize the AccountBlSetup model with its attributes and configuration
AccountBlSetup.init(
  {
    // Company identifier - Primary key
    // Maximum length of 7 characters
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true,
    },
    // Business Line code identifier
    // Required field with no length restriction
    bl_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Business Line name/description
    // Required field with maximum length of 50 characters
    bl_name: {
      allowNull: false,
      type: DataTypes.STRING(50),
    },
    // Business Line type indicator
    // Required field with maximum length of 2 characters
    // Usually used for categorization
    bl_type: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    // Hierarchy code
    // Required field with maximum length of 20 characters
    // Used for organizational structure
    h_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Previous/Parent code reference
    // Required field with maximum length of 20 characters
    // Used for linking to parent business line
    prv_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,              // Database connection instance
    timestamps: false,      // Disable automatic timestamp fields (created_at, updated_at)
    modelName: "AccountBlSetup", // Model name for Sequelize
    tableName: constants.TABLE.MS_AC_BLSETUP, // Actual table name in database
  }
);

// Export the AccountBlSetup model
export default AccountBlSetup;

/* Table Purpose:
This model represents the Business Line setup for accounting purposes:
- Maintains company-specific business line configurations
- Supports hierarchical organization structure
- Enables business line categorization
- Links business lines in parent-child relationships
- Provides basic business line information storage
*/
