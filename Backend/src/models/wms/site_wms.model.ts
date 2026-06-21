import { DataTypes, Model } from "sequelize";
import { ISite } from "../../interfaces/wms/site_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Site extends Model<ISite> {
  site_code: any;
}

Site.init(
  {
    site_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    site_ind: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    site_type: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    site_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    site_addr1: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    site_addr2: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    site_addr3: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    site_addr4: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tel_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    charge_ind: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    group_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    loc_type: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    site_class: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    graphical_object_plus: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    graphical_object_minus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    wh_code: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    picking_out: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    site_volume: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    assigned_pda_user: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    site_uom: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    inc_storage: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    div_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    site_rpt_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    report_flag: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Site",
    tableName: constants.TABLE.MS_SITE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Site;
