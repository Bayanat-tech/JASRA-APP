// import { DataTypes, Model } from "sequelize";
// import { IFlowmaster } from "../../interfaces/Security/Security.interfae";
// import { sequelize } from "../../database/connection";
// import constants from "../../helpers/constants";

// class Flowmaster extends Model<IFlowmaster> {}

// Flowmaster.init(
//   {
//     flow_code: {
//       type: DataTypes.STRING(5),
//       allowNull: true,
//     },
//     flow_description: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//       primaryKey: true,
//     },
//     company_code: {
//       type: DataTypes.STRING(5),
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
//     modelName: "Flowmaster",
//     tableName: constants.TABLE.MS_PS_FLOW_MASTER,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// export default Flowmaster;
