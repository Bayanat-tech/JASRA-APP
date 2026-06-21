import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IMoc } from "../../interfaces/wms/gm_wms.interface";

class Moc extends Model<IMoc> {}

Moc.init(
  {
    charge_code: {
      type: DataTypes.STRING(4),
      allowNull: false,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    charge_type: {
      type: DataTypes.STRING(4),
       allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
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
    modelName: "Moc",
    tableName: constants.TABLE.MS_ACTIVITY_UOC,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Moc;


