import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IPackingDetailsWmsView } from "../../../../interfaces/wms/transaction/inbound/packingDetails_wms.interface";
import Product from "../../../../models/wms/product_wms.model";

class PackingDetailsInboundWmsView extends Model<IPackingDetailsWmsView> {}

PackingDetailsInboundWmsView.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    packdet_no: {
      type: DataTypes.INTEGER,
      field: "PACKDET_NO",
      allowNull: false,
    },
    prod_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    prod_name: {
      type: DataTypes.STRING(250),
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
    qty_string: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    qty_luom: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    l_uom: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      field: "QUANTITY",

      allowNull: false,
    },
    container_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    allocated: {
      type: DataTypes.STRING(1),
    },
    clearance: {
      type: DataTypes.STRING(1),
      field: "CLEARANCE",
    },
    updated_by: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    po_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    uppp: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    MFG_DATE: {
      type: DataTypes.DATE,
    },
    EXP_DATE: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "PackingDetailsInboundWmsView",
    tableName: constants.VIEW.VW_WM_INB_PACKDET_DETS,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
PackingDetailsInboundWmsView.removeAttribute("id");
PackingDetailsInboundWmsView.belongsTo(Product, {
  foreignKey: {
    name: "prod_code",
    allowNull: false,
  },
});

export default PackingDetailsInboundWmsView;
