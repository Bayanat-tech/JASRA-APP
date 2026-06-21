// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import interface for Bank Code attributes
import { IMS_AC_BANKCODE } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
// Import related Account model for association
import Account from "../masters/account_finance.model";

// Define Bank Code model class extending Sequelize Model
class MS_AC_BANKCODE extends Model<IMS_AC_BANKCODE> {}

// Initialize the MS_AC_BANKCODE model with its attributes and configuration
MS_AC_BANKCODE.init(
  {
    // Company identifier
    // Part of composite primary key, maximum length of 7 characters
    company_code: {
      type: DataTypes.STRING(7),
      primaryKey: true,
      allowNull: false,
    },
    // Account code
    // Part of composite primary key, maximum length of 15 characters
    // Links to main account record
    ac_code: {
      type: DataTypes.STRING(15),
      primaryKey: true,
      allowNull: false,
    },
    // Last used cheque number
    // Maximum length of 20 characters
    // Used for cheque sequence tracking
    last_cheque_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Cheque template identifier
    // Maximum length of 50 characters
    // References the print template for cheques
    chq_template: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    // Maximum word length for cheque amount in words
    // Used for cheque printing formatting
    words_length: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Bank's internal account code
    // Maximum length of 20 characters
    bank_ac_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Bank branch address
    // Maximum length of 250 characters
    bank_address: {
      type: DataTypes.STRING(250),
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
    modelName: "MS_AC_BANKCODE", // Model name for Sequelize
    tableName: "MS_AC_BANKCODE", // Actual table name in database
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_at", // Custom column name for update timestamp
  }
);

// Define relationship with Account model
// Each bank code record belongs to an account
MS_AC_BANKCODE.belongsTo(Account, {
  foreignKey: "ac_code",
  targetKey: "ac_code",
});

// Export the MS_AC_BANKCODE model
export default MS_AC_BANKCODE;

/* Table Purpose:
This model represents bank account configurations for cheque processing:
- Maintains bank-specific account details
- Tracks cheque numbering sequences
- Stores cheque printing templates
- Manages formatting parameters for cheque printing
- Links bank accounts to main account records

Used for:
- Cheque printing automation
- Bank account management
- Cheque sequence tracking
- Template-based cheque generation
- Bank branch information storage
*/
