// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import SecLoginModel from "./seclogin_screenacess.model";
// import MSProjectUserAssignModel from "./projectuserassign_security.model";
// import constants from "../../helpers/constants";

// interface MSPSProjectMasterAttributes {
//   project_code: string;
//   project_name: string;
//   company_code: string;
// }

// interface MSPSProjectMasterCreationAttributes
//   extends Optional<MSPSProjectMasterAttributes, "project_code"> {}

// // Define the model
// class MSPSProjectMasterModel
//   extends Model<
//     MSPSProjectMasterAttributes,
//     MSPSProjectMasterCreationAttributes
//   >
//   implements MSPSProjectMasterAttributes
// {
//   project_code!: string;
//   project_name!: string;
//   company_code!: string;

//   static associate(models: any) {
//     MSPSProjectMasterModel.belongsToMany(SecLoginModel, {
//       through: MSProjectUserAssignModel,
//       foreignKey: "project_code",
//       otherKey: "user_id",
//       as: "assignedUsers",
//     });
//   }
// }

// MSPSProjectMasterModel.init(
//   {
//     project_code: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       primaryKey: true,
//     },
//     project_name: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "MSPSProjectMaster",
//     tableName: constants.TABLE.MS_PS_PROJECT_MASTER,
//     timestamps: false,
//   }
// );

// export default MSPSProjectMasterModel;
