// import { DataTypes, Model } from "sequelize";
// import { IRolemaster } from "../../interfaces/Security/Security.interfae";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class rolemaster extends Model<IRolemaster> {}

// rolemaster.init(
//   {
//     role_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     role_desc: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//       primaryKey: true,
//     },
//     remarks: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(10),
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
//     modelName: "Rolemaster",
//     tableName: constants.TABLE.SEC_ROLE_MASTER,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default rolemaster;
