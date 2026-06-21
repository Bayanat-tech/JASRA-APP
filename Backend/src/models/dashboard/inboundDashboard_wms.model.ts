import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../database/connection";
import { IInboundDashboard } from "../../interfaces/dashboard/dashboard.iterface";
import constants from "../../helpers/constants";

class InboundDashboard extends Model<IInboundDashboard> {}

InboundDashboard.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    site_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    txn_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    container_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(34, 1),
      allowNull: false,
    },
    prin_group: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "InboundDashboard",
    tableName: constants.VIEW.VW_BI_INB_TXN_DETS,
    timestamps: false,
  }
);
InboundDashboard.removeAttribute("id");
export default InboundDashboard;
