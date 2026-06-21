import { DataTypes, Model } from "sequelize";
import { IActivity } from "../../interfaces/wms/activity_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Activity extends Model<IActivity> {}

Activity.init(
  {
    activity_code: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    activity: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    wip_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    income_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    bill: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    activity_group_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    activity_subgroup_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    start_point: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    end_point: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    vtype: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    freeze_flag: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    budget_cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    apptn_house: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    apptn_app_on: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    exp_sub_type: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    exp_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    tx_compnt_1_perc: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    tx_compnt_2_perc: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    tx_compnt_3_perc: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    tx_compnt_4_perc: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    tx_compnt_1_expmt: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tx_compnt_2_expmt: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tx_compnt_3_expmt: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tx_compnt_4_expmt: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    created_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Activity",
    tableName: constants.TABLE.MS_ACTIVITY,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Activity;
