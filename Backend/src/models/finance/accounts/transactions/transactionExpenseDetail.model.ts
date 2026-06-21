// Import required Sequelize ORM components and related models
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { ITransactionExpenseDetail } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import constants from "../../../../helpers/constants";
import ExpenseType from "./expenseType.model";
import ExpenseSubType from "./expenseSubType.model";

// Define TransactionExpenseDetail model class extending Sequelize Model
class TransactionExpenseDetail extends Model<ITransactionExpenseDetail> {}

// Initialize the TransactionExpenseDetail model with its attributes and configuration
TransactionExpenseDetail.init(
  {
    // Document Identification Fields (Composite Primary Key)
    company_code: {
      type: DataTypes.STRING(10),
      field: "COMPANY_CODE",     // Maps to database column name
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    doc_type: {
      type: DataTypes.STRING(5),
      field: "DOC_TYPE",        // Maps to database column name
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    doc_no: {
      type: DataTypes.DECIMAL(10),
      field: "DOC_NO",          // Maps to database column name
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    serial_no: {
      field: "SERIAL_NO",       // Maps to database column name
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    dtl_sr_no: {
      field: "DTL_SR_NO",       // Maps to database column name
      type: DataTypes.DECIMAL(6),
      primaryKey: true,
      unique: true,
      allowNull: false,
    },

    // Transaction Details
    doc_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ac_code: {
      field: "AC_CODE",         // Maps to database column name
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    // Expense Categorization
    exp_type_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    exp_subtype_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    exp_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    // Amount Information
    amount: {
      type: DataTypes.DECIMAL(18, 4),  // Supports 4 decimal places
      allowNull: false,
    },
    sign_ind: {
      type: DataTypes.DECIMAL(1),      // Indicates positive/negative amount
      allowNull: false,
    },
    lcur_amount: {
      type: DataTypes.DECIMAL(18, 8),  // Local currency amount
      allowNull: false,
    },

    // Currency Information
    curr_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ex_rate: {
      type: DataTypes.DECIMAL(18, 12), // Exchange rate with high precision
      allowNull: true,
    },

    // Additional References
    div_code: {
      type: DataTypes.STRING(5),       // Division reference
      allowNull: true,
    },
    job_no: {
      type: DataTypes.STRING(15),      // Job reference number
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TransactionExpenseDetail",
    tableName: constants.TABLE.TR_AC_EXPDETAIL,
    timestamps: false,          // Disable automatic timestamp fields
    indexes: [
      {
        // Composite unique index for expense details
        unique: true,
        fields: [
          "company_code",
          "doc_no",
          "doc_type",
          "serial_no",
          "ac_code",
          "dtl_sr_no",
        ],
        name: "unique_expense",
        type: "UNIQUE",
      },
    ],
  }
);

// Remove default id as we're using composite primary key
TransactionExpenseDetail.removeAttribute("id");

// Define relationships with expense type models
TransactionExpenseDetail.belongsTo(ExpenseType, {
  foreignKey: "exp_code",
  targetKey: "exp_code",
});

// Define relationship with expense sub-type with additional scope
TransactionExpenseDetail.belongsTo(ExpenseSubType, {
  foreignKey: "exp_type_code",
  targetKey: "exp_type_code",
  constraints: true,
  scope: {
    // Additional condition for the relationship
    exp_subtype_code: sequelize.col(
      "TransactionExpenseDetail.exp_subtype_code"
    ),
  },
});

export default TransactionExpenseDetail;

/* Table Purpose:
This model represents detailed expense entries for transactions:
- Records individual expense line items
- Supports multi-currency transactions
- Maintains expense categorization hierarchy
- Enables detailed expense tracking
- Provides comprehensive amount handling
- Supports division and job-based expense allocation

Key Features:
- Composite primary key for unique identification
- Multi-currency support with exchange rates
- Hierarchical expense categorization
- Positive/negative amount handling
- Division and job tracking
- Detailed expense relationships
*/
