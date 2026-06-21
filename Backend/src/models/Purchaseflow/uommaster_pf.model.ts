import { DataTypes, Model } from "sequelize";
import { ICostmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IUommaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";

class Uommaster extends Model<IUommaster> {}

Uommaster.init(
  {
    uom_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    uom_name: {
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
    modelName: "Uommaster",
    tableName: constants.TABLE.MS_UOM,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Uommaster;
