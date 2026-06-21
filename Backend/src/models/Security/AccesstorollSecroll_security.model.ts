// import { DataTypes, Model } from "sequelize";
// import { ISECROLEMASTER } from "../../interfaces/Security/Accesstoroll.interface";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class secrolemaster extends Model<ISECROLEMASTER> {}

// secrolemaster.init(
//   {
//     role_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       primaryKey: true,
//     },
//     role_desc: {
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
//     modelName: "secrolemaster",
//     tableName: constants.TABLE.SEC_ROLE_MASTER,
//     timestamps: false,
//   }
// );

// export default secrolemaster;
