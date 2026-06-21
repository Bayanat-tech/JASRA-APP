import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IPort } from "../../interfaces/wms/port_wms.interface";

class Port extends Model<IPort> {}

Port.init(
  {
    port_code: {
      type: DataTypes.STRING(8),
      allowNull: false,
      primaryKey: true,
    },
    port_name: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    trp_mode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(5),
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
  },
  {
    sequelize,
    modelName: "Port",
    tableName: constants.TABLE.MS_PORT,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Port;
