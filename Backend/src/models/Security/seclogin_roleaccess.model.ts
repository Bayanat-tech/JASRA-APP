// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import MsRole from "./role_roleaccess.model";
// import MsPsUserRoleMapping from "./userrolemapping_roleaccess";
// //class SecLogin extends Model<ISecLogin> {}
// // Define the interface for SecLoginAttributes
// interface SecLoginAttributes {
//   user_id: string;
//   username: string;
//   company_code: string;
// }
// // Define the interface for SecLoginCreationAttributes
// interface SecLoginCreationAttributes
//   extends Optional<SecLoginAttributes, "user_id"> {}

// class SecLogin
//   extends Model<SecLoginAttributes, SecLoginCreationAttributes>
//   implements SecLoginAttributes
// {
//   user_id!: string;
//   username!: string;
//   company_code!: string;

//   // Explicitly define the assignedProjects property
//   assignedroles!: MsRole[];

//   static associate(models: any) {
//     SecLogin.belongsToMany(MsRole, {
//       through: MsPsUserRoleMapping,
//       foreignKey: "user_id",
//       otherKey: "user_role",
//       as: "assignedroll",
//     });
//   }
// }

// SecLogin.init(
//   {
//     user_id: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       primaryKey: true,
//     },
//     username: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(40),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "SecLogin",
//     tableName: constants.TABLE.SEC_LOGIN,
//     timestamps: false,
//   }
// );

// export default SecLogin;
