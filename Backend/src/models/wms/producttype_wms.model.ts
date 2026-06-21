import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
//import { ICountry } from "../../interfaces/wms/gm_wms.interface";
import { IProducttype } from "../../interfaces/wms/gm_wms.interface";

class Producttype extends Model<IProducttype> {}

Producttype.init(
  {
    company_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    prodtype_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    prodtype_desc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Producttype",
    tableName: constants.TABLE.MS_PRODTYPE,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["company_code", "prodtype_code"],
      },
    ],
  }
);
Producttype.removeAttribute("id");
export default Producttype;
