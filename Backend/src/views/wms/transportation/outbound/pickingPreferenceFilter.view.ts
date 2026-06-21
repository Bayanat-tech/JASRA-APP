import { DataTypes, Model } from "sequelize";
import { IPickingItemPreference } from "../../../../interfaces/wms/transaction/outbound/pickingDetailsWms.interface";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";

class VwWmOubJobPickFilter extends Model<IPickingItemPreference> {}

VwWmOubJobPickFilter.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    prod_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    order_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cust_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cust_name: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "VwWmOubJobPickFilter",
    tableName: constants.VIEW.VW_WM_OUB_JOB_PICK_FILTER,
    timestamps: false,
  }
);
VwWmOubJobPickFilter.removeAttribute("id");

export default VwWmOubJobPickFilter;
