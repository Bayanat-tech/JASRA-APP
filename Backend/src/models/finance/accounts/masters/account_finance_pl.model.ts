import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IAccountFinancePLSetup } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";
/**
 * Define the AccountPlSetup class, extending Sequelize's Model class with specific attributes
 * The AccountPlSetup model is used to store the Profit and Loss setup for a company
 * The model is associated with the Account model
 */
class AccountPlSetup extends Model<IAccountFinancePLSetup> {}

/**
 * Initialize the AccountPlSetup model with attributes and options
 */
AccountPlSetup.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true,
    },
    pl_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pl_name: {
      allowNull: false,
      type: DataTypes.STRING(50),
    },
    pl_type: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    h_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "AccountBlSetup",
    tableName: constants.TABLE.MS_AC_PLSETUP,
  }
);

/**
 * Export the AccountPlSetup model as the default export
 */
export default AccountPlSetup;

