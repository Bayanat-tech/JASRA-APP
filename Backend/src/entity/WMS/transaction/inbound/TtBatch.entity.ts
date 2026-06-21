import { Entity, PrimaryColumn, Column } from "typeorm";

/**
 * TT_BATCH Entity (Manual Putaway)
 * Table: TT_BATCH
 * Based on actual Oracle schema with correct column definitions
 * Primary Key: IDENTITY_NUMBER
 */
@Entity({ name: "TT_BATCH" })
export class TtBatch {
  
  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  COMPANY_CODE!: string;

  @Column({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  PRIN_CODE!: string;

  @Column({ name: "JOB_NO", type: "varchar2", length: 10 })
  JOB_NO!: string;

  @Column({ name: "TXN_TYPE", type: "varchar2", length: 3 })
  TXN_TYPE!: string;

  @Column({ name: "TXN_DATE", type: "date" })
  TXN_DATE!: Date;

  @Column({ name: "PACKDET_NO", type: "integer" })
  PACKDET_NO!: number;

  @Column({ name: "KEY_NUMBER", type: "varchar2", length: 15, nullable: true })
  KEY_NUMBER?: string;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40 })
  PROD_CODE!: string;

  @Column({ name: "SITE_CODE", type: "varchar2", length: 5 })
  SITE_CODE!: string;

  @Column({ name: "LOCATION_CODE", type: "varchar2", length: 15, nullable: true })
  LOCATION_CODE?: string;

  @Column({ name: "QUANTITY", type: "number", precision: 12, scale: 1 })
  QUANTITY!: number;

  @Column({ name: "QTY_PUOM", type: "number", precision: 12, scale: 1 })
  QTY_PUOM!: number;

  @Column({ name: "QTY_LUOM", type: "number", precision: 12, scale: 1 })
  QTY_LUOM!: number;

  @Column({ name: "P_UOM", type: "varchar2", length: 5 })
  P_UOM!: string;

  @Column({ name: "L_UOM", type: "varchar2", length: 5, nullable: true })
  L_UOM?: string;

  @Column({ name: "QTY_CONFIRMED", type: "number", precision: 12, scale: 1, nullable: true })
  QTY_CONFIRMED?: number;

  @Column({ name: "PQTY_CONFIRMED", type: "number", precision: 12, scale: 1, nullable: true })
  PQTY_CONFIRMED?: number;

  @Column({ name: "LQTY_CONFIRMED", type: "number", precision: 12, scale: 1, nullable: true })
  LQTY_CONFIRMED?: number;

  @Column({ name: "PUOM_CONFIRMED", type: "varchar2", length: 5, nullable: true })
  PUOM_CONFIRMED?: string;

  @Column({ name: "LUOM_CONFIRMED", type: "varchar2", length: 5, nullable: true })
  LUOM_CONFIRMED?: string;

  @Column({ name: "UPPP", type: "number", precision: 12, scale: 1, nullable: true })
  UPPP?: number;

  @Column({ name: "PACK_KEY", type: "varchar2", length: 40, nullable: true })
  PACK_KEY?: string;

  @Column({ name: "UPP", type: "number", precision: 12, scale: 1, nullable: true })
  UPP?: number;

  @Column({ name: "CONFIRM_DATE", type: "date", nullable: true })
  CONFIRM_DATE?: Date;

  @Column({ name: "CUST_CODE", type: "varchar2", length: 20, nullable: true })
  CUST_CODE?: string;

  @Column({ name: "ORDER_NO", type: "varchar2", length: 20, nullable: true })
  ORDER_NO?: string;

  @Column({ name: "ORDER_SRNO", type: "integer", nullable: true })
  ORDER_SRNO?: number;

  @Column({ name: "VESSEL_NAME", type: "varchar2", length: 20, nullable: true })
  VESSEL_NAME?: string;

  @Column({ name: "CONTAINER_NO", type: "varchar2", length: 20, nullable: true })
  CONTAINER_NO?: string;

  @Column({ name: "SEAL_NO", type: "varchar2", length: 20, nullable: true })
  SEAL_NO?: string;

  @Column({ name: "PO_NO", type: "varchar2", length: 20, nullable: true })
  PO_NO?: string;

  @Column({ name: "BL_NO", type: "varchar2", length: 20, nullable: true })
  BL_NO?: string;

  @Column({ name: "DOC_REF", type: "varchar2", length: 20, nullable: true })
  DOC_REF?: string;

  @Column({ name: "LOT_NO", type: "varchar2", length: 20, nullable: true })
  LOT_NO?: string;

  @Column({ name: "PALLET_ID", type: "varchar2", length: 20, nullable: true })
  PALLET_ID?: string;

  @Column({ name: "PALLET_SERIAL_NO", type: "varchar2", length: 20, nullable: true })
  PALLET_SERIAL_NO?: string;

  @Column({ name: "MANU_CODE", type: "varchar2", length: 10, nullable: true })
  MANU_CODE?: string;

  @Column({ name: "MFG_DATE", type: "date", nullable: true })
  MFG_DATE?: Date;

  @Column({ name: "EXP_DATE", type: "date", nullable: true })
  EXP_DATE?: Date;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  CURR_CODE?: string;

