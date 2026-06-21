import { DataTypes, Model } from "sequelize";
import { ITerritory } from "../../interfaces/wms/territory_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Territory extends Model<ITerritory> {}

Territory.init(
  {
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    territory_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    territory_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    modelName: "Territory",
    tableName: constants.TABLE.MS_TERRITORY,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Territory;
