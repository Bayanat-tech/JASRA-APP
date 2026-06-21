// import { DataTypes, Model } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import { IUSERSECROLEFUNCTIONACCESSUSER } from "../../interfaces/Security/Accesstouser.interface";

// class accessusersecroleaccess extends Model<IUSERSECROLEFUNCTIONACCESSUSER> {}

// accessusersecroleaccess.init(
//   {
//     loginid: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     serial_no_or_role_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       primaryKey: true,
//     },
//     snew: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     smodify: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     sdelete: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     ssave: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     ssearch: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     ssaveas: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     supload: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     sundo: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     sprint: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     sprintsetup: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     shelp: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "accessusersecroleaccess",
//     tableName: constants.TABLE.SEC_ROLE_FUNCTION_ACCESS_USER,
//     timestamps: false,
//   }
// );

// export default accessusersecroleaccess;
