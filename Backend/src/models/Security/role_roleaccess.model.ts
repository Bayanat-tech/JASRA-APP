// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import { IMsPsRole } from "../../interfaces/Security/Userrollacess.interface";
// import constants from "../../helpers/constants";
// import SecLogin from "./seclogin_roleaccess.model";
// import MsPsUserRoleMapping from "./userrolemapping_roleaccess";

// interface MSPSROLEAttributes {
//   user_role: string;
//   role_name: string;
//   company_code: string;
// }

// interface MSPSROLEAttributesCreation
//   extends Optional<MSPSROLEAttributes, "user_role"> {}

// // Define the model
// class MsRole
//   extends Model<MSPSROLEAttributes, MSPSROLEAttributesCreation>
//   implements MSPSROLEAttributes
// {
//   user_role!: string;
//   role_name!: string;
//   company_code!: string;

//   static associate(models: any) {
//     MsRole.belongsToMany(SecLogin, {
//       through: MsPsUserRoleMapping,
//       foreignKey: "user_role",
//       otherKey: "user_id",
//       as: "assignedUsers",
//     });
//   }
// }

// MsRole.init(
//   {
//     user_role: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       primaryKey: true,
//     },
//     role_name: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "MsRole",
//     tableName: constants.TABLE.MS_PS_ROLE,
//     timestamps: false,
//   }
// );

// export default MsRole;
