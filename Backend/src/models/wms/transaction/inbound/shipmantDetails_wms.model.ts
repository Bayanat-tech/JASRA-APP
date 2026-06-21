import { DataTypes, Model } from "sequelize";
//import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import { IShipmentDetails } from "../../../../interfaces/wms/transaction/inbound/shipmentDetails_wms.interface";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";

class ShipmentDetailsInboundWms extends Model<IShipmentDetails> {}

ShipmentDetailsInboundWms.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    vessel_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    voyage_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    container_no: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    seal_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    container_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    container_type: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    bl_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    packdet_entered: {
      type: DataTypes.STRING(1),
      allowNull: true,
      //defaultValue: "N",
    },
    user_id: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    user_dt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    moc1: {
      type: DataTypes.STRING(3),
      allowNull: true,
      //defaultValue: "0",
    },
    moc2: {
      type: DataTypes.STRING(2),
      allowNull: true,
      //defaultValue: "0",
    },
    act_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    uoc: {
      type: DataTypes.STRING(1),
      allowNull: true,
      //defaultValue: "0",
    },
    volume: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    net_weight: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    assigned_pda_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    po_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sr_comp_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sr_cust_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    supp_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    assigned_tally_user: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    unstuff_start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    unstuff_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tally_start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tally_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    putaway_start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    putaway_end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    old_container_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    old_vessel_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    old_voyage_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sr_reason_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    promo_shift: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    hbl_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    asn_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    doc_ref_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    cust_decl_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    truck_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ShipmentDetails",
    tableName: constants.TABLE.TI_CONTAINER,
    createdAt: "created_at",
    updatedAt: "updated_at",
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ["company_code", "prin_code", "job_no"],
    //   },
    // ],
  }
);

ShipmentDetailsInboundWms.removeAttribute("id");

export default ShipmentDetailsInboundWms;
