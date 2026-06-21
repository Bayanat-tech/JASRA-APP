import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IDivisionjob } from "../../../../interfaces/wms/principal_wms.interface";

class DDdivisionjob extends Model<IDivisionjob> {}

DDdivisionjob.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    div_code: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    div_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    }
   },
  {
    sequelize,
    modelName: "Divisionview",
    tableName: constants.TABLE.MS_HR_DIVISION,
    timestamps: false,
  }
);
export default DDdivisionjob;


