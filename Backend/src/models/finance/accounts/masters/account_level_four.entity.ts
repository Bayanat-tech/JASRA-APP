import { Entity, Column, PrimaryColumn } from "typeorm";
import constants from "../../../../helpers/constants";


@Entity({ name: constants.TABLE.MS_AC_L4 })
export class AccountLevelFourEntity {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "L4_CODE", type: "varchar2", length: 8 })
  l4_code!: string;

  @Column({ name: "L4_DESCRIPTION", type: "varchar2", length: 70, nullable: true })
  l4_description!: string;

  @Column({ name: "L4_TYPE", type: "char", length: 1, nullable: true })
  l4_type!: string;

  @Column({ name: "L4_JOB", type: "char", length: 1, nullable: true })
  l4_job!: string;

  @Column({ name: "L4_DEPT", type: "char", length: 1, nullable: true })
  l4_dept!: string;

  @Column({ name: "L4_BILL", type: "char", length: 1, nullable: true })
  l4_bill!: string;

  @Column({ name: "L4_PL_CODE", type: "varchar2", length: 10, nullable: true })
  l4_pl_code!: string;

  @Column({ name: "L3_CODE", type: "varchar2", length: 3, nullable: true })
  l3_code!: string;

  @Column({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @Column({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
