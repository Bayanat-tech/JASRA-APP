// import { DataTypes, Model } from "sequelize";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";
// import { IVessel } from "../../interfaces/wms/vessel_wms.interface";

// class vessel extends Model<IVessel> {}

// vessel.init(
//   {
//     company_code: {
//       type: DataTypes.STRING(7),
//       allowNull: false,
//     },
//     vessel_name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     contact_person: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//     },
//     vessel_code: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//       primaryKey: true,
//     },

//     line_code: {
//       type: DataTypes.STRING(5),
//       allowNull: true,
//     },
//     email: {
//       type: DataTypes.STRING(25),
//       allowNull: true,
//     },
//     address: {
//       type: DataTypes.STRING(200),
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: "vessel",
//     tableName: constants.TABLE.MS_VESSEL,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default vessel;
