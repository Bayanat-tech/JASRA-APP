// import { DataTypes, Model } from "sequelize";
// import { sequelize } from "../../../../database/connection";
// import constants from "../../../../helpers/constants";
// import { IDepartmentjob } from "../../../../interfaces/wms/principal_wms.interface";

// class DDdepartmentjob extends Model<IDepartmentjob> {}

// DDdepartmentjob.init(
//   {
//     company_code: {
//       type: DataTypes.STRING(20),
//       primaryKey: true,
//       allowNull: false,
//     },
//     dept_code: {
//       type: DataTypes.STRING(5),
//       primaryKey: true,
//       allowNull: false,
//     },
//     dept_name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     modelName: "PrincipalWmsView",
//     tableName: constants.TABLE.MS_DEPARTMENT,
//     timestamps: false,
//   }
// );
// export default DDdepartmentjob;
