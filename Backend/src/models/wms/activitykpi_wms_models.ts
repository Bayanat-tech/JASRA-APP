import { DataTypes, Model } from "sequelize";
import { IActivityKPI } from "../../interfaces/wms/activity_wms.interface"; 
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class ActivityKPI extends Model<IActivityKPI> {}

ActivityKPI.init(
  {
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    job_type: {
      type: DataTypes.STRING(4),
      allowNull: false,
    },
    act_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    cust_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    exp_hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ActivityKPI",
    tableName: constants.TABLE.MS_ACTIVITY_KPI,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ActivityKPI;
