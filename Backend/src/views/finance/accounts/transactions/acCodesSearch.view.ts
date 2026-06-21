import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IAcCodesSearch } from "../../../../interfaces/finance/accounts/transactions/chequePaymentTransaction.interface";

class AcCodesSearchView extends Model<IAcCodesSearch> {}

AcCodesSearchView.init(
  {
    company_code: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    ac_code: {
      type: DataTypes.STRING(13),
      allowNull: false,
    },
    ac_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    curr_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    l4_bill: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    exp_type_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    l4_job: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    l4_description: {
      type: DataTypes.STRING(70),
      allowNull: true,
    },
    l4_type: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    ac_status: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AcCodesSearchView",
    tableName: constants.VIEW.VW_AC_CODES_SEARCH,
    timestamps: false,
  }
);
AcCodesSearchView.removeAttribute("id");
export default AcCodesSearchView;
