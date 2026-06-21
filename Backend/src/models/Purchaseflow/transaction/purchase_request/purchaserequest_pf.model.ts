// PurchaseRequestHeader.ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../../database/connection";
import { DECIMAL } from "sequelize";

export interface IPurchaseRequestHeader {
  request_number: string;
  document_number: string;
  request_date: Date;
  description: string;
  supplier?: string;
  remarks?: string;
  amount?: number;
  department_code?: string;
  flow_code?: string;
  role_name?: string;
  project_name?: string;
  create_user?: string;
  create_date?: Date;
  last_action?: string;
  last_updated?: Date;
  project_code: string;
  wo_number?: string;
  type_of_contract?: string;
  type_of_material_supply?: string;
  capex_opex_non_opex?: string;
  contract_soft_hard?: string;
  amc_service_status?: string;
  need_by_date?: Date;
  facility_mgr_name?: string;
  material_mechanical?: string;
  material_electrical?: string;
  material_plumbing?: string;
  material_tools?: string;
  material_civil?: string;
  material_ac?: string;
  material_cleaning?: string;
  material_other?: string;
  services_temp_staff?: string;
  services_rentals?: string;
  services_subcon_conslt?: string;
  services_other?: string;
  other_stationery?: string;
  other_it?: string;
  other_new_uniform_ppe?: string;
  other_rplcmt_uniform?: string;
  other_other?: string;
  good_material_request?: string;
  service_request?: string;
  document_type?: string;
}

export interface IPurchaseRequestDetail {
  // request_number?: string; // Add on 0511/2024
  item_code: string; // Unique identifier for the item
  item_rate: number; // Rate for the item
  amount: number; // Quantity of the item being requested
  service_rm_flag: string;
  item_p_qty: number;
  p_uom: string;
  item_l_qty: number;
  allocated_approved_quantity: number;
  l_uom: string;
  cost_code: string;
  upp: number;
  item_desp: string;
  item_group_code: string;
  appr_upp: string;
  appr_item_l_qty: number;
  appr_item_p_qty: number;
  currency_rate: number;
  updated_at: Date;
  updated_by: string;
  curr_code: string;
  lcurr_amt: number;
  selected_item: string;
  last_action: string;
  history_serial: number;
  curr_name: string;
  item_srno: number;
  supplier_part_code: string;
  rate_method: string;
  supplier: string;
  select_item: string;
  discount_amount: number;
  final_rate: number;
  item_cancel: string;
  mail_attach: string;
  cash_ind: string;
  addl_item_desc: string;
  flow_level_running: number;
  pr_amount: number;
  po_amount: number;
  month_budget: number;
  ac_name: string;

  cost_name: string;
}

export type TPrrequest = {
  header: IPurchaseRequestHeader;
  details: IPurchaseRequestDetail[];
};

class PurchaseRequestDetail extends Model {
  declare item_code: string; // Unique identifier for the item
  declare item_rate: number; // Rate for the item
  declare amount: number; // Quantity of the item being requested
  declare service_rm_flag: string; // Indicates if the item is a service or raw material (e.g., 'Service', 'RM')
  declare item_p_qty: number | null; // Processed quantity (null if not applicable)
  declare p_uom: string; // Unit of measure for processed quantity
  declare item_l_qty: number; // Local quantity
  declare allocated_approved_quantity: number; // Approved allocated quantity
  declare l_uom: string; // Unit of measure for local quantity
  declare cost_code: string; // Cost accounting code
  declare upp: number; // Unit price per item
  declare item_desp: string; // Description of the item
  declare item_group_code: string; // Group code for the item
  declare appr_upp: string; // Approved unit price per item
  declare appr_item_l_qty: number; // Approved local quantity
  declare appr_item_p_qty: number; // Approved processed quantity
  declare currency_rate: number; // Exchange rate for currency
  declare updated_at: Date; // Last updated timestamp
  declare updated_by: string; // User who last updated the record
  declare curr_code: string; // Currency code
  declare lcurr_amt: number; // Local currency amount
  declare selected_item?: string; // Flag or code indicating a selected item
  declare last_action?: string; // Last action performed on the item
  declare history_serial: number; // Serial number in the history
  declare curr_name: string; // Currency name
  declare item_srno: number; // Serial number for the item
  declare supplier_part_code: string; // Supplier's part code for the item
  declare rate_method: string; // Method used to determine the rate
  declare supplier: string; // Supplier name
  declare select_item?: string; // Another selection flag (confirm purpose and necessity)
  declare discount_amount: number; // Discount applied to the item
  declare final_rate: number; // Final rate after discount
  declare item_cancel: string; // Cancellation status for the item
  declare mail_attach?: string; // Email attachment status or path
  declare cash_ind: string; // Cash indicator
  declare addl_item_desc?: string; // Additional description for the item
  declare flow_level_running: number; // Current flow level in the process
  declare pr_amount: number; // Purchase request amount
  declare po_amount: number; // Purchase order amount
  declare month_budget: number; // Monthly budget
  declare supp_name: string; // Account name
}

