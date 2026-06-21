import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IAlert } from "../../interfaces/wms/gm_wms.interface";

class Alert extends Model<IAlert> {}

Alert.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    op_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    op_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    op_desc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    op_sequence: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    op_module: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    op_mode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    instruction: {
      type: DataTypes.STRING(1), // 'Y' or 'N'
      allowNull: false,
      defaultValue: "N",
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Alert",
    tableName: constants.TABLE.MS_ALERT,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      // {
      //   unique: true,
      //   fields: ["company_code", "op_code"],
      // },
    ],
  }
);

// Removing default id field, assuming it's not required
Alert.removeAttribute("id");

export default Alert;
