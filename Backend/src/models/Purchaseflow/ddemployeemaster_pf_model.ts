import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

// Define the EmployeeMaster model
export class EmployeeMaster extends Model {
  public alternate_id!: string;
  public rpt_name!: string;
  public company_code!: string;
  public updated_by!: string;
  public created_by!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

// Initialize the EmployeeMaster model
EmployeeMaster.init(
  {
    alternate_id: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    rpt_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "EmployeeMaster",
    tableName: constants.TABLE.MS_HR_EMPLOYEE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
export default EmployeeMaster;
