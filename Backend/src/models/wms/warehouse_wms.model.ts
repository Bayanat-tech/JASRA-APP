import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IWarehouse } from "../../interfaces/wms/warehouse_wms";

class Warehouse extends Model<IWarehouse> {}

Warehouse.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    wh_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    wh_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "WAREHOUSE",
    tableName: constants.TABLE.MS_WAREHOUSE,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_code", "wh_code"],
      },
    ],
  }
);
Warehouse.removeAttribute("id");
export default Warehouse;
