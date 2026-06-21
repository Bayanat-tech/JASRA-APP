import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IHarmonize } from "../../interfaces/wms/harmonize.interface";

class Harmonize extends Model<IHarmonize> {}

Harmonize.init(
  {
    harm_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    harm_desc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(20),
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
    // created_at: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "Harmonize",
    tableName: constants.TABLE.MS_HARMONIZE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Harmonize;


