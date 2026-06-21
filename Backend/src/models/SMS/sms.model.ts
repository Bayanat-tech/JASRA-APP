import { DataTypes, Model } from "sequelize";
import { ISmscompanymaster } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class companymaster extends Model<ISmscompanymaster> {}

companymaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    company_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    country: {
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
    modelName: "Companymaster",
    tableName: constants.TABLE.SMS_COMPANY,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default companymaster;
