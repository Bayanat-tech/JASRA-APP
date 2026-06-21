import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IManufacture } from "../../interfaces/wms/gm_wms.interface";

class Manufacture extends Model<IManufacture> {}

Manufacture.init(
  {
    manu_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    manu_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

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
    modelName: "Manufacture",
    tableName: constants.TABLE.MS_MANUFACTURER,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Manufacture;
