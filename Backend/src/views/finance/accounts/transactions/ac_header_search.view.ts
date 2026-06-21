import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IVW_AC_HEADER_SEARCH } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";

class VW_AC_HEADER_SEARCH extends Model<IVW_AC_HEADER_SEARCH> {}

VW_AC_HEADER_SEARCH.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    doc_type: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    doc_no: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    doc_date: {
      type: DataTypes.DATEONLY,

      allowNull: false,
    },
    ac_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    ref_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    create_user: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cheque_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    cheque_date: {
      type: DataTypes.DATEONLY,

      allowNull: true,
    },
    ac_payee: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    ref_doc_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    remittance: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(40, 8),
      allowNull: false,
    },
    canceled: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    div_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    fy_period: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    cheque_bank: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    create_dt: {
      type: DataTypes.DATEONLY,

      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "VW_AC_HEADER_SEARCH",
    tableName: constants.VIEW.VW_AC_HEADER_SEARCH,
    timestamps: false,
  }
);
VW_AC_HEADER_SEARCH.removeAttribute("id");
export default VW_AC_HEADER_SEARCH;
