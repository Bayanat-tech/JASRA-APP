import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { IMS_AC_SETUP_DOC } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";
import constants from "../../../../helpers/constants";
import Account from "../masters/account_finance.model";
import Currency from "../../../wms/currency_wms.model";
import Accountsetup from "../../../wms/accountsetup_wms.model";
import Division from "../../../wms/division_wms.model";
/**
 * Model for Account Setup Document
 */
class AccountSetupDoc extends Model<IMS_AC_SETUP_DOC> {}

/**
 * Initialize the AccountSetupDoc model
 */
AccountSetupDoc.init(
  {
    /**
     * Company code
     */
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    /**
     * Document ID
     */
    doc_id: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    /**
     * Document short name
     */
    doc_shortname: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    /**
     * Document name
     */
    doc_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    /**
     * Document object
     */
    doc_object: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    /**
     * Sequence number
     */
    seq_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    /**
     * Default header account
     */
    default_h_ac: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    /**
     * Default detail account
     */
    default_d_ac: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    /**
     * Default sign
     */
    default_sign: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    /**
     * Sign editable
     */
    sign_editable: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    /**
     * Last document number
     */
    last_doc_no: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    /**
     * Prepared by
     */
    prepared: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    /**
     * Verified by
     */
    verified: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    /**
     * Approved by
     */
    approved: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    /**
     * Received by
     */
    received: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    /**
     * Back date
     */
    back_date: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    /**
     * Print on save
     */
    prin_on_save: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    /**
     * Default division code
     */
    default_div_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    /**
     * Transaction type
     */
    trans_type: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    /**
     * Document code
     */
    doc_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    /**
     * Document number prefix
     */
    docno_prefix: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    /**
     * Default header code company
     */
    default_h_code_co: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    /**
     * Updated by
     */
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    /**
     * Created by
     */
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    /**
     * Currency code
     */
    curr_code: {
      type: DataTypes.STRING(5),
    },
  },
  {
    sequelize,
    modelName: "AccountSetupDoc",
    tableName: constants.TABLE.MS_AC_SETUP_DOC,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

/**
 * Remove the id attribute from the model
 */
AccountSetupDoc.removeAttribute("id");

/**
 * Define the relationships between the models
 */
//---------relation----
AccountSetupDoc.belongsTo(Account, {
  foreignKey: "default_h_ac",
  targetKey: "ac_code",
});
AccountSetupDoc.belongsTo(Currency, {
  foreignKey: "curr_code",
  targetKey: "curr_code",
});
AccountSetupDoc.belongsTo(Accountsetup, {
  foreignKey: "company_code",
  targetKey: "company_code",
});
AccountSetupDoc.belongsTo(Division, {
  foreignKey: "default_div_code",
  targetKey: "div_code",
});

export default AccountSetupDoc;