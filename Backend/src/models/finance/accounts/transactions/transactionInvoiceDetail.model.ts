import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { ITrAcInvdetail } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import constants from "../../../../helpers/constants";
import Currency from "../../../wms/currency_wms.model";

class TransactionInvoiceDetail extends Model<ITrAcInvdetail> {}

TransactionInvoiceDetail.init(
  {
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "COMPANY_CODE", // Maps to actual column name in DB
      primaryKey: true,
      unique: true,
    },
    doc_type: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: "DOC_TYPE", // Maps to actual column name in DB
      primaryKey: true,
      unique: true,
    },
    doc_no: {
      type: DataTypes.DECIMAL(10, 0),
      allowNull: false,
      field: "DOC_NO", // Maps to actual column name in DB
      primaryKey: true,
      unique: true,
    },
    serial_no: {
      type: DataTypes.DECIMAL(6, 0),
      allowNull: false,
      field: "SERIAL_NO", // Maps to actual column name in DB
      primaryKey: true,
      unique: true,
    },
    dtl_sr_no: {
      type: DataTypes.DECIMAL(6, 0),
      allowNull: false,
      field: "DTL_SR_NO", // Maps to actual column name in DB
      primaryKey: true,
      unique: true,
    },
    doc_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "DOC_DATE", // Maps to actual column name in DB
    },
    ac_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "AC_CODE", // Maps to actual column name in DB
      primaryKey: true,
      unique: true,
    },
    inv_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: "INV_NO", // Maps to actual column name in DB
    },
    inv_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "INV_DATE", // Maps to actual column name in DB
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "DUE_DATE", // Maps to actual column name in DB
    },
    chq_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "CHQ_NO", // Maps to actual column name in DB
    },
    chq_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "CHQ_DATE", // Maps to actual column name in DB
    },
    chq_bank: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "CHQ_BANK", // Maps to actual column name in DB
    },
    amount: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      field: "AMOUNT", // Maps to actual column name in DB
    },
    lcur_amount: {
      type: DataTypes.DECIMAL(18, 8),
      allowNull: false,
      field: "LCUR_AMOUNT", // Maps to actual column name in DB
    },
    sign_ind: {
      type: DataTypes.DECIMAL(1, 0),
      allowNull: false,
      field: "SIGN_IND", // Maps to actual column name in DB
    },
    curr_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "CURR_CODE", // Maps to actual column name in DB
    },
    ex_rate: {
      type: DataTypes.DECIMAL(18, 12),
      allowNull: true,
      field: "EX_RATE", // Maps to actual column name in DB
    },
    ex_rate_origin: {
      type: DataTypes.DECIMAL(18, 12),
      allowNull: true,
      field: "EX_RATE_ORIGIN", // Maps to actual column name in DB
    },
    curr_code_origin: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "CURR_CODE_ORIGIN", // Maps to actual column name in DB
    },
    amount_origin: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      field: "AMOUNT_ORIGIN", // Maps to actual column name in DB
    },
    indicator_origin: {
      type: DataTypes.STRING(1),
      allowNull: true,
      field: "INDICATOR_ORIGIN", // Maps to actual column name in DB
    },
    div_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "DIV_CODE", // Maps to actual column name in DB
    },
    oracle_upload: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: "ORACLE_UPLOAD", // Maps to actual column name in DB
    },
    oracle_dt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "ORACLE_DT", // Maps to actual column name in DB
    },
    created_by: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "CREATED_BY", // Maps to actual column name in DB
    },
    updated_by: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "UPDATED_BY", // Maps to actual column name in DB
    },
  },
  {
    sequelize,
    modelName: "TransactionInvoiceDetail",
    tableName: constants.TABLE.TR_AC_INVDETAIL,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: [
          "company_code",
          "doc_no",
          "doc_type",
          "ac_code",
          "serial_no",
          "dtl_sr_no",
        ],
        name: "unique_invoice",
      },
    ],
  }
);
TransactionInvoiceDetail.belongsTo(Currency, {
  foreignKey: "curr_code",
  targetKey: "curr_code",
});
TransactionInvoiceDetail.removeAttribute("id");
export default TransactionInvoiceDetail;
