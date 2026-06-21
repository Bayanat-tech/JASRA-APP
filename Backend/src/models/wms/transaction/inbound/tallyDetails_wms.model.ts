import { DataTypes, Model } from "sequelize";
//import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { ITallyDetailsWms } from "../../../../interfaces/wms/transaction/inbound/tallyDetails_wms.interface";

class TallyDetailsInboundWms extends Model<ITallyDetailsWms> {}

TallyDetailsInboundWms.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    container_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prod_attrib_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    pda_quantity: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    location_code: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    size_value: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    seq_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    user_dt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    packdet_no: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: true,
    },
    carton_no: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    batch_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prod_exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    pallet_id: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    selected: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    allocated: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    pda_qty_puom: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: true,
    },
    pda_puom: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    pda_qty_luom: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: true,
    },
    pda_luom: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    lot_no: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prod_mfg_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    site_ind: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    tally_processed: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
      allowNull: true,
    },
    putaway_processed: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
      allowNull: true,
    },
    target_location: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    receipt_type: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    vessel_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    mfg_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    uppp: {
      type: DataTypes.DECIMAL(18, 0),
      allowNull: true,
    },
    origin_country: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    batch_id: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    carton_tally: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    putaway_pda_processed: {
      type: DataTypes.STRING(1),
      defaultValue: "N",
      allowNull: true,
    },
    prod_exp_char: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    prod_mfg_char: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    po_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    gross_weight: {
      type: DataTypes.DECIMAL(22, 0),
      allowNull: true,
    },
    volume: {
      type: DataTypes.DECIMAL(22, 0),
      allowNull: true,
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shelf_life_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    prod_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    updated_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    /* qty_string: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },*/
  },
  {
    sequelize,
    modelName: "TallyDetails",
    tableName: "TI_TALLY_DETAIL",
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_code", "prin_code", "job_no", "packdet_no"],
      },
    ],
  }
);
TallyDetailsInboundWms.removeAttribute("id");

export default TallyDetailsInboundWms;
