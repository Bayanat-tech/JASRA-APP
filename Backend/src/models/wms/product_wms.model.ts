import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IProduct } from "../../interfaces/wms/gm_wms.interface";

class Product extends Model<IProduct> {}

Product.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    prod_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    prod_name: {
      type: DataTypes.STRING(255),
      // field: "PROD_NAME",
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    brand_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    group_code: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    packdesc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    p_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    length: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    breadth: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    height: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    volume: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    gross_wt: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    net_wt: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    foc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpu: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    harm_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imco_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kitting: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manu_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    base_price: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    flat_storage: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    site_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site_ind: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pack_key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prod_ti: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    prod_hi: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    chargetime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prod_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shelf_life: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    category_abc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reord_level: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    reord_qty: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    alt_prod_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pref_site: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pref_loc_from: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pref_loc_to: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pref_aisle_from: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pref_aisle_to: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pref_col_from: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    pref_col_to: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    pref_ht_from: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    pref_ht_to: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    uppp: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    chk_manucode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chk_lotno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chk_mfgexpdt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    puom_volume: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    puom_netwt: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    puom_grosswt: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    l_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    luppp: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    uom_count: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    prod_type: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    twoplus_uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    upp: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    wave_code: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    product_stage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    co_pack: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    variant_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cnt_origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    packing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    old_upp: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    avg_consumption: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    prod_image_path_web: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    minperiod_exppick: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    rcpt_exp_limit: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    qty_as_wt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hazmat_ind: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hazmat_class: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    food_ind: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pharma_ind: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    special_instructions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    strength: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pack_size: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    group_code_bk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    batch_type: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    sap_prod_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sap_prod_desc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    temp_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    edit_user: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wob: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    unified_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_season: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    generic_article: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prod_gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prod_color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prod_size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prnt_p_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: constants.TABLE.MS_PRODUCT,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Product;
