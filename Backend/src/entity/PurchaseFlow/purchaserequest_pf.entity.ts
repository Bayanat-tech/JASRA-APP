import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity("PURCHASE_REQUEST_DETAILS")
export class PurchaseRequestDetail {
  @PrimaryColumn({ name: "REQUEST_NUMBER", type: "varchar2", length: 25 })
  request_number!: string;

  @PrimaryColumn({ name: "ITEM_CODE", type: "varchar2", length: 255 })
  item_code!: string;

  @Column({ name: "ITEM_RATE", type: "number", precision: 10, scale: 2, nullable: true })
  item_rate!: number;

  @Column({ name: "AMOUNT", type: "number", precision: 10, scale: 2, nullable: true })
  amount!: number;

  @Column({ name: "COST_CODE", type: "varchar2", length: 255 })
  cost_code!: string;

  @Column({ name: "SERVICE_RM_FLAG", type: "varchar2", length: 255 })
  service_rm_flag!: string;

  @Column({ name: "ITEM_P_QTY", type: "number", precision: 10, scale: 2, nullable: true })
  item_p_qty!: number | null;

  @Column({ name: "P_UOM", type: "varchar2", length: 255 })
  p_uom!: string;

  @Column({ name: "ITEM_L_QTY", type: "number", precision: 10, scale: 2, nullable: true })
  item_l_qty!: number;

  @Column({ name: "ALLOCATED_APPROVED_QUANTITY", type: "number", precision: 10, scale: 2, nullable: true })
  allocated_approved_quantity!: number;

  @Column({ name: "L_UOM", type: "varchar2", length: 255 })
  l_uom!: string;

  @Column({ name: "ADDL_ITEM_DESC", type: "varchar2", length: 255, nullable: true })
  addl_item_desc?: string;

  @Column({ name: "UPP", type: "number", nullable: true })
  upp!: number;

  @Column({ name: "LAST_ACTION", type: "varchar2", length: 255, nullable: true })
  last_action?: string;

  @Column({ name: "SUPPLIER", type: "varchar2", length: 255, nullable: true })
  supplier!: string;

  @Column({ name: "UPDATED_AT", type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: true })
  updated_at?: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_AT", type: "timestamp", default: () => "CURRENT_TIMESTAMP", nullable: true })
  created_at?: Date;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  
}
