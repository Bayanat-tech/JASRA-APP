import { DataTypes, Model } from "sequelize";
import { ISmsSalesmaster  } from "../../interfaces/SMS/sms_interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class salesmaster extends Model<ISmsSalesmaster> {}

salesmaster.init(
  {
    id: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    sales_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sales_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
      contact_no: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
      email: {
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
    modelName: "Salesmaster",
    tableName: constants.TABLE.SMS_SALES,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default salesmaster;
