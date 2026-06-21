import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { TTransactionDetail } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import Account from "../masters/account_finance.model";
import Department from "../../../wms/department_wms.model";
import Currency from "../../../wms/currency_wms.model";

class TransactionDetail extends Model<TTransactionDetail> {}

TransactionDetail.init(
 {
  // Company code (7 characters)
  company_code: {
    type: DataTypes.STRING(7),
    allowNull: false,
  },
  // Document type (5 characters)
  doc_type: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
  // Document number
  doc_no: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  // Serial number
  serial_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Document date
  doc_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // Account code (13 characters)
  ac_code: {
    type: DataTypes.STRING(13),
    allowNull: false,
  },
  // Header account code (13 characters)
  header_ac_code: {
    type: DataTypes.STRING(13),
    allowNull: true,
  },
  // Bank account code (13 characters)
  bank_ac_code: {
    type: DataTypes.STRING(13),
    allowNull: true,
  },
  // Remarks (250 characters)
  remarks: {
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  // Amount (18 digits, 4 decimal places)
  amount: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: false,
  },
  // Sign indicator
  sign_ind: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  // Currency code (10 characters)
  curr_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  // Exchange rate (18 digits, 12 decimal places)
  ex_rate: {
    type: DataTypes.DECIMAL(18, 12),
    allowNull: true,
  },
  // Local currency amount (18 digits, 8 decimal places)
  lcur_amount: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false,
  },
  // PDC indicator (1 character)
  pdc_ind: {
    type: DataTypes.STRING(1),
    allowNull: true,
  },
  // Cheque number (20 characters)
  cheque_no: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  // Cheque date
  cheque_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  // Cheque description (50 characters)
  cheque_desc: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  // PDC cleared date
  pdc_cleared_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  // Cancelled (1 character)
  cancelled: {
    type: DataTypes.STRING(1),
    allowNull: true,
  },
  // Job number (25 characters)
  job_no: {
    type: DataTypes.STRING(25),
    allowNull: true,
  },
  // Reconciliation indicator (1 character)
  recon_ind: {
    type: DataTypes.STRING(1),
    allowNull: true,
  },
  // Reconciliation date
  recon_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },// Department code (5 characters)
