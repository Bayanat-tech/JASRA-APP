// Import necessary modules and interfaces
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IProfitAndLoss } from "../../../../interfaces/accounts/reports/profit_and_loss/profit_and_loss.interface";

// Define the ProfitAndLoss model
class ProfitAndLoss extends Model<IProfitAndLoss> {}

// Initialize the model with its attributes and options
ProfitAndLoss.init(
  {
    // Define the company_code attribute
    company_code: {
      type: DataTypes.STRING,
    },
    // Define the div_code attribute
    div_code: {
      type: DataTypes.STRING,
    },
    // Define the doc_date attribute
    doc_date: {
      type: DataTypes.DATEONLY,
    },
    // Define the h_code attribute
    h_code: {
      type: DataTypes.STRING,
    },
    // Define the pl_code attribute
    pl_code: {
      type: DataTypes.STRING,
    },
    // Define the pl_name attribute
    pl_name: {
      type: DataTypes.STRING,
    },
    // Define the lcur_amount attribute
    lcur_amount: {
      type: DataTypes.DECIMAL(22, 8),
    },
    // Define the h_name attribute
    h_name: {
      type: DataTypes.STRING,
    },
    // Define the s_order attribute
    s_order: {
      type: DataTypes.INTEGER,
    },
  },
  {
    // Specify the sequelize instance to use
    sequelize,
    // Specify the model name
    modelName: "ProfitAndLoss",
    // Specify the table name
    tableName: constants.VIEW.VW_AC_PL_RPT_DET,
    // Disable timestamps
    timestamps: false,
  }
);

// Remove the id attribute from the model
ProfitAndLoss.removeAttribute("id");

// Export the model
export default ProfitAndLoss;