import { DataTypes, Model } from "sequelize";

import { sequelize } from "../../../../database/connection";
import constants from "../../../../helpers/constants";
import { IJobInboundWms } from "../../../../interfaces/wms/transaction/inbound/inboundJobWms.interface";

class JobOutboundWms extends Model<IJobInboundWms> {}

JobOutboundWms.init(
  {
    company_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    prin_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      primaryKey: true,
    },
    job_no: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    job_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    job_type: {
      type: DataTypes.STRING(3),
    },
    job_class: {
      type: DataTypes.STRING(3),
    },
    dept_code: {
      type: DataTypes.STRING(3),
    },
    transport_mode: {
      type: DataTypes.STRING(1),
    },
    doc_ref: {
      type: DataTypes.STRING(20),
    },
    port_code: {
      type: DataTypes.STRING(8),
    },
    description1: {
      type: DataTypes.STRING(80),
    },
   /*  prin_name: {
      type: DataTypes.STRING(80),
    },*/
    description2: {
      type: DataTypes.STRING(80),
    },
    prin_ref1: {
      type: DataTypes.STRING(80),
    },
    prin_ref2: {
      type: DataTypes.STRING(80),
    },
    remarks: {
      type: DataTypes.STRING(250),
    },
    eta: {
      type: DataTypes.DATEONLY,
    },
    ata: {
      type: DataTypes.DATEONLY,
    },
    etd: {
      type: DataTypes.DATEONLY,
    },
    schedule_date: {
      type: DataTypes.DATEONLY,
    },
    payment_terms: {
      type: DataTypes.STRING(3),
    },
    curr_code: {
      type: DataTypes.STRING(3),
    },
    ex_rate: {
      type: DataTypes.DECIMAL(15, 5),
    },
    insurance_value: {
      type: DataTypes.FLOAT,
    },
    //  frieght_value: {
    //    type: DataTypes.DECIMAL,
    //  },
    cust_code: {
      type: DataTypes.STRING(20),
    },
    container_flag: {
      type: DataTypes.STRING(1),
    },
    container: {
      type: DataTypes.STRING(1),
    },
    // container_date: {
    //   type: DataTypes.DATEONLY,
    // },
    packdet: {
      type: DataTypes.STRING(1),
    },
    // packdet_date: {
    //   type: DataTypes.DATEONLY,
    // },
    allocated: {
      type: DataTypes.STRING(1),
    },
    // allocate_date: {
    //   type: DataTypes.DATEONLY,
    // },
    canceled: {
      type: DataTypes.STRING(1),
    },
    // cancel_date: {
    //   type: DataTypes.DATEONLY,
    // },
    confirmed: {
      type: DataTypes.STRING(1),
    },
    // confirm_date: {
    //   type: DataTypes.DATEONLY,
    // },
    grn_no: {
      type: DataTypes.INTEGER,
    },
    // grn_date: {
    //   type: DataTypes.DATEONLY,
    // },
    invoiced: {
      type: DataTypes.STRING(1),
    },
    // invoice_date: {
    //   type: DataTypes.DATEONLY,
    // },
    completed: {
      type: DataTypes.STRING(1),
    },
    // complete_date: {
    //   type: DataTypes.DATEONLY,
    // },
    exp_jobno: {
      type: DataTypes.STRING(10),
    },
    picked: {
      type: DataTypes.STRING(1),
    },
    // picked_date: {
    //   type: DataTypes.DATEONLY,
    // },
    // order_date: {
    //   type: DataTypes.DATEONLY,
    // },
    ordered: {
      type: DataTypes.STRING(1),
    },
    destination_port: {
      type: DataTypes.STRING(8),
    },
    vessel_name: {
      type: DataTypes.STRING(50),
    },
    voyage_no: {
      type: DataTypes.STRING(20),
    },
    payableat: {
      type: DataTypes.STRING(20),
    },
    place_receipt: {
      type: DataTypes.STRING(50),
    },
    place_delivery: {
      type: DataTypes.STRING(50),
    },
    no_of_original_bl: {
      type: DataTypes.TINYINT,
    },
    broker_code: {
      type: DataTypes.STRING(5),
    },
    quotation_ref: {
      type: DataTypes.STRING(15),
    },
    // be_no: {
    //   type: DataTypes.STRING(20),
    // },
    // be_date: {
    //   type: DataTypes.DATEONLY,
    // },
    // be_dep_amount: {
    //   type: DataTypes.DECIMAL(18, 6),
    // },
    // deposit_collected: {
    //   type: DataTypes.CHAR(1),
    // },
    // deposit_collected_dt: {
    //   type: DataTypes.DATEONLY,
    // },
    // deposit_collected_no: {
    //   type: DataTypes.INTEGER,
    // },
    // be_deposits: {
    //   type: DataTypes.CHAR(1),
    // },
    // ind_freight: {
    //   type: DataTypes.STRING(1),
    // },
    country_origin: {
      type: DataTypes.STRING(50),
    },
    country_destination: {
      type: DataTypes.STRING(50),
    },
    // task_order: {
    //   type: DataTypes.INTEGER,
    // },
    custom_recno: {
      type: DataTypes.STRING(20),
    },
    doc_ref2: {
      type: DataTypes.STRING(20),
    },
    hawb: {
      type: DataTypes.STRING(20),
    },
    reexport: {
      type: DataTypes.STRING(1),
    },
    ref_jobno: {
      type: DataTypes.STRING(200),
    },
    combined_jobno: {
      type: DataTypes.STRING(10),
    },
    carrier: {
      type: DataTypes.STRING(5),
    },
    job_lock: {
      type: DataTypes.STRING(1),
    },
    courier_code: {
      type: DataTypes.STRING(20),
    },
    delivery_point: {
      type: DataTypes.STRING(20),
    },
    // dep_batchdate: {
    //   type: DataTypes.DATEONLY,
    // },
    // dep_batchentry: {
    //   type: DataTypes.DECIMAL(22, 18),
    // },
    // dep_permit_no: {
    //   type: DataTypes.STRING(20),
    // },
    // dep_remarks: {
    //   type: DataTypes.STRING(1000),
    // },
    // dep_remit_no: {
    //   type: DataTypes.STRING(20),
    // },
    // doc_deposit_amt: {
    //   type: DataTypes.DECIMAL(22, 18),
    // },
    // doc_deposit_currency: {
    //   type: DataTypes.STRING(5),
    // },
    // doc_deposit_date: {
    //   type: DataTypes.DATEONLY,
    // },
    // doc_deposit_received: {
    //   type: DataTypes.DECIMAL(22, 18),
    // },
    // doc_depositd: {
    //   type: DataTypes.STRING(1),
    // },
    // doc_ref_date: {
    //   type: DataTypes.DATEONLY,
    // },
    // exitbill1: {
    //   type: DataTypes.STRING(25),
    // },
    // exitbill2: {
    //   type: DataTypes.STRING(25),
    // },
    // job_integration_class: {
    //   type: DataTypes.STRING(20),
    // },
    // tot_import_value: {
    //   type: DataTypes.DECIMAL(22, 18),
    // },
    // ref_customs: {
    //   type: DataTypes.STRING(30),
    // },
    // ref_customs_date: {
    //   type: DataTypes.DATEONLY,
    // },
    // driver_ref: {
    //   type: DataTypes.STRING(40),
    // },
    // driver_remarks: {
    //   type: DataTypes.STRING(250),
    // },
    div_code: {
      type: DataTypes.STRING(5),
    },
    salesman_code: {
      type: DataTypes.STRING(10),
    },
    transit_time: {
      type: DataTypes.STRING(60),
    },
    delivery_remarks: {
      type: DataTypes.STRING(250),
    },
    cargo_received: {
      type: DataTypes.STRING(1),
    },
    delivered_by: {
      type: DataTypes.STRING(50),
    },
    canceled_by: {
      type: DataTypes.STRING(25),
    },
    cancel_remarks: {
      type: DataTypes.STRING(250),
    },
    send_mail: {
      type: DataTypes.STRING(1),
    },
    backlog_mail: {
      type: DataTypes.STRING(1),
    },
    dplan_flag: {
      type: DataTypes.STRING(1),
    },
    trans_batch_id: {
      type: DataTypes.STRING(20),
    },
    send_mail_dn: {
      type: DataTypes.STRING(1),
    },
    kpi_inc: {
      type: DataTypes.STRING(1),
    },
    kpi_exc_remark: {
      type: DataTypes.STRING(100),
    },
    job_category: {
      type: DataTypes.STRING(200),
    },
    edit_user: {
      type: DataTypes.STRING(10),
    },
    tx_cat_code: {
      type: DataTypes.STRING(5),
    },
    bcf_code: {
      type: DataTypes.STRING(10),
    },
    created_by: {
      type: DataTypes.STRING(20),
    },
    updated_by: {
      type: DataTypes.STRING(20),
    },
    confirm_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "JobOutboundWms",
    tableName: "VW_TI_JOB",
    timestamps: false,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

JobOutboundWms.removeAttribute("id");
export default JobOutboundWms;