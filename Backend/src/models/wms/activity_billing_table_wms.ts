import { DataTypes, Model } from "sequelize";
import { IActivityBillingTable } from "../../interfaces/wms/activity_billing_table_wms";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class ActivityBillingTable extends Model<IActivityBillingTable> {}

ActivityBillingTable.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "COMPANY_CODE",
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "PRIN_CODE",
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "PRIN_NAME",
    },
    act_code: {
      type: DataTypes.STRING(5),
      field: "ACT_CODE",
    },
    activity: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "ACTIVITY",
    },
    jobtype: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: "JOBTYPE",
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "USER_ID",
    },
    uoc: {
      type: DataTypes.STRING(5),
      field: "UOC",
    },
    moc1: {
      type: DataTypes.STRING(5),
      field: "MOC1",
    },
    moc2: {
      type: DataTypes.STRING(5),
      field: "MOC2",
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      field: "COST",
    },
    bill_amount: {
      type: DataTypes.DECIMAL(15, 2),
      field: "BILL_AMOUNT",
    },
  },
  {
    sequelize,
    modelName: "ActivityBillingTable",
    tableName: constants.VIEW.VW_GEN_ACTIVITY_BILLING_DATA,
    timestamps: false,
  }
);

ActivityBillingTable.removeAttribute("id");

export default ActivityBillingTable;
