import { DataTypes, Model } from "sequelize";
import { IActivityBilling } from "../../interfaces/wms/activity_billing_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class ActivityBilling extends Model<IActivityBilling> {}

ActivityBilling.init(
  {
    prin_code: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    act_code: {
      type: DataTypes.STRING(15),
      allowNull: true, // Allowing null
    },
    wip_code: {
      type: DataTypes.STRING(10),
      allowNull: true, // Allowing null
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
    },
    income_code: {
      type: DataTypes.STRING(10),
      allowNull: true, // Allowing null
    },
    bill_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true, // Allowing null
    },
    jobtype: {
      type: DataTypes.STRING(10),
    },
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: true, // Allowing null
    },
    freeze_flag: {
      type: DataTypes.STRING(1),
      allowNull: true, // Allowing null
    },
    mandatory_flag: {
      type: DataTypes.STRING(1),
      allowNull: true, // Allowing null
    },
    validate_flag: {
      type: DataTypes.STRING(1),
      allowNull: true, // Allowing null
    },
    uoc: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    moc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Already null
    },
    moc1: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    moc2: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    cust_code: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    start_point: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    end_point: {
      type: DataTypes.STRING(50),
      allowNull: true, // Already null
    },
    customer_type: {
      type: DataTypes.STRING(10),
      allowNull: true, // Already null
    },
    vtype_code: {
      type: DataTypes.STRING(10),
      allowNull: true, // Already null
    },
    serial_no: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allowing null
    },
    serial_no2: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allowing null
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true, // Allowing null
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true, // Allowing null
    },
  },
  {
    sequelize,
    modelName: "ActivityBilling",
    tableName: constants.TABLE.MS_ACTIVITY_BILLING,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
ActivityBilling.removeAttribute("id");
export default ActivityBilling;
