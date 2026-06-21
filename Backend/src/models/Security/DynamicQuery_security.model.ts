// import { DataTypes, Model } from "sequelize";
// import { IQuerymaster } from "../../interfaces/Security/Security.interfae";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class dynamicQuery extends Model<IQuerymaster> {}

// dynamicQuery.init(
//   {
//     SR_NO: {
//       type: DataTypes.INTEGER(),
//       allowNull: true,
//       primaryKey: true,
//     },
//     COMPANY_CODE: {
//       type: DataTypes.STRING(30),
//       allowNull: false
//     },
//     PARAMETER: {
//       type: DataTypes.STRING(500),
//       allowNull: false,
//     },
//     SQL_STRING: {
//       type: DataTypes.STRING(1000),
//       allowNull: false,
//     },
//     STRING1: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     STRING2: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     STRING3: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     STRING4: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     ORDER_BY: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     USTRING1: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     USTRING2: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     USTRING3: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     USTRING4: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//      USTRING5: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     USTRING6: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     updated_by: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     created_by: {
//       type: DataTypes.STRING(50),
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
//     modelName: "dynamicQuery",
//     tableName: constants.TABLE.TBL_SQL_STRING_INFO,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default dynamicQuery;
