// import { DataTypes, Model, Optional } from "sequelize";
// import { sequelize } from "../../database/connection";
// import SecLoginModelUSERDIVISION from "./seclogin_usertodivision.model";
// import MSCOMPANYUSERASSIGNEDModel from "./DivisionUserassign_security.model";
// import constants from "../../helpers/constants";

// interface MSHRDIVISIONAttributes {
//   div_code: string;
//   div_name: string;
//   company_code: string;
// }

// interface MSHRDIVISIONMasterCreationAttributes
//   extends Optional<MSHRDIVISIONAttributes, "div_code"> {}

// // Define the model
// class MSHRDIVISIONMasterModel
//   extends Model<MSHRDIVISIONAttributes, MSHRDIVISIONMasterCreationAttributes>
//   implements MSHRDIVISIONAttributes
// {
//   div_code!: string;
//   div_name!: string;
//   company_code!: string;

//   static associate(models: any) {
//     MSHRDIVISIONMasterModel.belongsToMany(SecLoginModelUSERDIVISION, {
//       through: MSCOMPANYUSERASSIGNEDModel,
//       foreignKey: "div_code",
//       otherKey: "user_id",
//       as: "assignedUsers",
//     });
//   }
// }

// MSHRDIVISIONMasterModel.init(
//   {
//     div_code: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       primaryKey: true,
//     },
//     div_name: {
//       type: DataTypes.STRING(100),
//       allowNull: true,
//     },
//     company_code: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "IMSHRDIVISIONMasterModel",
//     tableName: constants.TABLE.MS_HR_DIVISION,
//     timestamps: false,
//   }
// );

// export default MSHRDIVISIONMasterModel;
