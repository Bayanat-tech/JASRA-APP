// Import required dependencies from Sequelize ORM
import { Model, DataTypes } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import application constants
import constants from "../../../../helpers/constants";
// Import interface for AccountLevelTwo attributes
import { IAccountLevelTwoAttributes } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";

// Define AccountLevelTwo model class extending Sequelize Model with IAccountLevelTwoAttributes interface
class AccountLevelTwo extends Model<IAccountLevelTwoAttributes> {}

// Initialize the AccountLevelTwo model with its attributes and options
AccountLevelTwo.init(
  {
    // Company identifier - Primary key with max length of 7 characters
    company_code: {
      type: DataTypes.STRING(7),
      primaryKey: true,
    },
    // Level 2 account code - Primary key with max length of 2 characters
    l2_code: {
      type: DataTypes.STRING(2),
      primaryKey: true,
    },
    // Description for the level 2 account with max length of 50 characters
    l2_description: {
      type: DataTypes.STRING(50),
    },
    // Reference to parent level 1 account code
    l1_code: {
      type: DataTypes.STRING(2),
    },

    // Audit fields for tracking record updates
    updated_by: {
      type: DataTypes.STRING(50),
      field: "updated_by",
    },
    // User who created the record
    created_by: {
      type: DataTypes.STRING(20),
      field: "created_by",
    },
  },
  {
    sequelize,              // Database connection instance
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_at", // Custom column name for update timestamp
    modelName: "AccountLevelTwo", // Name of the model
    tableName: constants.TABLE.MS_AC_L2, // Actual table name in database
  }
);

// Export the AccountLevelTwo model
export default AccountLevelTwo;
