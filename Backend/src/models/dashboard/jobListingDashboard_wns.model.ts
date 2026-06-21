import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../database/connection";
import { IJobListingDashboard } from "../../interfaces/dashboard/dashboard.iterface";
import constants from "../../helpers/constants";

class JobListingDashboard extends Model<IJobListingDashboard> {}

JobListingDashboard.init(
  {
    company_code: {
      type: DataTypes.STRING(10),
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
    job_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    job_type: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    dept_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    prin_group: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    job_class: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    confirm_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ind_freight: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dept_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    inv_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    inv_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    grn_no: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    grn_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dn_no: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    dn_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    act_bill_amt: {
      type: DataTypes.DECIMAL(40, 4),
      allowNull: false,
    },
    canceled: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    cancel_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    confirmed: {
      type: DataTypes.STRING(9),
      allowNull: false,
    },
    invoiced: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "JobListingDashboard",
    tableName: constants.VIEW.VW_JOB_STATUS_LISTING,
    timestamps: false,
  }
);
JobListingDashboard.removeAttribute("id");
export default JobListingDashboard;
