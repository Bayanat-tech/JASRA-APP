import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IPrincipalWms } from "../../interfaces/wms/principal_wms.interface";

class Principal extends Model<IPrincipalWms> {}

Principal.init(
  {
    company_code: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(15),
      allowNull: false,
      primaryKey: true,
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prin_addr1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_addr2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_addr3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_addr4: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_city: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    territory_code: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    tax_country_code: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    tax_country_sn: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    sector_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    prin_email1: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    prin_email2: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    prin_email3: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    prin_telno1: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_telno2: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_telno3: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_faxno1: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_faxno2: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_faxno3: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_ref1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prin_status: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    acc_email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    prin_dept_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    prin_acref: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    trn_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    trn_exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    prin_invdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    curr_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },

    prin_infze: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    credit_limit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    creditdays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creditdays_freight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prin_lic_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_lic_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    comm_reg_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    comm_reg_exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    prin_imp_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    parent_prin_code: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    pick_wave: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pick_wave_qty_sort: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    pick_wave_ign_min_exp: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    pref_site: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pref_loc_from: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pref_loc_to: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pref_aisle_from: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pref_aisle_to: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    pref_col_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pref_col_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pref_ht_from: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pref_ht_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prin_siteind: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    service_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    storage_type: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    default_foc: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    under_value: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    auto_insert_billactivity: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    prin_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    prin_pricechk: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    prin_landedpr: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    auto_job: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    validate_lotno: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    storage_productwise: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    validate_expdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    minperiod_exppick: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rcpt_exp_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    perpectual_confirm_allow: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    automate_activity: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    dir_shpmnt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Principal",
    tableName: constants.TABLE.MS_PRINCIPAL,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_code", "prin_code"],
      },
    ],
  }
);

export default Principal;
