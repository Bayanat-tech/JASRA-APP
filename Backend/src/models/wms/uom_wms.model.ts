// import { DataTypes, Model } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import { IUom } from "../../interfaces/wms/gm_wms.interface";

// class Uom extends Model<IUom> {}

// Uom.init(
//   {
//     uom_code: {
//       type: DataTypes.STRING(7),
//       allowNull: false,
//       primaryKey: true,
//     },
//     uom_name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     company_code: {
//       type: DataTypes.STRING(20),
//       allowNull: false,
//     },
//     // updated_at: {
//     //   type: DataTypes.DATE,
//     //   allowNull: false,
//     // },
//     updated_by: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     created_by: {
//       type: DataTypes.STRING(20),
//       allowNull: false,
//     },
//     // created_at: {
//     //   type: DataTypes.DATE,
//     //   allowNull: false,
//     // },
//   },
//   {
//     sequelize,
//     modelName: "Uom",
//     tableName: constants.TABLE.MS_UOM,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default Uom;
