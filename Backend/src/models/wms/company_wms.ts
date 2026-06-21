// import { DataTypes, Model } from "sequelize";
// import { ICompany } from "../../interfaces/wms/company_wms";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class Company extends Model<ICompany> {}

// Company.init(
//   {
//     // company code
//     company_code: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     // company name
//     company_name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     // address 1
//     address1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // address 2
//     address2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // address 3
//     address3: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // city
//     city: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // country
//     country: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // bl section 1
//     bl_section_1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // bl section 2
//     bl_section_2: {
//       type: DataTypes.STRING(50),
//     },
//     // statement of accounts
//     stmt_of_accounts: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // application license 001
//     app_license_001: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // picking path
//     picking_path: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // mail server
//     mail_server: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // mail email
//     mail_email: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // mail password
//     mail_pwd: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // billing authorization password
//     bill_auth_pwd: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     // company logo
//     company_logo: {
//       type: DataTypes.STRING(225),
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: "Company",
//     tableName: constants.TABLE.MS_COMPANY,
//     timestamps: false,
//   }
// );

// Company.removeAttribute("id");

// export default Company;
