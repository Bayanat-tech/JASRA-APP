// Import necessary modules from Sequelize library
import { Model, DataTypes } from "sequelize";
// Import the database connection
import { sequelize } from "../../../../database/connection";
// Import constants
import constants from "../../../../helpers/constants";
// Import the interface for AccountLevelFour attributes
import { IAccountLevelFourAttributes } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";
// Import the Account model (although it's not used in this file, it might be intended for future use or relationships)
import Account from "./account_finance.model";

// Define the AccountLevelFour class, extending Sequelize's Model class with specific attributes
class AccountLevelFour extends Model<IAccountLevelFourAttributes> {}

// Initialize the AccountLevelFour model with attributes and options
AccountLevelFour.init(
  {
    // Define the 'company_code' attribute
    company_code: {
      type: DataTypes.STRING(7), // Set the data type to STRING with a length of 7
      primaryKey: true, // Set this attribute as part of the primary key
    },
    // Define the 'l4_code' attribute
    l4_code: {
      type: DataTypes.STRING(8), // Set the data type to STRING with a length of 8
      primaryKey: true, // Set this attribute as part of the primary key
    },
    // Define the 'l4_description' attribute
    l4_description: {
      type: DataTypes.STRING(70), // Set the data type to STRING with a length of 70
      field: "L4_DESCRIPTION", // Specify the actual column name in the database
    },
    // Define the 'l4_type' attribute
    l4_type: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'l4_job' attribute
    l4_job: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'l4_dept' attribute
    l4_dept: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'l4_bill' attribute
    l4_bill: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'l4_pl_code' attribute
    l4_pl_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'l3_code' attribute
    l3_code: {
      type: DataTypes.STRING(3), // Set the data type to STRING with a length of 3
    },
  },
  {
    sequelize, // Pass the sequelize instance
    modelName: "AccountLevelFour", // Set the model name
    createdAt: "created_at", // Map the createdAt attribute to the 'created_at' column
    updatedAt: "updated_at", // Map the updatedAt attribute to the 'updated_at' column
    tableName: constants.TABLE.MS_AC_L4, // Set the table name using a constant
  }
);

// Export the AccountLevelFour model as the default export
export default AccountLevelFour;