PurchaseRequestDetail.init(
  {
    request_number: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    item_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    item_rate: {
      type: DECIMAL(10, 2),
      allowNull: true,
    },
    amount: {
      type: DECIMAL(10, 2),
      allowNull: true,
    },
    cost_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    service_rm_flag: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    item_p_qty: {
      type: DECIMAL(10, 2),
      allowNull: true,
    },
    p_uom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    item_l_qty: {
      type: DECIMAL(10, 2),
      allowNull: true,
    },
    allocated_approved_quantity: {
      type: DECIMAL(10, 2),
      allowNull: true,
    },
    l_uom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    addl_item_desc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    upp: {
      type: DataTypes.NUMBER,
    },
    last_action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    supplier: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "PurchaseRequestDetails",
    tableName: "PURCHASE_REQUEST_DETAILS",
    timestamps: false,
    freezeTableName: true,
  }
);

class PurchaseRequestHeader extends Model {
  declare request_number: string;
  declare document_number: string;
  declare request_date: Date;
  declare description: string;
  declare project_code: string;
  declare type_of_contract: string;
  declare type_of_material_supply: string;
  declare material_mechanical: string;
  declare material_electrical: string;
  declare material_plumbing: string;
  declare material_tools: string;
  declare material_civil: string;
  declare material_ac: string;
  declare material_cleaning: string;
  declare material_other: string;
  declare services_temp_staff: string;
  declare services_rentals: string;
  declare services_subcon_conslt: string;
  declare services_other: string;
  declare other_stationery: string;
  declare other_it: string;
  declare other_new_uniform_ppe: string;
  declare other_rplcmt_uniform: string;
  declare other_other: string;
  declare good_material_request: string;
  declare service_request: string;
  declare company_code: string;
  declare created_by: string;
  declare wo_number: string;
  declare remarks: string;
  declare contract_soft_hard: string;
  declare amc_service_status: string;
  //added on 05/02/2025
  declare document_type: string;
  declare amount: number;
  declare flow_code: string;
  declare project_name: string;
  declare flow_type: string;
  declare last_updated: Date;
}

PurchaseRequestHeader.init(
  {
    request_number: {
      type: DataTypes.STRING(25),
      primaryKey: true,
      allowNull: false,
    },
    document_number: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        is: /^[A-Z0-9/]+$/i, // Regex to allow letters, numbers, and `/`
      },
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    amount: {
      type: DECIMAL(10, 2),
      allowNull: true,
    },
    project_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    flow_code: {
      type: DataTypes.STRING(15),
      primaryKey: true,
      allowNull: false,
    },

    document_type: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "PurchaseRequestHeader",
    tableName: "GT_MY_TASK",
    timestamps: false,
    freezeTableName: true,
  }
);

class POHeader extends Model {
  declare companyCode: string;
  declare doc_no: string;
  declare doc_date: Date;
  declare ref_doc_no: string;
  declare supplier: string;
  declare request_number: string;
  declare div_code: string;
  declare po_confirm: string;
  declare po_cancel: string;
  declare cancel_type: string;
  declare supp_name: string;
  declare dlvr_term: string;
  declare supp_addr1: string;
  declare supp_addr3: string;
  declare supp_addr4: string;
  declare supp_telno1: string;
  declare supp_faxno1: string;
  declare supp_email1: string;
  declare project_code: string;
  declare project_name: string;
  declare wo_number: string;
  declare remarks: string;
  declare payment_terms: string;
  declare last_action: string;
}

POHeader.init(
  {
    request_number: {
      type: DataTypes.STRING(25),
      primaryKey: true,
      allowNull: false,
    },
    document_number: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        is: /^[A-Z0-9/]+$/i, // Regex to allow letters, numbers, and `/`
      },
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "POHeader",
    tableName: "VW_TOTAL_CLOSE_DOCUMENT",
    timestamps: false,
    freezeTableName: true,
  }
);

/*
PurchaseRequestHeader.init(
  {
    request_number: {
      type: DataTypes.STRING(25),
      primaryKey: true,
      allowNull: false,
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    type_of_contract: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    type_of_material_supply: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    wo_number: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    project_code: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    contract_soft_hard: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    amc_service_status: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    material_mechanical: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_electrical: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_plumbing: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_tools: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_civil: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_ac: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_cleaning: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    material_other: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    services_temp_staff: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    services_rentals: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    services_subcon_conslt: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    services_other: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    other_stationery: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    other_it: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    other_new_uniform_ppe: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    other_rplcmt_uniform: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    other_other: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    good_material_request: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    service_request: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    last_action: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PurchaseRequestHeader",
    tableName: "PURCHASE_REQUEST_HEADER",
    timestamps: false,
    freezeTableName: true,
  }
);*/

// Define associations
//PurchaseRequestHeader.hasMany(PurchaseRequestDetail, { foreignKey: "request_number" });
//PurchaseRequestDetail.belongsTo(PurchaseRequestHeader, { foreignKey: "request_number" });

export { PurchaseRequestHeader, PurchaseRequestDetail, POHeader };

export interface IPOHeader {
  companyCode: string;
  doc_no: string;
  doc_date: Date;
  ref_doc_no: string;
  supplier: string;
  request_number: string;
  div_code: string;
  po_confirm: string;
  po_cancel: string;
  cancel_type: string;
  supp_name: string;
  dlvr_term: string;
  supp_addr1: string;
  supp_addr3: string;
  supp_addr4: string;
  supp_telno1: string;
  supp_faxno1: string;
  supp_email1: string;
  project_code: string;
  project_name: string;
  wo_number: string;
  remarks: string;
  payment_terms: string;
  last_action: string;
}
