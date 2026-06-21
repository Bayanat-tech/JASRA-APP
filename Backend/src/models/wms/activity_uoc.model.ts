import { DataTypes, Model } from "sequelize";
import { IActivityUoc } from "../../interfaces/wms/activity_uoc_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class ActivityUoc extends Model<IActivityUoc> {}

ActivityUoc.init(
  {
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    charge_type: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    charge_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    activity_group_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ActivityUoc",
    tableName: constants.TABLE.MS_ACTIVITY_UOC,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ActivityUoc;
