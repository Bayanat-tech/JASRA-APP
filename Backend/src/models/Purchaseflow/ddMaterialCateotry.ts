// import { DataTypes, Model } from "sequelize";

// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// // Interface reflecting lowercase column names
// export interface IddMaterialCategory {
//   supp_mat_cat_code: string;
//   supp_mat_cat_desp: string;
//   company_code: string;
//   created_at?: Date;
//   created_by?: string;
//   updated_at?: Date;
//   updated_by?: string;
// }

// // Sequelize model definition
// class ddMaterialCateotry extends Model<IddMaterialCategory> {}

// ddMaterialCateotry.init(
//   {
//     supp_mat_cat_code: {
//       type: DataTypes.STRING(40),
//       allowNull: false,
//       primaryKey: true,
//     },
//     supp_mat_cat_desp: {
//       type: DataTypes.STRING(200),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(20),
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     created_by: {
//       type: DataTypes.STRING(20),
//       allowNull: true,
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     updated_by: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     tableName: "MS_PS_SUPPLIER_MAT_CATEGORY", // lowercase table name
//     timestamps: false,
//   }
// );

// export default ddMaterialCateotry;
