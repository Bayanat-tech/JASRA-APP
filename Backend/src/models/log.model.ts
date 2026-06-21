// // Import required Sequelize ORM components and project interfaces
// import { DataTypes, Model } from "sequelize";
// import { LogDataInterface } from "../interfaces/common.interface";
// import constants from "../helpers/constants";
// import { sequelize } from "../database/connection";

// // Define Log model class extending Sequelize Model with LogDataInterface
// class Log extends Model<LogDataInterface> {}

// // Initialize the Log model with column definitions and configuration
// Log.init(
//   {
//     // Company identifier - Required field
//     company_code: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     // User login identifier - Required, max length 45 chars
//     loginid: {
//       type: DataTypes.STRING(45),
//       allowNull: false,
//     },
//     // System module name - Required, max length 45 chars
//     module: {
//       type: DataTypes.STRING(45),
//       allowNull: false,
//     },
//     // Log entry description - Required, max length 45 chars
//     description: {
//       type: DataTypes.STRING(45),
//       allowNull: false,
//     },
//     // Read status flag (Y/N) - Required, single character
//     read: {
//       type: DataTypes.STRING(1),
//       allowNull: false,
//     },
//     // Record creator - Required, max length 45 chars
//     created_by: {
//       type: DataTypes.STRING(45),
//       allowNull: false,
//     },
//     // Last update user - Required, max length 45 chars
//     updated_by: {
//       type: DataTypes.STRING(45),
//       allowNull: false,
//     },
//     // Creation timestamp
//     created_at: {
//       type: DataTypes.DATE,
//     },
//     // Last update timestamp
//     updated_at: {
//       type: DataTypes.DATE,
//     },
//   },
//   {
//     sequelize,              // Database connection instance
//     tableName: constants.TABLE.M_Notification_Logs, // Physical table name in database
//     createdAt: "created_at",  // Maps creation timestamp to created_at column
//     updatedAt: "updated_at",  // Maps update timestamp to updated_at column
//   }
// );

// // Remove auto-generated id column as it's not needed
// Log.removeAttribute("id");

// // Export the Log model for use in other parts of the application
// export default Log;

// /* Table Purpose:
// This model represents system notification logs, tracking various system events
// and user interactions. It maintains:
// - Company-specific logging
// - User activity tracking
// - Module-specific events
// - Read/unread status
// - Audit trail with timestamps
// */
