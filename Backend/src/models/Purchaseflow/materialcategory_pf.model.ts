import { DataTypes, Model } from "sequelize";
import { IMaterialCateogrymaster} from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class MaterialCategoryMaster extends Model<IMaterialCateogrymaster> {}

MaterialCategoryMaster.init(
  {
    mater_category_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    mater_category_desp: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(10),
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
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "MaterialCategoryMaster",
    tableName: 'MS_PS_MATER_CATEGORY',
    createdAt: "created_at",
    updatedAt: "updated_at",
    timestamps: true, // Ensures Sequelize manages createdAt/updatedAt
  }
);

export default MaterialCategoryMaster;
