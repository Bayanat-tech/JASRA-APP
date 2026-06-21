// import { DataTypes, Model } from "sequelize";
// import { IDivisionmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class Divisionmaster extends Model<IDivisionmaster> {}

// Divisionmaster.init(
//   {
//     div_code: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//       primaryKey: true,
//     },
//     div_name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//     },
//     updated_by: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     created_by: {
//       type: DataTypes.STRING(20),
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//   },

//   {
//     sequelize,
//     modelName: "Divisionmaster",
//     tableName: constants.TABLE.MS_HR_DIVISION,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default Divisionmaster;
