import { DataTypes, Model } from "sequelize";
import { IVwStkled } from "../../../../interfaces/wms/transaction/outbound/pickingDetailsWms.interface";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";

class VwStkled extends Model<IVwStkled> {}
VwStkled.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
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
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "PROD_CODE",
    },
    prod_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
      field: "PROD_NAME",
    },
    prod_uppp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "PROD_UPPP",
    },
    uom_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "UOM_COUNT",
    },
    bar_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "BAR_CODE",
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "JOB_NO",
    },
    txn_type: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: "TXN_TYPE",
    },
    txn_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "TXN_DATE",
    },
    key_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: "KEY_NUMBER",
    },
    packdet_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "PACKDET_NO",
    },
    site_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "SITE_CODE",
    },
    location_code: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: "LOCATION_CODE",
    },
    qty_rcvd: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QTY_RCVD",
    },
    qty_stock: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QTY_STOCK",
    },
    qty_picked: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QTY_PICKED",
    },
    qty_avl: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
      field: "QTY_AVL",
    },
    pqty_stock: {
      type: DataTypes.DECIMAL(23, 0),
      allowNull: false,
      field: "PQTY_STOCK",
    },
    lqty_stock: {
      type: DataTypes.DECIMAL(32, 0),
      allowNull: false,
      field: "LQTY_STOCK",
    },
    pqty_picked: {
      type: DataTypes.DECIMAL(23, 0),
      allowNull: false,
      field: "PQTY_PICKED",
    },
    lqty_picked: {
      type: DataTypes.DECIMAL(32, 0),
      allowNull: false,
      field: "LQTY_PICKED",
    },
    pqty_avl: {
      type: DataTypes.DECIMAL(23, 0),
      allowNull: false,
      field: "PQTY_AVL",
    },
    lqty_avl: {
      type: DataTypes.DECIMAL(32, 0),
      allowNull: false,
      field: "LQTY_AVL",
    },
    p_uom: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "P_UOM",
    },
    l_uom: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "L_UOM",
    },
    uppp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "UPPP",
    },
    upp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "UPP",
    },
    pack_key: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "PACK_KEY",
    },
    vessel_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "VESSEL_NAME",
    },
    container_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "CONTAINER_NO",
    },
    seal_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "SEAL_NO",
    },
    po_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PO_NO",
    },
    bl_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "BL_NO",
    },
    doc_ref: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "DOC_REF",
    },
    lot_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "LOT_NO",
    },
    pallet_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PALLET_ID",
    },
    pallet_serial_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PALLET_SERIAL_NO",
    },
    manu_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "MANU_CODE",
    },
    mfg_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "MFG_DATE",
    },
    exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "EXP_DATE",
    },
    curr_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: "CURR_CODE",
    },
    ex_rate: {
      type: DataTypes.DECIMAL(15, 5),
      allowNull: false,
      field: "EX_RATE",
    },
    unit_price: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      field: "UNIT_PRICE",
    },
    freeze_flag: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "FREEZE_FLAG",
    },
    freeze_userid: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "FREEZE_USERID",
    },
    freeze_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "FREEZE_DATE",
    },
    freeze_reason: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: "FREEZE_REASON",
    },
    identity_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "IDENTITY_NUMBER",
    },
    user_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "USER_ID",
    },
    user_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "USER_DT",
    },
    volume: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      field: "VOLUME",
    },
    net_wt: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      field: "NET_WT",
    },
    group_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "GROUP_CODE",
    },
    brand_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "BRAND_CODE",
    },
    receipt_type: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "RECEIPT_TYPE",
    },
    site_ind: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "SITE_IND",
    },
    container_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "CONTAINER_SIZE",
    },
    hs_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "HS_CODE",
    },
    qty_moved: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      field: "QTY_MOVED",
    },
    origin_country: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "ORIGIN_COUNTRY",
    },
    barcode: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "BARCODE",
    },
    model_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "MODEL_NUMBER",
    },
    cust_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "CUST_CODE",
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "SHELF_LIFE_DAYS",
    },
    shelf_life_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "SHELF_LIFE_DATE",
    },
    prod_attrib_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "PROD_ATTRIB_CODE",
    },
    prod_grade1: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PROD_GRADE1",
    },
    prod_grade2: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "PROD_GRADE2",
    },
    avg_consumption: {
      type: DataTypes.DECIMAL(38, 0),
      allowNull: false,
      field: "AVG_CONSUMPTION",
    },
    net_volume: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      field: "NET_VOLUME",
    },
    batch_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "BATCH_NO",
    },
    dept_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: "DEPT_CODE",
    },
    gross_wt: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      field: "GROSS_WT",
    },
    hazmat_ind: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "HAZMAT_IND",
    },
    hazmat_class: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "HAZMAT_CLASS",
    },
    food_ind: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "FOOD_IND",
    },
    pharma_ind: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "PHARMA_IND",
    },
    special_instructions: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "SPECIAL_INSTRUCTIONS",
    },
    ref_prod_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "REF_PROD_CODE",
    },
    batch_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "BATCH_TYPE",
    },
    class: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "CLASS",
    },
    wob: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
      field: "WOB",
    },
    unified_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "UNIFIED_CODE",
    },
  },
  {
    sequelize,
    modelName: "StkledView",
    tableName: constants.VIEW.VW_STKLED,
    createdAt: false,
    updatedAt: false,
  }
);
VwStkled.removeAttribute("id");
export default VwStkled;
