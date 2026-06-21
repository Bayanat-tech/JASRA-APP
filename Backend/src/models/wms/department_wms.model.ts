import { DataTypes, Model } from "sequelize";
import { IDepartment } from "../../interfaces/wms/department_wms.interface";
import { sequelize } from "../../database/connection";
import constants from "../../helpers/constants";

class Department extends Model<IDepartment> {}

Department.init(
  {
    dept_code: {
      type: DataTypes.STRING(10), // Corrected length to 10
      allowNull: false,
      primaryKey: true,
    },
    dept_name: {
      type: DataTypes.STRING(25), // Corrected length to 25
      allowNull: false,
    },
    inv_flag: {
      type: DataTypes.STRING(2), // Corrected length to 2
      allowNull: true,
    },
    company_code: {
      type: DataTypes.STRING(5), // Corrected length to 5
      allowNull: false,
    },
    operation_type: {
      type: DataTypes.STRING(1), // Corrected length to 1
      allowNull: true,
    },
    div_code: {
      type: DataTypes.STRING(5), // Corrected to STRING(5)
      allowNull: false,
    },
    ac_div_code: {
      type: DataTypes.STRING(5), // Corrected to STRING(5)
      allowNull: true,
    },
    dept_email: {
      type: DataTypes.STRING(250), // Corrected length to 250
      allowNull: true,
    },
    dn_email: {
      type: DataTypes.STRING(250), // Corrected length to 250
      allowNull: true,
    },
    grn_email: {
      type: DataTypes.STRING(250), // Corrected length to 250
      allowNull: true,
    },
    inv_gen: {
      type: DataTypes.CHAR(1), // Corrected to CHAR(1)
      allowNull: true,
    },
    inb_oub_related: {
      // Corrected column name to INB_OUB_RELATED
      type: DataTypes.CHAR(1), // Corrected to CHAR(1)
      allowNull: true,
    },
    inv_prefix: {
      type: DataTypes.STRING(2), // Corrected length to 2
      allowNull: true,
    },
    jobno_seq: {
      type: DataTypes.NUMBER, // Corrected to INTEGER
      allowNull: true,
    },
    invno_seq: {
      type: DataTypes.NUMBER, // Corrected to INTEGER
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(50), // Corrected length to 50
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20), // Corrected length to 20
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Department",
    tableName: constants.TABLE.MS_DEPARTMENT,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Department;
