import { DataTypes, Model } from "sequelize";
import { IVProjectmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class VProjectmaster extends Model<IVProjectmaster> {}

VProjectmaster.init(
  {
    project_code: {
      type: DataTypes.STRING(15), // Assuming a maximum length of 15 characters
      primaryKey: true,
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(5), // Assuming a maximum length of 5 characters
      primaryKey: true,
      allowNull: false,
    },
    project_name: {
      type: DataTypes.STRING(200), // Assuming a maximum length of 200 characters
      allowNull: true,
    },
    div_name: {
      type: DataTypes.STRING(100), // Adjust length as needed
      allowNull: true,
    },
    total_project_cost: {
      type: DataTypes.DECIMAL(10, 2), // Precision of 10 and scale of 2
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(50), // Adjust length as needed
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20), // Adjust length as needed
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE, // Automatically handles timestamp
      allowNull: true,
      defaultValue: DataTypes.NOW, // Sets the default value to the current date
    },
    updated_at: {
      type: DataTypes.DATE, // Automatically handles timestamp
      allowNull: true,
      defaultValue: DataTypes.NOW, // Sets the default value to the current date
    },
    div_code: {
      type: DataTypes.STRING, // Add length constraints if necessary
      allowNull: false, // Required field
    },
    prno_pre_fix: {
      type: DataTypes.STRING, // Adjust length as needed
      allowNull: true,
    },
    flag_proj_department: {
      type: DataTypes.STRING, // Adjust length as needed
      allowNull: true,
    },
    project_type: {
      type: DataTypes.STRING, // Adjust length as needed
      allowNull: false, // Required field
    },
    facility_mgr_name: {
      type: DataTypes.STRING(100), // Adjust length as needed
      allowNull: true,
    },
    facility_mgr_email: {
      type: DataTypes.STRING, // Consider setting a max length if desired
      allowNull: true,
    },
    facility_mgr_phone: {
      type: DataTypes.STRING, // Consider setting a max length if desired
      allowNull: true,
    },
    project_date_from: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    project_date_to: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    po_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    pr_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    prev_appr_amt: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ProjectmasterPfView",
    tableName: constants.VIEW.VW_MS_PS_PROJECT_MASTER,
    timestamps: false, // Disable automatic timestamps
    freezeTableName: true, // Prevent Sequelize from pluralizing the table name
  }
);

export default VProjectmaster;
