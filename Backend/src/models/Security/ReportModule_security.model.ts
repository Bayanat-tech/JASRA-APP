// import { DataTypes, Model } from "sequelize";
// import { IReportmaster } from "../../interfaces/Security/Security.interfae";

// import constants from "../../helpers/constants";
// import { sequelize } from "../../database/connection";

// class reportmaster extends Model<IReportmaster> {}

// reportmaster.init(
//   {
//     report_no: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//       primaryKey: true,
//     },
//     reportid: {
//       type: DataTypes.STRING(200),
//       allowNull: false,
//     },
//     reportname: {
//       type: DataTypes.STRING(200),
//       allowNull: false,
//     },
//     module: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(50),
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
//     modelName: "reportmaster",
//     tableName: constants.TABLE.MG_REPORT,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default reportmaster;
