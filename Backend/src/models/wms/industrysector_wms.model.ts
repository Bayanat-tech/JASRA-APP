import { DataTypes, Model } from "sequelize";
import { IIndustrysector } from "../../interfaces/wms/gm_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class industrysector extends Model<IIndustrysector> {}

industrysector.init(
  {
    sector_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    sector_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING(100),
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
    modelName: "Industrysector",
    tableName: constants.TABLE.MS_INDUSTRY_SECTOR,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default industrysector;