  @Column({ name: "EX_RATE", type: "number", precision: 15, scale: 5, nullable: true })
  EX_RATE?: number;

  @Column({ name: "UNIT_PRICE", type: "number", precision: 16, scale: 6, nullable: true })
  UNIT_PRICE?: number;

  @Column({ name: "SELECTED", type: "varchar2", length: 1, default: () => "'N'" })
  SELECTED?: string;

  @Column({ name: "ALLOCATED", type: "varchar2", length: 1, default: () => "'Y'" })
  ALLOCATED?: string;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, default: () => "'N'" })
  CONFIRMED?: string;

  @PrimaryColumn({ name: "IDENTITY_NUMBER", type: "number", precision: 15 })
  IDENTITY_NUMBER!: number;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true, default: () => "USER" })
  USER_ID?: string;

  @Column({ name: "USER_DT", type: "date", nullable: true, default: () => "SYSDATE" })
  USER_DT?: Date;

  @Column({ name: "APPLIED_KEYNO", type: "varchar2", length: 15, nullable: true })
  APPLIED_KEYNO?: string;

  @Column({ name: "RECEIPT_TYPE", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  RECEIPT_TYPE?: string;

  @Column({ name: "RECEIPT_DATE", type: "date", nullable: true })
  RECEIPT_DATE?: Date;

  @Column({ name: "CONTAINER_SIZE", type: "integer", nullable: true })
  CONTAINER_SIZE?: number;

  @Column({ name: "MOC1", type: "varchar2", length: 2, nullable: true })
  MOC1?: string;

  @Column({ name: "MOC2", type: "varchar2", length: 2, nullable: true })
  MOC2?: string;

  @Column({ name: "ORIGIN_COUNTRY", type: "varchar2", length: 5, nullable: true })
  ORIGIN_COUNTRY?: string;

  @Column({ name: "SHELF_LIFE_DAYS", type: "integer", nullable: true })
  SHELF_LIFE_DAYS?: number;

  @Column({ name: "SHELF_LIFE_DATE", type: "date", nullable: true })
  SHELF_LIFE_DATE?: Date;

  @Column({ name: "TASK_ORDER", type: "number", precision: 10, nullable: true })
  TASK_ORDER?: number;

  @Column({ name: "PROD_ATTRIB_CODE", type: "varchar2", length: 50, nullable: true })
  PROD_ATTRIB_CODE?: string;

  @Column({ name: "PROD_GRADE1", type: "varchar2", length: 20, nullable: true })
  PROD_GRADE1?: string;

  @Column({ name: "PROD_GRADE2", type: "varchar2", length: 20, nullable: true })
  PROD_GRADE2?: string;

  @Column({ name: "TX_IDENTITY_NUMBER", type: "varchar2", length: 30, nullable: true })
  TX_IDENTITY_NUMBER?: string;

  @Column({ name: "ASSIGNED_PDA_USER", type: "varchar2", length: 10, nullable: true })
  ASSIGNED_PDA_USER?: string;

  @Column({ name: "PDA_VERIFIED", type: "varchar2", length: 1, nullable: true })
  PDA_VERIFIED?: string;

  @Column({ name: "SUPP_CODE", type: "varchar2", length: 10, nullable: true })
  SUPP_CODE?: string;

  @Column({ name: "PUTAWAY_DT", type: "date", nullable: true })
  PUTAWAY_DT?: Date;

  @Column({ name: "MASTER_CTN", type: "number", precision: 18, nullable: true })
  MASTER_CTN?: number;

  @Column({ name: "LOOSE_CTN", type: "number", precision: 18, nullable: true })
  LOOSE_CTN?: number;

  @Column({ name: "HS_CODE", type: "varchar2", length: 20, nullable: true })
  HS_CODE?: string;

  @Column({ name: "NET_WT", type: "number", precision: 18, scale: 6, nullable: true })
  NET_WT?: number;

  @Column({ name: "NET_VOLUME", type: "number", precision: 18, scale: 6, nullable: true })
  NET_VOLUME?: number;

  @Column({ name: "LC_PO_VALUE", type: "number", precision: 18, scale: 6, nullable: true })
  LC_PO_VALUE?: number;

  @Column({ name: "GROSS_WT", type: "number", precision: 18, scale: 6, nullable: true })
  GROSS_WT?: number;

  @Column({ name: "DA_NO", type: "number", nullable: true })
  DA_NO?: number;

  @Column({ name: "BATCH_NO", type: "varchar2", length: 20, nullable: true })
  BATCH_NO?: string;

  @Column({ name: "EDIT_USER", type: "varchar2", length: 10, nullable: true })
  EDIT_USER?: string;

  @Column({ name: "CARTON_NO", type: "varchar2", length: 20, nullable: true })
  CARTON_NO?: string;

  @Column({ name: "SERIALIZE", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  SERIALIZE?: string;

  @Column({ name: "CREATED_AT", type: "date", nullable: true })
  CREATED_AT?: Date;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 100, nullable: true })
  CREATED_BY?: string;

  @Column({ name: "UPDATED_AT", type: "date", nullable: true })
  UPDATED_AT?: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 100, nullable: true })
  UPDATED_BY?: string;
}
