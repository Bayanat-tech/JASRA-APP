// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import application constants
import constants from "../../../../helpers/constants";
// Import interface for Expense Sub Type attributes
import { IExpenseSubType } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";

// Define ExpenseSubType model class extending Sequelize Model
class ExpenseSubType extends Model<IExpenseSubType> {}

// Initialize the ExpenseSubType model with its attributes and configuration
ExpenseSubType.init(
  {
    // Company identifier
    // Maximum length of 7 characters, required field
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    // Expense sub-type identifier
    // Maximum length of 10 characters, required field
    exp_subtype_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    // Description of the expense sub-type
    // Maximum length of 50 characters, required field
    exp_subtype_description: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Parent expense type reference
    // Maximum length of 3 characters, required field
    exp_type_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    // Department code reference
    // Maximum length of 10 characters, optional field
    dept_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
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
    modelName: "ExpenseSubType", // Model name for Sequelize
    tableName: constants.TABLE.MS_AC_EXPSUBTYPE, // Actual table name in database
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_at", // Custom column name for update timestamp
    indexes: [
      {
        // Ensure unique combination of expense type and sub-type codes
        unique: true,
        fields: ["exp_type_code", "exp_subtype_code"],
        name: "unique_expense_subtype",
      },
    ],
  }
);

// Remove default id attribute as it's not needed
ExpenseSubType.removeAttribute("id");

// Export the ExpenseSubType model
export default ExpenseSubType;

/* Table Purpose:
This model represents the expense sub-types configuration:
- Maintains detailed expense categorization
- Supports hierarchical expense structure (type -> sub-type)
- Links expenses to departments (optional)
- Ensures unique expense sub-types within each type
- Tracks creation and modification details
- Enables granular expense tracking and reporting
*/
