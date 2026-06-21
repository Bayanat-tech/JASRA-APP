import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "TA_ADJDETAIL" })
export class TaAdjDetail {
  
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  COMPANY_CODE!: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  PRIN_CODE!: string;

  @PrimaryColumn({ name: "ADJ_NO", type: "float" })
  ADJ_NO!: number;

  @PrimaryColumn({ name: "ADJ_SERIALNO", type: "float" })
  ADJ_SERIALNO!: number;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40, nullable: true })
  PROD_CODE?: string;

  @Column({ name: "DOC_REF", type: "varchar2", length: 20, nullable: true })
  DOC_REF?: string;

  @Column({ name: "ADJ_TYPE", type: "varchar2", length: 1, nullable: true })
  ADJ_TYPE?: string;

  @Column({ name: "QTY_PUOM", type: "number", precision: 12, scale: 1, nullable: true })
  QTY_PUOM?: number;

  @Column({ name: "SITE_CODE", type: "varchar2", length: 5, nullable: true })
  SITE_CODE?: string;

  @Column({ name: "LOCATION_CODE", type: "varchar2", length: 15, nullable: true })
  LOCATION_CODE?: string;

  @Column({ name: "POSTED_IND", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  POSTED_IND?: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true, default: () => "USER" })
  USER_ID?: string;

  @Column({ name: "USER_DT", type: "date", nullable: true, default: () => "SYSDATE" })
  USER_DT?: Date;

  @Column({ name: "QTY_LUOM", type: "number", precision: 12, scale: 1, nullable: true })
  QTY_LUOM?: number;

  @Column({ name: "KEY_NUMBER", type: "varchar2", length: 15 })
  KEY_NUMBER!: string;

  @Column({ name: "LOT_NO", type: "varchar2", length: 20, nullable: true })
  LOT_NO?: string;

  @Column({ name: "QUANTITY", type: "number", precision: 12, scale: 1, nullable: true })
  QUANTITY?: number;

  @Column({ name: "P_UOM", type: "varchar2", length: 5, nullable: true })
  P_UOM?: string;

  @Column({ name: "L_UOM", type: "varchar2", length: 5, nullable: true })
  L_UOM?: string;

  @Column({ name: "JOB_NO", type: "varchar2", length: 10, nullable: true })
  JOB_NO?: string;

  @Column({ name: "SELECTED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  SELECTED?: string;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  CONFIRMED?: string;

  @Column({ name: "MANU_CODE", type: "varchar2", length: 10, nullable: true })
  MANU_CODE?: string;

  @Column({ name: "APP_KEYNUMBER", type: "varchar2", length: 15, nullable: true })
  APP_KEYNUMBER?: string;

  @Column({ name: "IDENTITY_NUMBER", type: "number", precision: 15 })
  IDENTITY_NUMBER!: number;

  @Column({ name: "COUNT_NO", type: "varchar2", length: 10, nullable: true })
  COUNT_NO?: string;

  @Column({ name: "COUNT_SERIAL_NO", type: "number", precision: 10, nullable: true })
  COUNT_SERIAL_NO?: number;

  @Column({ name: "EXP_DATE", type: "date", nullable: true })
  EXP_DATE?: Date;

  @Column({ name: "MFG_DATE", type: "date", nullable: true })
  MFG_DATE?: Date;

  @Column({ name: "BATCH_NO", type: "varchar2", length: 20, nullable: true })
  BATCH_NO?: string;

  @Column({ name: "PALLET_ID", type: "varchar2", length: 20, nullable: true })
  PALLET_ID?: string;

  @Column({ name: "CURR_STOCK", type: "number", nullable: true })
  CURR_STOCK?: number;
}
