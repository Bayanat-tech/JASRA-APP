import { DataTypes, Model } from "sequelize";
import { IStorage } from "../../interfaces/wms/storage_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Storage extends Model<IStorage> {}

Storage.init(
  {
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    prod_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    site_ind: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    uom_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    curr_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    charge_time: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    foc: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    foc_start: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    foc_end: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    cpu: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    flat_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    free_days: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    amt_lumpsum: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    ind_active: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    terminate_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    perday_cap: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    edit_user: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    lmp_mode: {
      type: DataTypes.STRING(1),
      allowNull: true,
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
    modelName: "Storage",
    tableName: constants.TABLE.MS_STORAGE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Storage;
