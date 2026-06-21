import { DataTypes, Model } from "sequelize";
import { ISmsDealmaster } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class dealmaster extends Model<ISmsDealmaster> {}

dealmaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    status_code:{
      type: DataTypes.STRING(50) ,
    allowNull: true,
  },
    deal_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status_percentage: {
      type: DataTypes.INTEGER(),
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
    modelName: "Dealmaster",
    tableName: constants.TABLE.SMS_DEAL_STATUS,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default dealmaster;
