import { DataTypes, Model } from "sequelize";

import { ILocation } from "../../interfaces/wms/location_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
class Location extends Model<ILocation> {}

Location.init(
  {
    site_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    location_code: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    loc_desc: {
      type: DataTypes.STRING(40),
      allowNull: true,
      primaryKey: true,
    },
    loc_type: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    loc_stat: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    aisle: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    column_no: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    job_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    stk_stat: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    pref_prin: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    pref_prod: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    pref_group: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    pref_brand: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    put_seqno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pick_seqno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    push_level: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    max_qty: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: true,
    },
    uom: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    reorder_qty: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    prod_type: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    check_digit: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    assigned_prin_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    assigned_prodgroup: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    assigned_userid: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    location_code_002: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    volume_cbm: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    height_cm: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    breadth_cm: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    length_cm: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    blockcyc: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: "N",
    },
    trolley_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    bonded_area_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    location_reserved_for: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    // updated_at: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    //   defaultValue: DataTypes.NOW,
    // },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // created_at: {
    //   type: DataTypes.DATE,
    //   allowNull: true,
    //   defaultValue: DataTypes.NOW,
    // },
  },

  {
    sequelize,
    modelName: "Location",
    tableName: constants.TABLE.MS_LOCATION,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Location;
