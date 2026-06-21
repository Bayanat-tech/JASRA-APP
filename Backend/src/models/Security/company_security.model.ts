// import { DataTypes, Model } from "sequelize";
// import { ICompanymaster } from "../../interfaces/Security/Security.interfae";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class company extends Model<ICompanymaster> {}

// company.init(
//   {
//     company_code: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//       primaryKey: true,
//     },
//     company_name: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },
//     address1: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },
//     address2: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },
//     address3: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },

//     city: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     country: {
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
//     modelName: "company",
//     tableName: constants.TABLE.MS_COMPANY,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default company;
