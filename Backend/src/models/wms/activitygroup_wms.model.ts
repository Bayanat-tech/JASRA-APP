import { DataTypes, Model } from "sequelize";
import { IActivityGroup } from "../../interfaces/wms/activitygroup_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class activitygroup extends Model<IActivityGroup> {}

activitygroup.init(
  {
    activity_group_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    act_group_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    mandatory_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    validate_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    account_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    act_group_type: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    alternate_accode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    exp_account_code: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    freight_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    rpt_group_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sw_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },

    cost_group: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "activitygroup",
    tableName: constants.TABLE.MS_ACTIVITY_GROUP,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default activitygroup;
