// Import required Sequelize ORM components
import { Model, DataTypes } from "sequelize";
// Import database connection instance
import { sequelize } from "../../../../database/connection";
// Import application constants
import constants from "../../../../helpers/constants";
// Import interface for VwAcMaster view attributes
import { IVwAcMasterAttributes } from "../../../../interfaces/finance/accounts/masters/actree_finance.interface";

// Define VwAcMaster model class for the account master view
class VwAcMaster extends Model<IVwAcMasterAttributes> {}

// Initialize the VwAcMaster model with its attributes and options
VwAcMaster.init(
  {
    // Company identifier with max length of 7 characters
    company_code: {
      type: DataTypes.STRING(7),
    },
    // Unique account code with max length of 13 characters
    ac_code: {
      type: DataTypes.STRING(13),
    },
    // Account name/description with max length of 100 characters
    ac_name: {
      type: DataTypes.STRING(100),
    },

    // Level 4 (most detailed) account code
    l4_code: {
      type: DataTypes.STRING(8),
    },
    // Description for level 4 account
    l4_description: {
      type: DataTypes.STRING(70),
    },
    // Level 3 account code (parent of level 4)
    l3_code: {
      type: DataTypes.STRING(3),
    },
    // Description for level 3 account
    l3_description: {
      type: DataTypes.STRING(50),
    },
    // Level 2 account code (parent of level 3)
    l2_code: {
      type: DataTypes.STRING(2),
    },
    // Description for level 2 account
    l2_description: {
      type: DataTypes.STRING(50),
    },
    // Profit & Loss / Balance Sheet classification code
    PL_BL_CODE: {
      type: DataTypes.STRING(10),
    },
    // User who created the record
    created_by: {
      type: DataTypes.STRING(20),
    },

    // Commented out sort order field
    // sort_order: {
    //   type: DataTypes.BIGINT(),
    // },
    
    // User who last updated the record
    updated_by: {
      type: DataTypes.STRING(50),
    },
  },
  {
    sequelize,              // Database connection instance
    modelName: "VwAcMaster", // Model name
    tableName: constants.TABLE.VW_AC_MASTER, // Database view name
    createdAt: "created_at", // Custom column name for creation timestamp
    updatedAt: "updated_At", // Custom column name for update timestamp
  }
);

// Remove default id attribute as this is a view
VwAcMaster.removeAttribute("id");
// Export the VwAcMaster model
export default VwAcMaster;
