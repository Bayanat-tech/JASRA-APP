// Import necessary modules from Sequelize library
import { DataTypes, Model } from "sequelize";
// Import the database connection
import { sequelize } from "../../../../database/connection";
// Import constants
import constants from "../../../../helpers/constants";
// Import the interface for MsCompanyInfo attributes
import { IMsCompanyInfo } from "../../../../interfaces/wms/reports/stockCriteria/ms_company_info.interface";
// Define the MsCompanyInfo class, extending Sequelize's Model class with specific attributes
class MsCompanyInfo extends Model<IMsCompanyInfo> {}

// Initialize the MsCompanyInfo model with attributes and options
MsCompanyInfo.init(
  {
    // Define the 'company_code' attribute
    company_code: DataTypes.STRING, // Set the data type to STRING
    // Define the 'company_name' attribute
    company_name: DataTypes.STRING, // Set the data type to STRING
    // Define the 'age_1' attribute
    age_1: DataTypes.INTEGER, // Set the data type to INTEGER
    // Define the 'age_2' attribute
    age_2: DataTypes.INTEGER, // Set the data type to INTEGER
    // Define the 'age_3' attribute
    age_3: DataTypes.INTEGER, // Set the data type to INTEGER
    // Define the 'age_4' attribute
    age_4: DataTypes.INTEGER, // Set the data type to INTEGER
    // Define the 'age_5' attribute
    age_5: DataTypes.INTEGER, // Set the data type to INTEGER
    // Define the 'ac_fy_period' attribute
    ac_fy_period: DataTypes.STRING(5), // Set the data type to STRING with length 5
  },
  {
    sequelize, // Pass the sequelize instance
    modelName: "MsCompanyInfo", // Set the model name
    tableName: constants.TABLE.MS_COMPANYINFO, // Set the table name using a constant
    timestamps: false, // Disable timestamps for this model
  }
);
// Remove the default 'id' attribute from the model
MsCompanyInfo.removeAttribute("id");
// Export the MsCompanyInfo model as the default export
export default MsCompanyInfo;
