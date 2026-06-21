import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IStockDetailsReport } from "../../../../interfaces/wms/reports/stockCriteria/stock_details.interface";

class StockDetailsReport extends Model<IStockDetailsReport> {}

StockDetailsReport.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "COMPANY_CODE",
    },
    prin_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PRIN_CODE",
    },
    prin_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "PRIN_NAME",
    },
    prod_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PROD_CODE",
    },
    prod_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "PROD_NAME",
    },
    prod_uppp: {
      type: DataTypes.INTEGER,
      field: "PROD_UPPP",
    },
    uom_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "UOM_COUNT",
    },
    bar_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "BAR_CODE",
    },
    job_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "JOB_NO",
    },
    txn_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "TXN_TYPE",
    },
    txn_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "TXN_DATE",
    },
    key_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "KEY_NUMBER",
    },
    packdet_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "PACKDET_NO",
    },
    site_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "SITE_CODE",
    },
    location_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "LOCATION_CODE",
    },
    qty_rcvd: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "QTY_RCVD",
    },
    qty_stock: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "QTY_STOCK",
    },
    qty_picked: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "QTY_PICKED",
    },
    qty_avl: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "QTY_AVL",
    },
    pqty_stock: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "PQTY_STOCK",
    },
    lqty_stock: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "LQTY_STOCK",
    },
    pqty_picked: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "PQTY_PICKED",
    },
    lqty_picked: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "LQTY_PICKED",
    },
    pqty_avl: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "PQTY_AVL",
    },
    lqty_avl: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "LQTY_AVL",
    },
    p_uom: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "P_UOM",
    },
    l_uom: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "L_UOM",
    },
    uppp: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "UPPP",
    },
    upp: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "UPP",
    },
    pack_key: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PACK_KEY",
    },
    vessel_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "VESSEL_NAME",
    },
    container_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "CONTAINER_NO",
    },
    seal_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "SEAL_NO",
    },
    po_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PO_NO",
    },
    bl_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "BL_NO",
    },
    doc_ref: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "DOC_REF",
    },
    lot_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "LOT_NO",
    },
    pallet_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PALLET_ID",
    },
    pallet_serial_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PALLET_SERIAL_NO",
    },
    manu_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "MANU_CODE",
    },
    mfg_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "MFG_DATE",
    },
    exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "EXP_DATE",
    },
    curr_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "CURR_CODE",
    },
    ex_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "EX_RATE",
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "UNIT_PRICE",
    },
    freeze_flag: {
      type: DataTypes.STRING(1),
      allowNull: true,
      field: "FREEZE_FLAG",
    },
    freeze_userid: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "FREEZE_USERID",
    },
    freeze_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "FREEZE_DATE",
    },
    freeze_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "FREEZE_REASON",
    },
    identity_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "IDENTITY_NUMBER",
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "USER_ID",
    },
    user_dt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "USER_DT",
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "VOLUME",
    },
    net_wt: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "NET_WT",
    },
    group_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "GROUP_CODE",
    },
    brand_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "BRAND_CODE",
    },
    receipt_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "RECEIPT_TYPE",
    },
    site_ind: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "SITE_IND",
    },
    container_size: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "CONTAINER_SIZE",
    },
    hs_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "HS_CODE",
    },
    qty_moved: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "QTY_MOVED",
    },
    origin_country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ORIGIN_COUNTRY",
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "BARCODE",
    },
    model_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "MODEL_NUMBER",
    },
    cust_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "CUST_CODE",
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "SHELF_LIFE_DAYS",
    },
    shelf_life_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "SHELF_LIFE_DATE",
    },
    prod_attrib_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PROD_ATTRIB_CODE",
    },
    prod_grade1: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PROD_GRADE1",
    },
    prod_grade2: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PROD_GRADE2",
    },
    avg_consumption: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "AVG_CONSUMPTION",
    },
    net_volume: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "NET_VOLUME",
    },
    batch_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "BATCH_NO",
    },
    dept_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "DEPT_CODE",
    },
    gross_wt: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "GROSS_WT",
    },
    hazmat_ind: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "HAZMAT_IND",
    },
    hazmat_class: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "HAZMAT_CLASS",
    },
    food_ind: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "FOOD_IND",
    },
    pharma_ind: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "PHARMA_IND",
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "SPECIAL_INSTRUCTIONS",
    },
    ref_prod_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "REF_PROD_CODE",
    },
    batch_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "BATCH_TYPE",
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "CLASS",
    },
    wob: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: "WOB",
    },
    unified_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "UNIFIED_CODE",
    },
  },
  {
    sequelize,
    modelName: "StockDetailsReport",
    tableName: constants.VIEW.VW_STKLED,
    timestamps: false,
  }
);

StockDetailsReport.removeAttribute("id");

export default StockDetailsReport;
