import { DataTypes, Model } from "sequelize";
import { IJobInboundWms } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";

import { sequelize } from "../../../../database/connection";

class createinboundjobWms extends Model<IJobInboundWms> {}

createinboundjobWms.init(
  {
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    job_class: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    job_type: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    job_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    div_code: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    dept_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    port_code: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    destination_port: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
    country_origin: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    country_destination: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    description1: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    eta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ata: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    schedule_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transport_mode: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // confirm_date: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    doc_ref: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prin_ref2: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    /* prin_name: {r
      type: DataTypes.STRING(80),
      allowNull: true,
    },*/
    canceled: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    // container_date: {
    //   type: DataTypes.DATEONLY,
    //   allowNull: false,
    // },
    // cancel_date: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
    invoiced: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    grn_no: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    // invoice_date: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
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
    modelName: "createinboundjobWms",
    tableName: "TI_JOB",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
createinboundjobWms.removeAttribute("id");

export default createinboundjobWms;
