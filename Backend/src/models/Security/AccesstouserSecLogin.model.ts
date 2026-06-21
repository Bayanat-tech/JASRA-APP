// import { DataTypes, Model } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import { IUSERSECLOGIN } from "../../interfaces/Security/Accesstouser.interface";

// class accessusersecmaster extends Model<IUSERSECLOGIN> {}

// accessusersecmaster.init(
//   {
//     loginid: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       primaryKey: true,
//     },
//     username: {
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
//     modelName: "accessusersecmaster",
//     tableName: constants.TABLE.SEC_LOGIN,
//     timestamps: false,
//   }
// );

// export default accessusersecmaster;
