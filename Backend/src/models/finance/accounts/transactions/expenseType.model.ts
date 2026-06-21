// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import interface for Expense Type attributes
import { IExpenseType } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
// Import application constants
import constants from "../../../../helpers/constants";

// Define ExpenseType model class extending Sequelize Model
class ExpenseType extends Model<IExpenseType> {}

// Initialize the ExpenseType model with its attributes and configuration
ExpenseType.init(
  {
    // Expense code - Primary identifier
    // Maximum length of 10 characters, required field
    exp_code: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    // Description of the expense type
    // Maximum length of 50 characters, required field
    exp_description: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Expense type classification code
    // Maximum length of 3 characters, required field
    // Used for categorizing expenses
    exp_type_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    // Company identifier
    // Maximum length of 7 characters, required field
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    // Reference code for linking purposes
    // Maximum length of 10 characters, optional field
    ref_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    // Audit trail fields
    // Last update user
    // Maximum length of 50 characters, required field
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Record creator
    // Maximum length of 20 characters, required field
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,              // Database connection instance
    modelName: "ExpenseType", // Model name for Sequelize
    tableName: constants.TABLE.MS_AC_EXPCODE, // Actual table name in database
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_at", // Custom column name for update timestamp
  }
);

// Remove default id attribute as exp_code serves as primary key
ExpenseType.removeAttribute("id");

// Export the ExpenseType model
export default ExpenseType;

/* Table Purpose:
This model represents the main expense types configuration:
- Defines primary expense categories
- Maintains company-specific expense types
- Supports expense classification system
- Enables reference linking to other entities
- Tracks creation and modification details
- Forms the parent structure for expense sub-types
- Facilitates expense reporting and analysis
*/
