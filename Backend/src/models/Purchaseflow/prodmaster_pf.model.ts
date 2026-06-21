import { DataTypes, Model } from "sequelize";
import { IProduct } from "../../interfaces/wms/gm_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class IProdmaster extends Model<IProduct> {}

IProdmaster.init(
  {
    prod_code: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    prod_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(30),
      primaryKey: true,
      allowNull: false,
    },
    upp: {
      type: DataTypes.NUMBER,
    },

    company_code: {
      type: DataTypes.STRING(10),
      primaryKey: true,
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Prodmaster",
    tableName: constants.TABLE.MS_PRODUCT,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default IProdmaster;
