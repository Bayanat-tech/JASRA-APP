import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IBrand } from "../../interfaces/wms/gm_wms.interface";

class Brand extends Model<IBrand> {}

Brand.init(
  {
    brand_code: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    group_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    brand_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pref_site: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    pref_loc_from: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    pref_loc_to: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    pref_aisle_from: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    pref_aisle_to: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    pref_col_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pref_col_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pref_ht_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pref_ht_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },

    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Brand",
    tableName: constants.TABLE.MS_PRODBRAND,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Brand;
