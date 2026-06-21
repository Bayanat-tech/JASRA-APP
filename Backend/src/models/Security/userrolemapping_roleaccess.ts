// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import { IMsPsUserRoleMapping } from "../../interfaces/Security/Userrollacess.interface";
// import constants from "../../helpers/constants";

// class MsPsUserRoleMapping extends Model<IMsPsUserRoleMapping> {}

// MsPsUserRoleMapping.init(
//   {
//     user_role: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//       primaryKey: true,
//     },
//     company_code: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//     },
//     user_id: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     user_Code: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     user_dt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     user_name: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: "MsPsUserRoleMapping",
//     tableName: constants.TABLE.MS_PS_USER_ROLE_MAPPING,
//     timestamps: false,
//   }
// );

// export default MsPsUserRoleMapping;
