import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "TA_ADJHEADER" })
export class TaAdjHeader {
  
  @PrimaryColumn({ name: "ADJ_NO", type: "number" })
  ADJ_NO!: number;

  @Column({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  PRIN_CODE!: string;

  @Column({ name: "ADJ_CODE", type: "varchar2", length: 3, nullable: true })
  ADJ_CODE?: string;

  @Column({ name: "POSTED_IND", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  POSTED_IND?: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 200, nullable: true })
  REMARKS?: string;

  @Column({ name: "ADJ_DATE", type: "date", nullable: true })
  ADJ_DATE?: Date;

  @Column({ name: "CONFIRMED", type: "varchar2", length: 1, nullable: true, default: () => "'N'" })
  CONFIRMED?: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true, default: () => "USER" })
  USER_ID?: string;

  @Column({ name: "USER_DT", type: "date", nullable: true, default: () => "SYSDATE" })
  USER_DT?: Date;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  COMPANY_CODE!: string;

  @Column({ name: "CONFIRMED_DATE", type: "date", nullable: true })
  CONFIRMED_DATE?: Date;

  @Column({ name: "COUNT_NO_BAK", type: "float", nullable: true })
  COUNT_NO_BAK?: number;

  @Column({ name: "COUNT_NO", type: "varchar2", length: 10, nullable: true })
  COUNT_NO?: string;

  @Column({ name: "CANCELLED", type: "varchar2", length: 1, nullable: true })
  CANCELLED?: string;

  @Column({ name: "DATE_CANCELLED", type: "date", nullable: true })
  DATE_CANCELLED?: Date;
}
