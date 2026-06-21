import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IPrincipaljob } from "../../../../interfaces/wms/principal_wms.interface";

class DDPrincipaljob extends Model<IPrincipaljob> {}

DDPrincipaljob.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PrincipalWmsView",
    tableName: constants.TABLE.MS_PRINCIPAL,
    timestamps: false,
  }
);
export default DDPrincipaljob;
