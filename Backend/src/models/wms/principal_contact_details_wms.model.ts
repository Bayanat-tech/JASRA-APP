import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";
import { IPrincipalContactDetlWMs } from "../../interfaces/wms/principal_wms.interface";

class PrincipalContactDetl extends Model<IPrincipalContactDetlWMs> {}

PrincipalContactDetl.init(
  {
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true,
    },
    prin_cont1: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont2: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont3: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_telno1: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_telno2: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_telno3: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_email1: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_email2: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_email3: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_faxno1: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_faxno2: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_faxno3: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    prin_cont_ref1: {
      type: DataTypes.STRING(40),
      allowNull: true,
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
    modelName: "PrincipalContactDetl",
    tableName: constants.TABLE.MS_PRINCIPAL_CONTACT_DETL,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default PrincipalContactDetl;
