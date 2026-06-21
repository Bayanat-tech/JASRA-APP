import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IToOrderEntry } from "../../../../interfaces/wms/transaction/outbound/orderEntryWms.interface";

class OrderEntry extends Model<IToOrderEntry> {}

OrderEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "ID",
    },
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      field: "COMPANY_CODE", // Maps to uppercase database column
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "PRIN_CODE",
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "JOB_NO",
    },
    cust_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "CUST_CODE",
    },
    cust_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "CUST_NAME",
    },
    order_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "ORDER_NO",
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "ORDER_DATE",
    },
    order_due_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "ORDER_DUE_DATE",
    },
    cust_reference: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "CUST_REFERENCE",
    },
    po_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PO_NO",
    },
    po_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "PO_DATE",
    },
    curr_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      field: "CURR_CODE",
    },
    ex_rate: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false,
      field: "EX_RATE",
    },
    exp_container_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "EXP_CONTAINER_NO",
    },
    exp_container_size: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "EXP_CONTAINER_SIZE",
    },
    exp_container_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "EXP_CONTAINER_TYPE",
    },
    exp_container_sealno: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "EXP_CONTAINER_SEALNO",
    },
    moc1: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "MOC1",
    },
    moc2: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "MOC2",
    },
    act_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "ACT_CODE",
    },
    uoc: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "UOC",
    },
    volume: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "VOLUME",
    },
    net_weight: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "NET_WEIGHT",
    },
    assigned_pda_user: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ASSIGNED_PDA_USER",
    },
    order_serial: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ORDER_SERIAL",
    },
    ref_txn_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "REF_TXN_CODE",
    },
    ref_txn_docno: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "REF_TXN_DOCNO",
    },
    ref_txn_slno: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "REF_TXN_SLNO",
    },
    so_txn_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "SO_TXN_CODE",
    },
    delivery_term: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "DELIVERY_TERM",
    },
    salesman_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "SALESMAN_CODE",
    },
    recollected_flag: {
      type: DataTypes.STRING(1),
      allowNull: false,
      field: "RECOLLECTED_FLAG",
    },
    recollected_dt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "RECOLLECTED_DT",
    },
    recollected_remarks: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "RECOLLECTED_REMARKS",
    },
    stuff_start: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "STUFF_START",
    },
    stuff_end: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "STUFF_END",
    },
    pick_start: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "PICK_START",
    },
    pick_end: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "PICK_END",
    },
    pack_start: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "PACK_START",
    },
    pack_end: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "PACK_END",
    },
    load_start: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "LOAD_START",
    },
    load_end: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "LOAD_END",
    },
    allow_doc_gen: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ALLOW_DOC_GEN",
    },
    pre_so: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "PRE_SO",
    },
    assigned_pack_user: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ASSIGNED_PACK_USER",
    },
    order_location: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "ORDER_LOCATION",
    },
    route_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "ROUTE_CODE",
    },
    manifest_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "MANIFEST_NO",
    },
    vehicle_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "VEHICLE_NO",
    },
    order_load_seq_nr: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "ORDER_LOAD_SEQ_NR",
    },
  },
  {
    sequelize, // Your Sequelize instance
    modelName: "OrderEntry",
    tableName: "VW_TO_ORDER",
    timestamps: false,
    underscored: true, // Optional: automatically adds underscored field mappings
  }
);

OrderEntry.removeAttribute("serial_no");
export default OrderEntry;
