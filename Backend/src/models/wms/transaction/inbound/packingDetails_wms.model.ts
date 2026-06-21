import { DataTypes, Model } from "sequelize";
import { IPackingDetails } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";

class PackingDetailsInboundWms extends Model<IPackingDetails> {}

PackingDetailsInboundWms.init(
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
    packdet_no: {
      type: DataTypes.INTEGER,
      
      primaryKey: true,
    },
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    qty_puom: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
    },
    p_uom: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    qty_luom: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
    },
    l_uom: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 1),
      allowNull: false,
    },
    lot_no: {
      type: DataTypes.STRING(20),
    },
    po_no: {
      type: DataTypes.STRING(20),
    },
    bl_no: {
      type: DataTypes.STRING(20),
    },
    mfg_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    exp_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    vessel_name: {
      type: DataTypes.STRING(20),
    },
    voyage_no: {
      type: DataTypes.STRING(20),
    },
    container_no: {
      type: DataTypes.STRING(20),
    },
    invoice_value: {
      type: DataTypes.DECIMAL(18, 2),
    },
    curr_code: {
      type: DataTypes.STRING(3),
    },
    ex_rate: {
      type: DataTypes.DECIMAL(15, 5),
    },
    doc_ref: {
      type: DataTypes.STRING(20),
    },
    manu_code: {
      type: DataTypes.STRING(10),
    },
    from_site: {
      type: DataTypes.STRING(5),
    },
    to_site: {
      type: DataTypes.STRING(5),
    },
    from_aisle: {
      type: DataTypes.STRING(5),
    },
    to_aisle: {
      type: DataTypes.STRING(5),
    },
    from_column: {
      type: DataTypes.INTEGER,
    },
    to_column: {
      type: DataTypes.INTEGER,
    },
    from_height: {
      type: DataTypes.INTEGER,
    },
    to_height: {
      type: DataTypes.INTEGER,
    },
    selected: {
      type: DataTypes.STRING(1),
    },
    receipt_type: {
      type: DataTypes.STRING(1),
    },
    allocated: {
      type: DataTypes.STRING(1),
    },
    pallet_id: {
      type: DataTypes.STRING(20),
    },
    pallet_serial_no: {
      type: DataTypes.STRING(20),
    },
    mixed_putaway: {
      type: DataTypes.STRING(1),
    },
    user_id: {
      type: DataTypes.STRING(10),
    },
    user_dt: {
      type: DataTypes.DATEONLY,
    },
    location_from: {
      type: DataTypes.STRING(15),
    },
    location_to: {
      type: DataTypes.STRING(15),
    },
    uppp: {
      type: DataTypes.INTEGER,
    },
    confirmed: {
      type: DataTypes.STRING(1),
    },
    unit_price: {
      type: DataTypes.DECIMAL(18, 6),
    },
    apportionate_value: {
      type: DataTypes.DECIMAL(18, 6),
    },
    multi_series: {
      type: DataTypes.STRING(1),
    },
    clearance: {
      type: DataTypes.STRING(1),
    },
    cleared_date: {
      type: DataTypes.DATEONLY,
    },
    cleared_user: {
      type: DataTypes.STRING(10),
    },
    reject_reason: {
      type: DataTypes.STRING(200),
    },
    container_size: {
      type: DataTypes.INTEGER,
    },
    cust_code: {
      type: DataTypes.STRING(20),
    },
    moc1: {
      type: DataTypes.STRING(2),
    },
    moc2: {
      type: DataTypes.STRING(2),
    },
    simulate_flag: {
      type: DataTypes.CHAR(1),
    },
    length: {
      type: DataTypes.DECIMAL(22, 0),
    },
    breadth: {
      type: DataTypes.DECIMAL(22, 0),
    },
    height: {
      type: DataTypes.DECIMAL(22, 0),
    },
    gross_weight: {
      type: DataTypes.DECIMAL(22, 0),
    },
    new_product: {
      type: DataTypes.STRING(40),
    },
    prod_name: {
      type: DataTypes.STRING(50),
    },
    volume: {
      type: DataTypes.DECIMAL(22, 0),
    },
    new_weight: {
      type: DataTypes.DECIMAL(22, 0),
    },
    origin_country: {
      type: DataTypes.STRING(15),
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
    },
    shelf_life_date: {
      type: DataTypes.DATEONLY,
    },
    pda_qty1: {
      type: DataTypes.DECIMAL(12, 1),
    },
    pda_qty2: {
      type: DataTypes.DECIMAL(12, 1),
    },
    pda_quantity: {
      type: DataTypes.DECIMAL(12, 1),
    },
    qty1_arrived: {
      type: DataTypes.DECIMAL(12, 1),
    },
    qty2_arrived: {
      type: DataTypes.DECIMAL(12, 1),
    },
    quantity_arrived: {
      type: DataTypes.DECIMAL(12, 1),
    },
    prod_attrib_code: {
      type: DataTypes.STRING(50),
    },
    prod_grade1: {
      type: DataTypes.STRING(20),
    },
    prod_grade2: {
      type: DataTypes.STRING(20),
    },
    tx_identity_number: {
      type: DataTypes.STRING(30),
    },
    net_weight: {
      type: DataTypes.DECIMAL(22, 0),
    },
    supp_code: {
      type: DataTypes.STRING(10),
    },
    assigned_putaway_user: {
      type: DataTypes.STRING(10),
    },
    assigned_tally_user: {
      type: DataTypes.STRING(10),
    },
    prv_location_code: {
      type: DataTypes.STRING(15),
    },
    tally_dt: {
      type: DataTypes.DATEONLY,
    },
    be_doc_no: {
      type: DataTypes.STRING(20),
    },
    master_ctn: {
      type: DataTypes.DECIMAL(18, 0),
    },
    loose_ctn: {
      type: DataTypes.DECIMAL(18, 0),
    },
    net_price: {
      type: DataTypes.DECIMAL(18, 4),
    },
    supp_ex_rate: {
      type: DataTypes.DECIMAL(18, 6),
    },
    local_charges_value: {
      type: DataTypes.DECIMAL(18, 6),
    },
    po_ex_rate: {
      type: DataTypes.DECIMAL(18, 6),
    },
    lc_po_value: {
      type: DataTypes.DECIMAL(18, 6),
    },
    po_curr_code: {
      type: DataTypes.STRING(10),
    },
    po_value: {
      type: DataTypes.DECIMAL(18, 6),
    },
    net_volume: {
      type: DataTypes.DECIMAL(18, 6),
    },
    hs_code: {
      type: DataTypes.STRING(20),
    },
    gross_wt: {
      type: DataTypes.DECIMAL(18, 6),
    },
    confirm_user: {
      type: DataTypes.STRING(20),
    },
    confirm_dt: {
      type: DataTypes.DATEONLY,
    },
    batch_no: {
      type: DataTypes.STRING(20),
    },
    created_by: {
      type: DataTypes.STRING(20),
    },

    updated_by: {
      type: DataTypes.STRING(20),
    },
  },
  {
    sequelize,
    modelName: "PackingDetails",
    tableName: constants.TABLE.TI_PACKDET,
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
PackingDetailsInboundWms.removeAttribute("id");

export default PackingDetailsInboundWms;
