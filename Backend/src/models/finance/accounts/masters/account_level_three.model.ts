// Import required dependencies from Sequelize
import { Model, DataTypes } from "sequelize";
// Import database connection
import { sequelize } from "../../../../database/connection";
// Import constants for table names
import constants from "../../../../helpers/constants";
// Import interface for AccountLevelThree attributes
import { IAccountLevelThreeAttributes } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";

// Define AccountLevelThree model class extending Sequelize Model
class AccountLevelThree extends Model<IAccountLevelThreeAttributes> {}

// Initialize AccountLevelThree model with schema definition
AccountLevelThree.init(
  {
    // Company code - Primary key field with max length 7
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true,
    },
    // Level 3 code - Primary key field with max length 3
    l3_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      primaryKey: true,
    },
    // Level 3 description field with max length 50
    l3_description: {
      allowNull: false,
      type: DataTypes.STRING(50),
    },
    // Level 2 code field with max length 2
    l2_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    // Updated by field to track who last modified the record
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Created by field to track who created the record
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    // Model configuration options
    sequelize,
    createdAt: "created_at", // Map createdAt to created_at column
    updatedAt: "updated_at", // Map updatedAt to updated_at column
    modelName: "AccountLevelThree", // Set model name
    tableName: constants.TABLE.MS_AC_L3, // Set table name from constants
  }
);

// Export the AccountLevelThree model
export default AccountLevelThree;
