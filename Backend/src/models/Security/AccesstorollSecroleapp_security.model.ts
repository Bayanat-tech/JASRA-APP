// import { DataTypes, Model } from "sequelize";
// import { ISECROLEAPPACCESS } from "../../interfaces/Security/Accesstoroll.interface";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class accessroleappaccess extends Model<ISECROLEAPPACCESS> {}

// accessroleappaccess.init(
//   {
//     role_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     serial_no: {
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
//     modelName: "accessroleappaccess",
//     tableName: constants.TABLE.SEC_ROLE_APP_ACCESS,
//     timestamps: false,
//   }
// );

// export default accessroleappaccess;