dept_code: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Quantity (18 digits, 4 decimal places)
qty: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Price (18 digits, 4 decimal places)
price: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Unit of measurement (10 characters)
uom: {
  type: DataTypes.STRING(10),
  allowNull: true,
},
// PDC cleared journal voucher number
pdc_clear_jvno: {
  type: DataTypes.BIGINT,
  allowNull: true,
},
// Reference document type (5 characters)
ref_doc_type: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Reference document number (10 characters)
ref_doc_no: {
  type: DataTypes.STRING(10),
  allowNull: true,
},
// Reference document serial number
ref_doc_serial_no: {
  type: DataTypes.BIGINT,
  allowNull: true,
},
// Division code (5 characters)
div_code: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Transaction category code (5 characters)
tx_cat_code: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Transaction component category code 1 (5 characters)
tx_compntcat_code_1: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Transaction component category code 2 (5 characters)
tx_compntcat_code_2: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Transaction component category code 3 (5 characters)
tx_compntcat_code_3: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Transaction component category code 4 (5 characters)
tx_compntcat_code_4: {
  type: DataTypes.STRING(5),
  allowNull: true,
},
// Transaction component percentage 1 (7 digits, 3 decimal places)
tx_compnt_perc_1: {
  type: DataTypes.DECIMAL(7, 3),
  allowNull: true,
},
// Transaction component percentage 2 (7 digits, 3 decimal places)
tx_compnt_perc_2: {
  type: DataTypes.DECIMAL(7, 3),
  allowNull: true,
},
// Transaction component percentage 3 (7 digits, 3 decimal places)
tx_compnt_perc_3: {
  type: DataTypes.DECIMAL(7, 3),
  allowNull: true,
},
// Transaction component percentage 4 (7 digits, 3 decimal places)
tx_compnt_perc_4: {
  type: DataTypes.DECIMAL(7, 3),
  allowNull: true,
},
// Transaction component amount 1 (18 digits, 4 decimal places)
tx_compnt_amt_1: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Transaction component amount 2 (18 digits, 4 decimal places)
tx_compnt_amt_2: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Transaction component amount 3 (18 digits, 4 decimal places)
tx_compnt_amt_3: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Transaction component amount 4 (18 digits, 4 decimal places)
tx_compnt_amt_4: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Transaction component local currency amount 1 (18 digits, 8 decimal places)
tx_compnt_lcuramt_1: {
  type: DataTypes.DECIMAL(18, 8),
  allowNull: true,
},
// Transaction component local currency amount 2 (18 digits, 8 decimal places)
tx_compnt_lcuramt_2: {
  type: DataTypes.DECIMAL(18, 8),
  allowNull: true,
},
// Transaction component local currency amount 3 (18 digits, 8 decimal places)
tx_compnt_lcuramt_3: {
  type: DataTypes.DECIMAL(18, 8),
  allowNull: true,
},
// Transaction component local currency amount 4 (18 digits, 8 decimal places)
tx_compnt_lcuramt_4: {
  type: DataTypes.DECIMAL(18, 8),
  allowNull: true,
},
// Transaction component 1 exemption method (1 character)
tx_compnt_1_expmt: {
  type: DataTypes.STRING(1),
  allowNull: true,
},
// Transaction component 2 exemption method (1 character)
tx_compnt_2_expmt: {
  type: DataTypes.STRING(1),
  allowNull: true,
},
// Transaction component 3 exemption method (1 character)
tx_compnt_3_expmt: {
  type: DataTypes.STRING(1),
  allowNull: true,
},
// Transaction component 4 exemption method (1 character)
tx_compnt_4_expmt: {
  type: DataTypes.STRING(1),
  allowNull: true,
},
// Tax filed indicator (1 character)
tx_tax_filed: {
  type: DataTypes.STRING(1),
  allowNull: true,
},
// Tax filed date
tx_tax_filed_dt: {
  type: DataTypes.DATEONLY,
  allowNull: true,
},
// Tax filed reference number (30 characters)
tx_tax_filed_refno: {
  type: DataTypes.STRING(30),
  allowNull: true,
},
// Transaction component 1 header discount amount (18 digits, 4 decimal places)
tx_compnt_hdisc_amt_1: {
  type: DataTypes.DECIMAL(18, 4),
  allowNull: true,
},
// Updated by (50 characters)
updated_by: {
  type: DataTypes.STRING(50),
  allowNull: true,
},
// Created by (20 characters)
created_by: {
  type: DataTypes.STRING(20),
  allowNull: true,
},
  },
  {
  // Define the database connection and model settings
  sequelize,
  // Define the model name
  modelName: "TransactionDetail",
  // Define the table name
  tableName: constants.TABLE.TR_AC_DETAIL,
  // Define the created at field
  createdAt: "created_at",
  // Define the updated at field
  updatedAt: "updated_at",
  // Define the indexes for the table
  indexes: [
    {
      // Set the index as unique
      unique: true,
      // Define the fields for the index
      fields: ["company_code", "doc_no", "doc_type", "ac_code"],
    },
  ],
}
);
// Define the associations for the TransactionDetail model
TransactionDetail.hasOne(Account, {
  // Define the foreign key for the association
  foreignKey: "ac_code",
  // Define the source key for the association
  sourceKey: "ac_code",
});

// Define the association with the Department model
TransactionDetail.belongsTo(Department, {
  // Define the foreign key for the association
  foreignKey: "dept_code",
  // Define the target key for the association
  targetKey: "dept_code",
});

// Define the association with the Currency model
TransactionDetail.belongsTo(Currency, {
  // Define the foreign key for the association
  foreignKey: "curr_code",
  // Define the target key for the association
  targetKey: "curr_code",
});

// Remove the id attribute from the TransactionDetail model
TransactionDetail.removeAttribute("id");

// Export the TransactionDetail model as the default export
export default TransactionDetail;