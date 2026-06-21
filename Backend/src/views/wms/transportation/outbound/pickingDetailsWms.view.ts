import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IPickingDetailsWmsView } from "../../../../interfaces/wms/transaction/outbound/pickingDetailsWms.interface";

class PickingDetailsOutboundWmsView extends Model<IPickingDetailsWmsView> {}

PickingDetailsOutboundWmsView.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      field: "COMPANY_CODE", // Map to the database column
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "PRIN_CODE", // Map to the database column
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "JOB_NO", // Map to the database column
    },
    order_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "ORDER_NO", // Map to the database column
    },
    serial_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "SERIAL_NO", // Map to the database column
    },
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "PROD_CODE", // Map to the database column
    },
    qty_puom: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QTY_PUOM", // Map to the database column
    },
    p_uom: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "P_UOM", // Map to the database column
    },
    qty_luom: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QTY_LUOM", // Map to the database column
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QUANTITY", // Map to the database column
    },
    doc_ref: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "DOC_REF", // Map to the database column
    },
    lot_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "LOT_NO", // Map to the database column
    },
    po_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PO_NO", // Map to the database column
    },
    imp_job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "IMP_JOB_NO", // Map to the database column
    },
    manu_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "MANU_CODE", // Map to the database column
    },
    container_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "CONTAINER_NO", // Map to the database column
    },
    production_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "PRODUCTION_FROM", // Map to the database column
    },
    production_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "PRODUCTION_TO", // Map to the database column
    },
    expiry_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "EXPIRY_FROM", // Map to the database column
    },
    expiry_to: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "EXPIRY_TO", // Map to the database column
    },
    unit_price: {
      type: DataTypes.DECIMAL(16, 6),
      allowNull: false,
      field: "UNIT_PRICE", // Map to the database column
    },
    site_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "SITE_CODE", // Map to the database column
    },
    loc_code_from: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: "LOC_CODE_FROM", // Map to the database column
    },
    loc_code_to: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: "LOC_CODE_TO", // Map to the database column
    },
    picked: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "PICKED", // Map to the database column
    },
    confirmed: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "CONFIRMED", // Map to the database column
    },
    confirmed_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "CONFIRMED_DATE", // Map to the database column
    },
    l_uom: {
      type: DataTypes.STRING(6),
      allowNull: false,
      field: "L_UOM", // Map to the database column
    },
    uppp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "UPPP", // Map to the database column
    },
    selected: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "SELECTED", // Map to the database column
    },
    aisle_from: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "AISLE_FROM", // Map to the database column
    },
    aisle_to: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "AISLE_TO", // Map to the database column
    },
    height_from: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "HEIGHT_FROM", // Map to the database column
    },
    height_to: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "HEIGHT_TO", // Map to the database column
    },
    column_from: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "COLUMN_FROM", // Map to the database column
    },
    column_to: {
      type: DataTypes.STRING(2),
      allowNull: false,
      field: "COLUMN_TO", // Map to the database column
    },
    gate_no: {
      type: DataTypes.STRING(3),
      allowNull: true,
      field: "GATE_NO", // Map to the database column
    },
    sales_rate: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      field: "SALES_RATE", // Map to the database column
    },
    exp_container_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "EXP_CONTAINER_NO", // Map to the database column
    },
    exp_container_size: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: true,
      field: "EXP_CONTAINER_SIZE", // Map to the database column
    },
    exp_container_type: {
      type: DataTypes.STRING(40),
      allowNull: true,
      field: "EXP_CONTAINER_TYPE", // Map to the database column
    },
    exp_container_sealno: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "EXP_CONTAINER_SEALNO", // Map to the database column
    },
    origin_country: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "ORIGIN_COUNTRY", // Map to the database column
    },
    tx_identity_number: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "TX_IDENTITY_NUMBER", // Map to the database column
    },
    prod_attrib_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PROD_ATTRIB_CODE", // Map to the database column
    },
    prod_grade1: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "PROD_GRADE1", // Map to the database column
    },
    prod_grade2: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "PROD_GRADE2", // Map to the database column
    },
    cust_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "CUST_CODE", // Map to the database column
    },
    hs_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "HS_CODE", // Map to the database column
    },
    batch_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "BATCH_NO", // Map to the database column
    },
    act_order_qty: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: true,
      field: "ACT_ORDER_QTY", // Map to the database column
    },
    bal_order_qty: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: true,
      field: "BAL_ORDER_QTY", // Map to the database column
    },
    minperiod_exppick: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "MINPERIOD_EXPPICK", // Map to the database column
    },
    ignore_minexp_period: {
      type: DataTypes.STRING(1),
      allowNull: true,
      field: "IGNORE_MINEXP_PERIOD", // Map to the database column
    },
  },
  {
    sequelize,
    modelName: "PickingDetailsOutboundWmsView",
    tableName: constants.VIEW.VW_WM_OUB_TO_PICK, // View name in DB
    timestamps: false,
  }
);

PickingDetailsOutboundWmsView.removeAttribute("id"); // Remove the auto-generated ID attribute

export default PickingDetailsOutboundWmsView;
