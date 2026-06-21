import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IGrnReport } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";

class GrnReport extends Model<IGrnReport> {}
GrnReport.init(
  {
    company_code: {
      type: DataTypes.STRING,
    },
    company_name: {
      type: DataTypes.STRING,
    },
    prin_code: {
      type: DataTypes.STRING,
    },
    prin_name: {
      type: DataTypes.STRING,
    },
    job_no: {
      type: DataTypes.STRING,
    },
    txn_date: {
      type: DataTypes.DATEONLY,
    },
    prod_code: {
      type: DataTypes.STRING,
    },
    prod_name: {
      type: DataTypes.STRING,
    },
    uppp: {
      type: DataTypes.FLOAT,
    },
    site_code: {
      type: DataTypes.STRING,
    },
    qtypuom: {
      type: DataTypes.FLOAT,
    },
    qtyluom: {
      type: DataTypes.FLOAT,
    },
    p_uom: {
      type: DataTypes.STRING,
    },
    l_uom: {
      type: DataTypes.STRING,
    },
    vessel_name: {
      type: DataTypes.STRING,
    },
    container_no: {
      type: DataTypes.STRING,
    },
    seal_no: {
      type: DataTypes.STRING,
    },
    po_no: {
      type: DataTypes.STRING,
    },
    doc_ref: {
      type: DataTypes.STRING,
    },
    lot_no: {
      type: DataTypes.STRING,
    },
    mfg_date: {
      type: DataTypes.DATEONLY,
    },
    exp_date: {
      type: DataTypes.DATEONLY,
    },
    grn_no: {
      type: DataTypes.INTEGER,
    },
    grn_date: {
      type: DataTypes.DATEONLY,
    },
    user_id: {
      type: DataTypes.STRING,
    },
    volume: {
      type: DataTypes.FLOAT,
    },
    netwt: {
      type: DataTypes.FLOAT,
    },
    receipt_date: {
      type: DataTypes.DATEONLY,
    },
    container_size: {
      type: DataTypes.INTEGER,
    },
    origin_country: {
      type: DataTypes.STRING,
    },
    site_ind: {
      type: DataTypes.STRING,
    },
    batch_no: {
      type: DataTypes.STRING,
    },
    grosswt: {
      type: DataTypes.FLOAT,
    },
    unstuff_date: {
      type: DataTypes.STRING,
    },
    job_class: {
      type: DataTypes.STRING,
    },
    s_no: {
      type: DataTypes.INTEGER,
    },
    rcpt_type: {
      type: DataTypes.STRING,
    },
    seal_no1: {
      type: DataTypes.STRING,
    },
    cnt_lotno: {
      type: DataTypes.INTEGER,
    },
    prin_ref2: {
      type: DataTypes.STRING,
    },
    group_name: {
      type: DataTypes.STRING,
    },
    qty: {
      type: DataTypes.FLOAT,
    },
    job_qtyexpected: {
      type: DataTypes.FLOAT,
    },
    job_no_of_cse: {
      type: DataTypes.INTEGER,
    },
    job_qtyluom_expected: {
      type: DataTypes.FLOAT,
    },
    job_qtypuom_expected: {
      type: DataTypes.FLOAT,
    },
    no_of_cse: {
      type: DataTypes.INTEGER,
    },
    qtypuom_expected: {
      type: DataTypes.FLOAT,
    },
    qtyluom_expected: {
      type: DataTypes.FLOAT,
    },
    qtyexpected: {
      type: DataTypes.FLOAT,
    },
    qty_rcvd: {
      type: DataTypes.FLOAT,
    },
    qtypuom_dam: {
      type: DataTypes.FLOAT,
    },
    qtyluom_dam: {
      type: DataTypes.FLOAT,
    },
    qty_dam: {
      type: DataTypes.FLOAT,
    },
  },
  {
    sequelize,
    modelName: "GrnReport",
    tableName: constants.VIEW.VW_WM_INB_GRN,
    timestamps: false,
  }
);
GrnReport.removeAttribute("id");
export default GrnReport;
