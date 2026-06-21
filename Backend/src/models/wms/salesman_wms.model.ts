import { DataTypes, Model } from "sequelize";
import { ISalesman } from "../../interfaces/wms/gm_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Salesman extends Model<ISalesman> {}

Salesman.init(
  {
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    salesman_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    salesman_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Salesman",
    tableName: constants.TABLE.MS_SALESMAN,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Salesman;
