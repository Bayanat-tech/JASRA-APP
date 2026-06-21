// import { DataTypes, Model } from "sequelize";
// import { ISecmodule } from "../../interfaces/Security/Security.interfae";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class secmodule extends Model<ISecmodule> {}

// secmodule.init(
//   {
//     company_code: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },
//     app_code: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },
//     serial_no: {
//       type: DataTypes.NUMBER,
//       allowNull: true,
//     },
//     level1: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     level2: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     level3: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       primaryKey: true,
//     },
//     position: {
//       type: DataTypes.NUMBER,
//       allowNull: false,
//     },
//     url_path: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//      icon: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     updated_by: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     created_by: {
//       type: DataTypes.STRING(20),
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "secmodule",
//     tableName: constants.TABLE.SEC_MODULE_DATA,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default secmodule;
