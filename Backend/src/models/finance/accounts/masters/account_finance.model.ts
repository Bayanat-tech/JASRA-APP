// Import necessary modules from Sequelize library
import { DataTypes, Model } from "sequelize";
// Import the database connection
import { sequelize } from "../../../../database/connection";
// Import constants
import constants from "../../../../helpers/constants";
// Import the interface for Account attributes
import { IAccountFinanceAttributes } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";
// Import the MS_AC_BANKCODE model (although it's not used in this file, it might be intended for future use or relationships)
import MS_AC_BANKCODE from "../transactions/ms_ac_bankcode.model";
// Import the AccountLevelFour model for establishing a relationship
import AccountLevelFour from "./account_level_four.model";

// Define the Account class, extending Sequelize's Model class with specific attributes
class Account extends Model<IAccountFinanceAttributes> {}

// Initialize the Account model with attributes and options
Account.init(
  {
    // Define the 'company_code' attribute
    company_code: {
      type: DataTypes.STRING(7), // Set the data type to STRING with a length of 7
      allowNull: false, // Set the column as NOT NULL
      primaryKey: true, // Set this attribute as part of the primary key
    },
    // Define the 'ac_code' attribute
    ac_code: {
      type: DataTypes.STRING(13), // Set the data type to STRING with a length of 13
      allowNull: false, // Set the column as NOT NULL
      primaryKey: true, // Set this attribute as part of the primary key
    },
    // Define the 'ac_name' attribute
    ac_name: {
      type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
      allowNull: false, // Set the column as NOT NULL
    },
    // Define the 'country_code' attribute
    country_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'territory_code' attribute
    territory_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'address_1' attribute
    address_1: {
      type: DataTypes.STRING(255), // Set the data type to STRING with a length of 255
    },
    // Define the 'address_2' attribute
    address_2: {
      type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
    },
    // Define the 'address_3' attribute
    address_3: {
      type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
    },
    // Define the 'phone' attribute
    phone: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'fax' attribute
    fax: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'e_mail' attribute
    e_mail: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'contact_person' attribute
    contact_person: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'mobile_no' attribute
    mobile_no: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'exp_alloc' attribute
    exp_alloc: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'l4_code' attribute
    l4_code: {
      type: DataTypes.STRING(8), // Set the data type to STRING with a length of 8
    },
    // Define the 'curr_code' attribute
    curr_code: {
      type: DataTypes.STRING(5), // Set the data type to STRING with a length of 5
    },
    // Define the 'ac_type' attribute
    ac_type: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'ac_active' attribute
    ac_active: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'credit_period' attribute
    credit_period: {
      type: DataTypes.INTEGER, // Set the data type to INTEGER
    },
    // Define the 'credit_amount' attribute
    credit_amount: {
      type: DataTypes.DECIMAL(18, 4), // Set the data type to DECIMAL with a precision of 18 and scale of 4
    },
    // Define the 'ac_closed_reason' attribute
    ac_closed_reason: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'exp_type_code' attribute
    exp_type_code: {
      type: DataTypes.STRING(3), // Set the data type to STRING with a length of 3
    },
    // Define the 'pl_bl_code' attribute
    pl_bl_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'ac_status' attribute
    ac_status: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
      allowNull: true, // Set the column as NULLABLE
    },
    // Define the 'dept_code' attribute
    dept_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'exp_subtype_code' attribute
    exp_subtype_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'bank_ac_code' attribute
    bank_ac_code: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'bank_name' attribute
    bank_name: {
      type: DataTypes.STRING(70), // Set the data type to STRING with a length of 70
    },
    // Define the 'bank_swift' attribute
    bank_swift: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'salesman_code' attribute
    salesman_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'sector_code' attribute
    sector_code: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'exp_type_code_back' attribute
    exp_type_code_back: {
      type: DataTypes.STRING(3), // Set the data type to STRING with a length of 3
    },
    // Define the 'exp_subtype_code_back' attribute
    exp_subtype_code_back: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'contract_expry_date' attribute
    contract_expry_date: {
      type: DataTypes.DATEONLY, // Set the data type to DATEONLY
    },
    // Define the 'bi_main_group' attribute
    bi_main_group: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'bi_sub_group' attribute
    bi_sub_group: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'bi_exp_type' attribute
    bi_exp_type: {
      type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
    },
    // Define the 'bi_pl_bs_ind' attribute
    bi_pl_bs_ind: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'bi_dept' attribute
    bi_dept: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'trn_no' attribute
    trn_no: {
      type: DataTypes.STRING(30), // Set the data type to STRING with a length of 30
    },
    // Define the 'ac_infze' attribute
    ac_infze: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'tax_registrd' attribute
    tax_registrd: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'city_name' attribute
    city_name: {
      type: DataTypes.STRING(100), // Set the data type to STRING with a length of 100
    },
    // Define the 'tax_country_code' attribute
    tax_country_code: {
      type: DataTypes.STRING(5), // Set the data type to STRING with a length of 5
    },
    // Define the 'rcm_apply' attribute
    rcm_apply: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'approved_by' attribute
    approved_by: {
      type: DataTypes.STRING(10), // Set the data type to STRING with a length of 10
    },
    // Define the 'approved_date' attribute
    approved_date: {
      type: DataTypes.DATEONLY, // Set the data type to DATEONLY
    },
    // Define the 'cr_no' attribute
    cr_no: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
    },
    // Define the 'apprval_factor' attribute
    apprval_factor: {
      type: DataTypes.CHAR(1), // Set the data type to CHAR with a length of 1
    },
    // Define the 'request_number' attribute
    request_number: {
      type: DataTypes.STRING(20), // Set the data type to STRING with a length of 20
    },

    // Define the 'updated_by' attribute
    updated_by: {
      type: DataTypes.STRING(50), // Set the data type to STRING with a length of 50
      field: "updated_by", // Specify the actual column name in the database
    },
    // Define the 'created_by' attribute
    created_by: {
      type: DataTypes.STRING(20), // Set the data type to STRING with a length of 20
      field: "created_by", // Specify the actual column name in the database
    },
  },
  {
    sequelize, // Pass the sequelize instance
    modelName: "Account", // Set the model name
    tableName: constants.TABLE.MS_ACCODES, // Set the table name using a constant
    createdAt: "created_at", // Map the createdAt attribute to the 'created_at' column
    updatedAt: "updated_at", // Map the updatedAt attribute to the 'updated_at' column
    indexes: [
      // Define a unique index on 'company_code' and 'ac_code'
      {
        unique: true,
        fields: ["company_code", "ac_code"],
      },
    ],
  }
);

// Remove the default 'id' attribute from the model
Account.removeAttribute("id");
// Establish a 'belongsTo' relationship with AccountLevelFour model
Account.belongsTo(AccountLevelFour, {
  foreignKey: "l4_code", // Specify the foreign key in the Account model
  targetKey: "l4_code", // Specify the target key in the AccountLevelFour model
});

// Export the Account model as the default export
export default Account;
