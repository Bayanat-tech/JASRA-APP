import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { ISmsSalesRequestmaster } from "../../interfaces/SMS/sms_interface";

class salesRequestmaster extends Model<ISmsSalesRequestmaster> {}

salesRequestmaster.init(
  {
    sr_no: {
      type: DataTypes.INTEGER(),
      allowNull: true,
      primaryKey: true,
    },
    sales_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    service_offered: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    segment: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contact_name: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.INTEGER(),
      allowNull: true,
    },
    deal_desc: {
      type: DataTypes.STRING(900),
      allowNull: false,
    },
    deal_ref: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    deal_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deal_size: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    deal_probability: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    deal_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    weighted_forecast: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    lost_reason: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    status_update: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    project_closing_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    next_action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING(300),
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
    modelName: "SalesRequestmaster",
    tableName: constants.TABLE.SMS_SALES_REQUEST,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default salesRequestmaster;
