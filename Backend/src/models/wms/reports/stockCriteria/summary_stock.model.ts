import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { ISummaryStock } from "../../../../interfaces/wms/reports/stockCriteria/summary_stock.interface";
import Product from "../../product_wms.model";
class SummaryStock extends Model<ISummaryStock> {}

SummaryStock.init(
  {
    company_code: {
      type: DataTypes.STRING,
      // field: "COMPANY_CODE",
    },
    prin_code: {
      type: DataTypes.STRING,
      // field: "PRIN_CODE",
    },
    prin_name: {
      type: DataTypes.STRING,
      // field: "PRIN_NAME",
    },
    txn_type: {
      type: DataTypes.STRING,
      // field: "TXN_TYPE",
    },
    job_no: {
      type: DataTypes.STRING,
      // field: "JOB_NO",
    },
    txn_date: {
      type: DataTypes.DATEONLY,
      // field: "TXN_DATE",
    },
    prod_code: {
      type: DataTypes.STRING,
      // field: "PROD_CODE",
    },
    qty_puom: {
      type: DataTypes.DECIMAL(12, 1),
      // field: "QTY_PUOM",
    },
    p_uom: {
      type: DataTypes.STRING,
      // field: "P_UOM",
    },
    qty_luom: {
      type: DataTypes.DECIMAL(12, 1),
      // field: "QTY_LUOM",
    },
    l_uom: {
      type: DataTypes.STRING,
      // field: "L_UOM",
    },
    site_code: {
      type: DataTypes.STRING,
      // field: "SITE_CODE",
    },
    location_code: {
      type: DataTypes.STRING,
      // field: "LOCATION_CODE",
    },
    user_id: {
      type: DataTypes.STRING,
      // field: "USER_ID",
    },
    order_no: {
      type: DataTypes.STRING,
      // field: "ORDER_NO",
    },
    aisle: {
      type: DataTypes.STRING,
      // field: "AISLE",
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 1),
      // field: "QUANTITY",
    },
    sign_indicator: {
      type: DataTypes.INTEGER,
      // field: "SIGN_INDICATOR",
    },
    origin_country: {
      type: DataTypes.STRING,
      // field: "ORIGIN_COUNTRY",
    },
    lot_no: {
      type: DataTypes.STRING,
      // field: "LOT_NO",
    },
    container_no: {
      type: DataTypes.STRING,
      // field: "CONTAINER_NO",
    },
    doc_ref: {
      type: DataTypes.STRING,
      // field: "DOC_REF",
    },
    exp_date: {
      type: DataTypes.DATEONLY,
      // field: "EXP_DATE",
    },
    prod_grade1: {
      type: DataTypes.STRING,
    },
    prod_grade2: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    po_no: {
      type: DataTypes.STRING,
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
    },
    ex_rate: {
      type: DataTypes.DECIMAL(12, 2),
    },
  },
  {
    sequelize,
    modelName: "SummaryStock",
    tableName: constants.VIEW.VW_TRANS_WITHACTIVE,
    timestamps: false,
  }
);

SummaryStock.removeAttribute("id");
SummaryStock.belongsTo(Product, {
  foreignKey: "prod_code",
  targetKey: "prod_code",
});

export default SummaryStock;
