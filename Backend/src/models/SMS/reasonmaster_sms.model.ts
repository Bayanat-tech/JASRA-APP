import { DataTypes, Model } from "sequelize";
import { ISmsReasonmaster  } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class reasonmaster extends Model<ISmsReasonmaster> {}

reasonmaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    reason_code:{
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    lost_reason: {
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
    modelName: "Reasonmaster",
    tableName: constants.TABLE.SMS_REASON,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default reasonmaster;
