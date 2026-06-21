// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import MSPSProjectMasterModel from "./projectmaster_security.model";
// import MSProjectUserAssignModel from "./projectuserassign_security.model";

// // Define the interface for SecLoginAttributes
// interface SecLoginAttributes {
//   user_id: string;
//   username: string;
//   company_code: string;
// }

// // Define the interface for SecLoginCreationAttributes
// interface SecLoginCreationAttributes
//   extends Optional<SecLoginAttributes, "user_id"> {}

// class SecLoginModel
//   extends Model<SecLoginAttributes, SecLoginCreationAttributes>
//   implements SecLoginAttributes
// {
//   user_id!: string;
//   username!: string;
//   company_code!: string;

//   // Explicitly define the assignedProjects property
//   assignedProjects!: MSPSProjectMasterModel[];

//   static associate(models: any) {
//     SecLoginModel.belongsToMany(MSPSProjectMasterModel, {
//       through: MSProjectUserAssignModel,
//       foreignKey: "user_id",
//       otherKey: "project_code",
//       as: "assignedProjects",
//     });
//   }
// }

// // Initialize the model
// SecLoginModel.init(
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

// export default SecLoginModel;
