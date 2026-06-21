import { DataTypes, Model } from "sequelize";
import { IMsPsCustomer } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class CustomerMaster extends Model<IMsPsCustomer> {}

CustomerMaster.init(
  {
    cust_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    cust_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cust_add1: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cust_add2: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cust_add3: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    email_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    company_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CustomerMaster",
    tableName: constants.TABLE.MS_PS_CUSTOMER,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default CustomerMaster;
