import { DataTypes, Model } from "sequelize";
import { ISmsProbabilitymaster } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class probabilitymaster extends Model<ISmsProbabilitymaster> {}

probabilitymaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    probability_code:{
      type: DataTypes.STRING(50) ,
      allowNull: true,
    },
    deal_probability: {
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
    modelName: "Probabilitymaster",
    tableName: constants.TABLE.SMS_DEAL_PROBABILITY,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default probabilitymaster;
