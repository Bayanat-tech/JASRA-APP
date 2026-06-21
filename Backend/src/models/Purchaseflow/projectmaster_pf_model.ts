import { DataTypes, Model } from "sequelize";
import { IProjectmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Projectmaster extends Model<IProjectmaster> {}

Projectmaster.init(
  {
    project_code: {
      type: DataTypes.STRING(15),
      primaryKey: true,
      allowNull: true,
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: true,
    },
    div_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prno_pre_fix: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    flag_proj_department: {
      type: DataTypes.STRING(1),
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
    total_project_cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    project_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facility_mgr_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facility_mgr_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facility_mgr_phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Projectmaster",
    tableName: constants.TABLE.MS_PS_PROJECT_MASTER,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Projectmaster;
