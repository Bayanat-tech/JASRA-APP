// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import MSHRDIVISIONMasterModel from "./UsertoDivision_security.model";
// import MSCOMPANYUSERASSIGNEDModel from "./DivisionUserassign_security.model";
// // Define the interface for SecLoginAttributes
// interface SecLoginAttributes {
//   user_id: string;
//   username: string;
//   company_code: string;
// }

// // Define the interface for SecLoginCreationAttributes
// interface SecLoginCreationAttributes
//   extends Optional<SecLoginAttributes, "user_id"> {}

// class SecLoginModelUSERDIVISION
//   extends Model<SecLoginAttributes, SecLoginCreationAttributes>
//   implements SecLoginAttributes
// {
//   user_id!: string;
//   username!: string;
//   company_code!: string;

//   // Explicitly define the assignedProjects property
//   assigneddivisions!: MSHRDIVISIONMasterModel[];

//   static associate(models: any) {
//     SecLoginModelUSERDIVISION.belongsToMany(MSHRDIVISIONMasterModel, {
//       through: MSCOMPANYUSERASSIGNEDModel,
//       foreignKey: "user_id",
//       otherKey: "div_code",
//       as: "assigneddivisions",
//     });
//   }
// }

// // Initialize the model
// SecLoginModelUSERDIVISION.init(
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
//     modelName: "SecLoginModelUSERDIVISION",
//     tableName: constants.TABLE.SEC_LOGIN,
//     timestamps: false,
//   }
// );

// export default SecLoginModelUSERDIVISION;
