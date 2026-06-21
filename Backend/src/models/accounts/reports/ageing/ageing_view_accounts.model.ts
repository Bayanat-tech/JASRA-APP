// Import necessary modules from Sequelize library
import { DataTypes, Model } from "sequelize";
// Import the database connection
import { sequelize } from "../../../../database/connection";
// Import constants
import constants from "../../../../helpers/constants";
// Import the interface for AgeingReportViewAccounts attributes
import { IAgeingReportViewAccounts } from "../../../../interfaces/accounts/reports/ageing/ageing_view_accounts.interface";
// Import ReportDate model
import ReportDate from "../../../wms/reports/stockCriteria/report_date.model";
// Import Account model
import Account from "../../../finance/accounts/masters/account_finance.model";
// Import AccountLevelFour model
import AccountLevelFour from "../../../finance/accounts/masters/account_level_four.model";
// Define the AgeingViewAccounts class, extending Sequelize's Model class with specific attributes
class AgeingViewAccounts extends Model<IAgeingReportViewAccounts> {}

// Initialize the AgeingViewAccounts model with attributes and options
AgeingViewAccounts.init(
  {
    // Define the 'company_code' attribute
    company_code: DataTypes.STRING, // Set the data type to STRING
    // Define the 'ac_code' attribute
    ac_code: DataTypes.STRING, // Set the data type to STRING
    // Define the 'inv_no' attribute
    inv_no: DataTypes.STRING, // Set the data type to STRING
    // Define the 'inv_date' attribute
    inv_date: DataTypes.DATEONLY, // Set the data type to DATEONLY
    // Define the 'due_date' attribute
    due_date: DataTypes.DATEONLY, // Set the data type to DATEONLY
    // Define the 'lcur_amount' attribute
    lcur_amount: DataTypes.DECIMAL(41, 8), // Set the data type to DECIMAL with precision 41 and scale 8
    // Define the 'org_doctype' attribute
    org_doctype: DataTypes.STRING, // Set the data type to STRING
    // Define the 'orgamt_ofunallocated' attribute
    orgamt_ofunallocated: DataTypes.DECIMAL(41, 8), // Set the data type to DECIMAL with precision 41 and scale 8
    // Define the 'unallocated_flag' attribute
    unallocated_flag: DataTypes.STRING, // Set the data type to STRING
    // Define the 'div_code' attribute
    div_code: DataTypes.STRING, // Set the data type to STRING
  },
  {
    sequelize, // Pass the sequelize instance
    modelName: "AgeingViewAccounts", // Set the model name
    tableName: constants.VIEW.VW_AC_INV_OUTSTANDING_WITHUNALLOC, // Set the table name using a constant
    timestamps: false, // Disable timestamps for this model
  }
);

// Establish a 'belongsTo' relationship with Account model
AgeingViewAccounts.belongsTo(Account, {
  foreignKey: "ac_code", // Specify the foreign key in the AgeingViewAccounts model
  targetKey: "ac_code", // Specify the target key in the Account model (primary key)
});
// Establish a 'belongsTo' relationship with AccountLevelFour model
AgeingViewAccounts.belongsTo(AccountLevelFour, {
  foreignKey: "company_code", // Specify the foreign key in the AgeingViewAccounts model
  targetKey: "company_code", // Specify the target key in the AccountLevelFour model (primary key)
});
// Establish a 'belongsTo' relationship with ReportDate model
AgeingViewAccounts.belongsTo(ReportDate, {
  foreignKey: "due_date", // Specify the foreign key in the AgeingViewAccounts model
  targetKey: "date_to", // Specify the target key in the ReportDate model
});

// Export the AgeingViewAccounts model as the default export
export default AgeingViewAccounts;
