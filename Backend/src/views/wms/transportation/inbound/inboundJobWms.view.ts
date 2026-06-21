import { DataTypes, Model } from "sequelize";
import { IJobInbListingView } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";
import constants from "../../../../helpers/constants";
import { sequelize } from "../../../../database/connection";

class JobInbListingView extends Model<IJobInbListingView> {}

JobInbListingView.init(
  {
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    prin_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    job_class: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    job_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    order_type: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    confirm_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    doc_ref: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    canceled: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    cancel_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    invoiced: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    invoice_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    updated_by: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "JobInbListingView",
    tableName: constants.VIEW.VW_WM_JOB_INB_LISTING,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
JobInbListingView.removeAttribute("id");

export default JobInbListingView;
