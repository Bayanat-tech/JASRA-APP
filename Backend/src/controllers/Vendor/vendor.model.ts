// import { DataTypes, Model } from "sequelize";
// import { TVendor } from "./vendore.interface"
// import { sequelize } from "../../database/connection";

// class Vendor extends Model<TVendor> {}

// Vendor.init(
//   {
//     AC_CODE: {
//        type: DataTypes.STRING(3),
//       allowNull: true,
//     },
//     COMPANY_CODE: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//       primaryKey: true,
//     },
//    VENDOR_CODE: {
//   type: DataTypes.STRING(10),
//   allowNull: true, // let the trigger generate it
// },
//     CURR_CODE: {
//       type: DataTypes.STRING(3),
//       allowNull: true,
//     },
//      CR_NUMBER: {
//       type: DataTypes.STRING(30),
//       allowNull: true,
//     },

//     COUNTRY_CODE: {
//       type: DataTypes.STRING(5),
//       allowNull: true,
//     },
//     VENDOR_NAME: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_ADDR1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_ADDR2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_ADDR3: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_ADDR4: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_CITY: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_CONTACT1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_TELNO1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_FAXNO1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_EMAIL1: {
//       type: DataTypes.STRING(200),
//       allowNull: true,
//     },
//     VENDOR_CONTACT2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_TELNO2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_FAXNO2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_EMAIL2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_CONTACT3: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_TELNO3: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_FAXNO3: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_REF1: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_REF2: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     VENDOR_REF3: {
//       type: DataTypes.STRING(50),
//       allowNull: true,
//     },
//     SERVICE_DATE: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     SECLOGINID: {
//       type: DataTypes.STRING(20),
//       allowNull: true,
//     },
//   },
//   {
//     sequelize,
//     modelName: "Vendor",
//     tableName: "MS_VENDOR",
//     timestamps: false,
//   }
// );

// export default Vendor;
