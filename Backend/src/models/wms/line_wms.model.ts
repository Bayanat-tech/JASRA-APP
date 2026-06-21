import { DataTypes, Model } from "sequelize";
import { ILine } from "../../interfaces/wms/line_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class line extends Model<ILine> {}

line.init(
  {
    line_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    line_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "line",
    tableName: constants.TABLE.MS_LINE,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default line;
