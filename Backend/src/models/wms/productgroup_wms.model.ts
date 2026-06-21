import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IGroup } from "../../interfaces/wms/gm_wms.interface";

class Group extends Model<IGroup> implements IGroup {
  public group_code!: string;
  public group_name!: string;
  public company_code?: string;
  public prin_code?: string;
  public created_at?: Date;
  public created_by?: string;
  public updated_at?: Date;
  public updated_by?: string;
}

Group.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    group_code: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      },
    group_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Group",
    tableName: constants.TABLE.MS_PRODGROUP,
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Group;
