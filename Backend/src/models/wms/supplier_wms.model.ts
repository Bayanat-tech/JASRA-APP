import { DataTypes, Model } from "sequelize";
import { ISupplier } from "../../interfaces/wms/supplier_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Supplier extends Model<ISupplier> {}

Supplier.init(
  {
    company_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    supp_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    curr_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    supp_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_addr1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_addr2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_addr3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_addr4: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_contact1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_telno1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_faxno1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_email1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_contact2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_telno2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_faxno2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_email2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_contact3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_telno3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_faxno3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_ref1: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_ref2: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    supp_ref3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    service_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    supp_acref: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    supp_credit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    supp_stat: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    supp_imp_code: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    supp_lic_no: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    supp_lic_type: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    price_check: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    supp_email3: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    importer_code: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    old_supplier_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(20),
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
  },
  {
    sequelize,
    modelName: "Supplier",
    tableName: constants.TABLE.MS_SUPPLIER,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Supplier;
