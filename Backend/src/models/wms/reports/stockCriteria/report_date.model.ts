
// Import necessary modules from Sequelize library
import { DataTypes, Model } from "sequelize";
// Import the database connection
import { sequelize } from "../../../../database/connection";
// Import constants
import constants from "../../../../helpers/constants";
// Import the interface for ReportDate attributes
import { IReportDate } from "../../../../interfaces/wms/reports/stockCriteria/report_date.interface";
// Define the ReportDate class, extending Sequelize's Model class with specific attributes
class ReportDate extends Model<IReportDate> {}

// Initialize the ReportDate model with attributes and options
ReportDate.init(
  {
    // Define the 'date_from' attribute
    date_from: DataTypes.DATEONLY, // Set the data type to DATEONLY
    // Define the 'date_to' attribute
    date_to: DataTypes.DATEONLY, // Set the data type to DATEONLY
    // Define the 'hr_request_date' attribute
    hr_request_date: DataTypes.DATEONLY, // Set the data type to DATEONLY
    // Define the 'hr_request_date_from' attribute
    hr_request_date_from: DataTypes.DATEONLY, // Set the data type to DATEONLY
  },
  {
    sequelize, // Pass the sequelize instance
    modelName: "ReportDate", // Set the model name
    tableName: constants.TABLE.REPORT_DATE, // Set the table name using a constant
    timestamps: false, // Disable timestamps for this model
  }
);
// Remove the default 'id' attribute from the model
ReportDate.removeAttribute("id");
// Export the ReportDate model as the default export
export default ReportDate;
