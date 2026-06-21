import { DataTypes, Model } from "sequelize";
import constants from "../../../../helpers/constants";
import { sequelize } from "../../../../database/connection";
import { IOutboundJobView } from "../../../../interfaces/wms/transaction/outbound/outboundJobWms.interface";

class JobOubListingView extends Model<IOutboundJobView> {}

JobOubListingView.init(
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
  },
  {
    sequelize,
    modelName: "JobOubListingView",
    tableName: constants.VIEW.VW_WM_JOB_OUB_LISTING,
    createdAt: false,
    updatedAt: false,
  }
);
JobOubListingView.removeAttribute("id");

export default JobOubListingView;
