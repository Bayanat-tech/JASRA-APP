import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IPartner } from "../../interfaces/wms/partner_wms.interface";

class partner extends Model<IPartner> {}

partner.init(
  {
    broker_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    broker_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    broker_addr1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    broker_city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    broker_contact1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    broker_telno1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    broker_email1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    /*
    broker_stat: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    */
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "partner",
    tableName: constants.TABLE.MS_BROKER,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default partner;
