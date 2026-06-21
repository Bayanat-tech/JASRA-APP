import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

export interface IddCurrency {
    curr_code: string; // Unique code, max length: 5
    curr_name: string; // Supplier name, max length: 50
    ex_rate: number;
    company_code: string; // Associated company code, max length: 10
    created_at?: Date; // Auto-generated creation timestamp
    created_by?: string; // User who created the record
    updated_at?: Date; // Auto-generated update timestamp
    updated_by?: string; // User who last updated the record
  }

// Sequelize model
class ddCurrency extends Model<IddCurrency> {}

ddCurrency.init(
  {
    company_code: {
      type: DataTypes.STRING(20), // Adjusted to match your comment
      allowNull: false,
    },
    curr_code: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    curr_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ex_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "ddCurrency",
    tableName: constants.TABLE.MS_CURRENCY,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ddCurrency;