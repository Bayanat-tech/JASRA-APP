import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IAssetgroup } from "../../interfaces/wms/assetgroup_wms.interface";

class Assetgroup extends Model<IAssetgroup> {}

Assetgroup.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    asset_group_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    asset_group_name: {
      type: DataTypes.STRING(255),
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
    modelName: "Assetgroup",
    tableName: constants.TABLE.MS_AC_ASSET_GROUP,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_code", "asset_group_code"],
      },
    ],
  }
);
Assetgroup.removeAttribute("id");
export default Assetgroup;
