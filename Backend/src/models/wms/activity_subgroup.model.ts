import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IActivitysubgroup } from "../../interfaces/wms/activity_subgroup_wms.interface";

class Activitysubgroup extends Model<IActivitysubgroup> {}

Activitysubgroup.init(
  {
    activity_subgroup_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    act_subgroup_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // mandatory_flag: {
    //   type: DataTypes.STRING(1),
    //   allowNull: true,
    // },
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    act_group_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    // validate_flag: {
    //   type: DataTypes.STRING(1),
    //   allowNull: true,
    // },
    // updated_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // created_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "Activitysubgroup",
    tableName: constants.TABLE.MS_ACTIVITY_SUBGROUP,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Activitysubgroup;
