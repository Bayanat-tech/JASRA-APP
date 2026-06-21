import { DataTypes, Model } from "sequelize";
import { IServicemaster } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class servicemaster extends Model<IServicemaster> {}

servicemaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    service_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    service_name: {
      type: DataTypes.STRING(200),
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
    modelName: "Servicemaster",
    tableName: constants.TABLE.SMS_SERVICE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default servicemaster;
