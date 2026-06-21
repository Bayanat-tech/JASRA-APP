import { DataTypes, Model } from "sequelize";
import { IItemtmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Itemmaster_pf extends Model<IItemtmaster> {}

Itemmaster_pf.init(
  {
    item_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    item_desp: {
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
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Itemmaster_pf",
    tableName: constants.VIEW.VW_MS_PS_ITEM_MASTER,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Itemmaster_pf;
