import { DataTypes, Model } from "sequelize";
import { IdropdownProjectmaster } from "../../interfaces/Purchaseflow/Purucahseflow.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class DropdownProjectmaster extends Model<IdropdownProjectmaster> {}

DropdownProjectmaster.init(
  {
    project_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    project_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    company_code: {
      type: DataTypes.STRING(10),
      primaryKey:true,
      allowNull: false,
    },
  },

  {
    sequelize,
    modelName: "dropdownProjectmaster",
    tableName: constants.TABLE.MS_PS_PROJECT_MASTER,
    timestamps: false, 
  }
);

export default DropdownProjectmaster;
