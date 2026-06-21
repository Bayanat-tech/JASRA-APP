import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IPrincipalWmsView } from "../../interfaces/wms/principal_wms.interface";

class PrincipalWmsView extends Model<IPrincipalWmsView> {}

PrincipalWmsView.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prin_city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_addr1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_status: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    prin_group: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prin_groupName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PrincipalWmsView",
    tableName: constants.VIEW.VW_MS_PRIN_LIST_DATA,
    timestamps: false,
  }
);
PrincipalWmsView.removeAttribute("id");

export default PrincipalWmsView;
