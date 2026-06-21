import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { ITempSummaryStock } from "../../../../interfaces/wms/reports/stockCriteria/temp_summary_stock.interface";

class TempSummaryStock extends Model<ITempSummaryStock> {}

TempSummaryStock.init(
  {
    prin_code: {
      type: DataTypes.STRING,
    },
    prod_code: {
      type: DataTypes.STRING,
    },
    prod_name: {
      type: DataTypes.STRING,
    },
    open_stk_puom: {
      type: DataTypes.STRING,
    },
    open_stk_luom: {
      type: DataTypes.STRING,
    },
    open_stk: {
      type: DataTypes.STRING,
    },
    qty_in_puom: {
      type: DataTypes.STRING,
    },
    qty_in_luom: {
      type: DataTypes.STRING,
    },
    qty_in: {
      type: DataTypes.STRING,
    },
    qty_out_puom: {
      type: DataTypes.STRING,
    },
    qty_out_luom: {
      type: DataTypes.STRING,
    },
    qty_out: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "TempSummaryStock",
    tableName: constants.TEMP.TEMP_SUMMARY_STOCK,
    timestamps: false,
  }
);
TempSummaryStock.removeAttribute("id");
export default TempSummaryStock;
