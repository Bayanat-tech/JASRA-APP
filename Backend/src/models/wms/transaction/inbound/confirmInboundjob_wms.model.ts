// import { DataTypes, Model } from "sequelize";
// import oracledb, { Connection } from "oracledb";
// import { oracleDb } from "../../../../database/connection";
// import constants from "../../../../helpers/constants";
// import { IConfirmInboundjob } from "../../../../interfaces/wms/transaction/inbound/confirminboundJobWms.interface";

// class ConfirmInboundInboundWms extends Model<IConfirmInboundjob> {}

// ConfirmInboundInboundWms.init(
//   {
//     company_code: {
//       type: DataTypes.STRING(7),
//       allowNull: false,
//       primaryKey: true,
//     },
//     prin_code: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//       primaryKey: true,
//     },
//     job_no: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//       primaryKey: true,
//     },
//     txn_type: {
//       type: DataTypes.STRING(40),
//       allowNull: false,
//     },
//     txn_date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false,
//     },
//     key_number: {
//       type: DataTypes.STRING(40),
//       allowNull: false,
//     },
//     packdet_no: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       primaryKey: true,
//     },
//     site_code: {
//       type: DataTypes.STRING(40),
//       allowNull: false,
//     },
//     location_code: {
//       type: DataTypes.STRING(15),
//     },
//     prod_code: {
//       type: DataTypes.STRING(40),
//       allowNull: false,
//     },
//     qty_puom: {
//       type: DataTypes.DECIMAL(12, 1),
//       allowNull: false,
//     },
//     p_uom: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     qty_luom: {
//       type: DataTypes.DECIMAL(12, 1),
//       allowNull: false,
//     },
//     l_uom: {
//       type: DataTypes.STRING(5),
//       allowNull: false,
//     },
//     quantity: {
//       type: DataTypes.DECIMAL(12, 1),
//       allowNull: false,
//     },
//     qty_confirmed: {
//       type: DataTypes.STRING(20),
//     },
//     pqty_confirmed: {
//       type: DataTypes.DECIMAL(12, 1),
//       allowNull: false,
//     },
//     lqty_confirmed: {
//       type: DataTypes.DECIMAL(12, 1),
//       allowNull: false,
//     },
//     puom_confirmed: {
//       type: DataTypes.STRING(20),
//     },
//     luom_confirmed: {
//       type: DataTypes.STRING(20),
//     },
//     lot_no: {
//       type: DataTypes.STRING(20),
//     },
//     po_no: {
//       type: DataTypes.STRING(20),
//     },
//     bl_no: {
//       type: DataTypes.STRING(20),
//     },
//     mfg_date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false,
//     },
//     exp_date: {
//       type: DataTypes.DATEONLY,
//       allowNull: false,
//     },
//     vessel_name: {
//       type: DataTypes.STRING(20),
//     },
//     upp: {
//       type: DataTypes.STRING(20),
//     },
//     curr_code: {
//       type: DataTypes.STRING(3),
//     },
//     ex_rate: {
//       type: DataTypes.DECIMAL(15, 5),
//     },
//     doc_ref: {
//       type: DataTypes.STRING(20),
//     },
//     selected: {
//       type: DataTypes.STRING(1),
//     },
//     receipt_type: {
//       type: DataTypes.STRING(1),
//     },
//     allocated: {
//       type: DataTypes.STRING(1),
//     },
//     pallet_id: {
//       type: DataTypes.STRING(20),
//     },
//     pallet_serial_no: {
//       type: DataTypes.STRING(20),
//     },
//     user_id: {
//       type: DataTypes.STRING(10),
//     },
//     user_dt: {
//       type: DataTypes.DATEONLY,
//     },
//     uppp: {
//       type: DataTypes.INTEGER,
//     },
//     confirmed: {
//       type: DataTypes.STRING(1),
//     },
//     unit_price: {
//       type: DataTypes.DECIMAL(18, 6),
//     },
//     container_size: {
//       type: DataTypes.INTEGER,
//     },
//     cust_code: {
//       type: DataTypes.STRING(20),
//     },
//     moc1: {
//       type: DataTypes.STRING(2),
//     },
//     moc2: {
//       type: DataTypes.STRING(2),
//     },
//     prod_name: {
//       type: DataTypes.STRING(50),
//     },
//     origin_country: {
//       type: DataTypes.STRING(15),
//     },
//     shelf_life_days: {
//       type: DataTypes.INTEGER,
//     },
//     shelf_life_date: {
//       type: DataTypes.DATEONLY,
//     },
//     prod_attrib_code: {
//       type: DataTypes.STRING(50),
//     },
//     prod_grade2: {
//       type: DataTypes.STRING(20),
//     },
//     tx_identity_number: {
//       type: DataTypes.STRING(30),
//     },
//     supp_code: {
//       type: DataTypes.STRING(10),
//     },
//     pack_key: {
//       type: DataTypes.STRING(20),
//     },
//     order_no: {
//       type: DataTypes.STRING(20),
//     },
//     seal_no: {
//       type: DataTypes.STRING(20),
//     },
//     order_srno: {
//       type: DataTypes.STRING(20),
//     },
//     container_no: {
//       type: DataTypes.STRING(20),
//     },
//     confirm_date: {
//       type: DataTypes.DATEONLY,
//     },
//     manu_code: {
//       type: DataTypes.STRING(40),
//     },
//     qty_string: {
//       type: DataTypes.STRING(40),
//     },
//     qty_confirm_string: {
//       type: DataTypes.STRING(40),
//     },
//     identity_number: {
//       type: DataTypes.INTEGER,
//     },
//   },
//   {
//     sequelize,
//     modelName: "ConfirmInboundjob",
//     tableName: constants.VIEW.VW_WM_INB_TT_BATCH_DETS,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//     indexes: [
//       {
//         unique: true,
//         fields: ["company_code", "prin_code", "job_no", "packdet_no"],
//       },
//     ],
//   }
// );
// ConfirmInboundInboundWms.removeAttribute("id");

// export default ConfirmInboundInboundWms;
