import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";

import { IPickwave } from "../../../../interfaces/wms/transaction/outbound/outboundJobWms.interface";
import constants from "../../../../helpers/constants";

class MsPickwave extends Model<IPickwave> {}

MsPickwave.init(
  {
    wave_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    wave_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    col_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    indicator: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    seq_order: {
      type: DataTypes.CHAR(2),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "MsPickwave",
    tableName: constants.TABLE.MS_PICKWAVE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

MsPickwave.removeAttribute("id");
export default MsPickwave;
