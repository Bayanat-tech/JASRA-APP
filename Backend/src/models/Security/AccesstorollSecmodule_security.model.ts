// import { DataTypes, Model, Optional } from "sequelize";
// //import { IACCESSSECMODULEDATA } from "../../interfaces/Security/Accesstoroll.interface";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import accesssecoperation from "./Accesstorollsecoperation_security.model"; // Import the related model

// interface IACCESSSECMODULEDATA {
//   serial_no: number;
//   app_code: string;
//   level3: string;
//   company_code: string;
// }
// interface accesssecmoduleCreationAttributes
//   extends Optional<IACCESSSECMODULEDATA, "serial_no"> {}

// class accesssecmoduledata
//   extends Model<IACCESSSECMODULEDATA, accesssecmoduleCreationAttributes>
//   implements IACCESSSECMODULEDATA
// {
//   serial_no!: number;
//   app_code!: string;
//   level3!: string;
//   company_code!: string;

//   // Explicitly define the assignedProjects property
//   assignoperation!: accesssecoperation[];

//   static associate(models: any) {
//     accesssecmoduledata.hasMany(accesssecoperation, {
//       foreignKey: "serial_no",
//       sourceKey: "serial_no",
//       as: "assignoperation",
//     });
//   }
// }

// accesssecmoduledata.init(
//   {
//     serial_no: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       primaryKey: true,
//     },
//     app_code: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//     },
//     level3: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "accesssecmoduledata",
//     tableName: constants.TABLE.SEC_MODULE_DATA,
//     timestamps: false,
//   }
// );

// export default accesssecmoduledata;
