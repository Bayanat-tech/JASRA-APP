// Import required Sequelize ORM components
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { ITransactionJobDetail } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import constants from "../../../../helpers/constants";

// Define TransactionJobDetail model class extending Sequelize Model
class TransactionJobDetail extends Model<ITransactionJobDetail> {}

// Initialize the TransactionJobDetail model with its attributes and configuration
TransactionJobDetail.init(
  {
    // Document Identification Fields (Composite Primary Key)
    company_code: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    doc_type: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    doc_no: {
      type: DataTypes.DECIMAL(10),
      primaryKey: true,
      allowNull: false,
    },
    serial_no: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    dtl_sr_no: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    // Transaction Details
    doc_date: {
      type: DataTypes.DATEONLY,    // Date without time component
      allowNull: false,
    },
    ac_code: {
      type: DataTypes.STRING(10),  // Account code reference
      allowNull: false,
    },

    // Job Information
    job_no: {
      type: DataTypes.STRING(10),  // Job identifier
      allowNull: true,
    },

    // Reference Numbers
    doc_refno: {
      type: DataTypes.STRING(50),  // Primary reference number
      allowNull: true,
    },
    doc_refno_2: {
      type: DataTypes.STRING(50),  // Secondary reference number
      allowNull: true,
    },

    // Amount Information
    amount: {
      type: DataTypes.DECIMAL(18, 4),  // Transaction amount with 4 decimal places
      allowNull: false,
    },
    sign_ind: {
      type: DataTypes.DECIMAL(1),      // Indicates positive/negative amount
      allowNull: false,
    },
    lcur_amount: {
      type: DataTypes.DECIMAL(18, 8),  // Local currency amount with 8 decimal places
      allowNull: false,
    },

    // Currency Information
    curr_code: {
      type: DataTypes.STRING(10),      // Currency identifier
      allowNull: true,
    },
    ex_rate: {
      type: DataTypes.DECIMAL(18, 12), // Exchange rate with high precision
      allowNull: true,
    },

    // Organizational Unit
    div_code: {
      type: DataTypes.STRING(5),       // Division identifier
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TransactionJobDetail",
    tableName: constants.TABLE.TR_AC_JOBDETAIL,
    timestamps: false,                 // Disable automatic timestamp fields
    indexes: [
      {
        // Composite unique index for job details
        unique: true,
        fields: [
          "company_code",
          "doc_no",
          "doc_type",
          "ac_code",
          "serial_no",
          "dtl_sr_no",
        ],
        name: "unique_job",
      },
    ],
  }
);

// Remove default id as we're using composite primary key
TransactionJobDetail.removeAttribute("id");

export default TransactionJobDetail;

/* Table Purpose:
This model represents detailed job-related transaction entries:
- Records individual job-related financial transactions
- Supports multi-currency operations
- Maintains job-specific accounting details
- Enables detailed transaction tracking
- Provides comprehensive amount handling

Key Features:
- Composite primary key for unique identification
- Multi-currency support with exchange rates
- Job-specific transaction tracking
- Multiple reference number support
- Positive/negative amount handling
- Division-based transaction allocation

Use Cases:
- Job costing
- Project-based accounting
- Multi-currency job tracking
- Division-specific job accounting
- Reference-based transaction linking
*/
