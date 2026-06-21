// Import required dependencies from Sequelize
import { DataTypes, Model } from "sequelize";
// Import database connection
import { sequelize } from "../../../../database/connection";
// Import constants for table names
import constants from "../../../../helpers/constants";
// Import interface for type safety
import { ITrInAllReports } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";

// Define TrAllReports class extending Sequelize Model with ITrInAllReports interface
class TrAllReports extends Model<ITrInAllReports> {}

// Initialize the model with its attributes and options
TrAllReports.init(
  {
    // Company identifier
    company_code: {
      type: DataTypes.STRING,
    },
    // Module name for the report
    module: {
      type: DataTypes.STRING,
    },
    // Submodule name for more specific categorization
    submodule: {
      type: DataTypes.STRING,
    },
    // Name of the report
    reportname: {
      type: DataTypes.STRING,
    },
    // Object containing report data
    reportobject: {
      type: DataTypes.STRING,
    },
    // Additional information field
    other: {
      type: DataTypes.STRING,
    },
    // Sequence number for ordering
    seq_number: {
      type: DataTypes.INTEGER,
    },
    // Report display order
    reportorder: {
      type: DataTypes.INTEGER,
    },
    // Unique identifier for the report
    report_id: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "TrAllReports",
    tableName: constants.TABLE.MG_REPORTS,
    timestamps: false, // Disable timestamp fields (createdAt, updatedAt)
  }
);

// Remove default id attribute as it's not needed
TrAllReports.removeAttribute("id");
// Export the model for use in other files
export default TrAllReports;
