import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IAirLine } from "../../interfaces/wms/airline_wms.interface";

class AirLine extends Model<IAirLine> {}

AirLine.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    airline_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    airline_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    airline_no: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    contact_person: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    tel_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    fax_no: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "airline",
    tableName: constants.TABLE.MS_AIRLINE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AirLine;
