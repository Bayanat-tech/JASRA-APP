import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { ILocationType } from "../../interfaces/wms/locationtype_wms.interface";

class LocationType extends Model<ILocationType> {}

LocationType.init(
  {
    loc_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    loc_cbm: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    loc_wt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    push_level: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    user_dt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    loc_name: {
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
    modelName: "LocationType",
    tableName: constants.TABLE.MS_LOCTYPE,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_code", "loc_cbm"],
      },
    ],
  }
);
LocationType.removeAttribute("id");
export default LocationType;
