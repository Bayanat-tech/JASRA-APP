import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../../../helpers/constants";

@Entity(constants.TABLE.MS_AC_PLSETUP)
export class AccountPlSetup {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "PL_CODE", type: "varchar2" })
  pl_code!: string;

  @Column({ name: "PL_NAME", type: "varchar2", length: 50 })
  pl_name!: string;

  @Column({ name: "PL_TYPE", type: "varchar2", length: 2 })
  pl_type!: string;

  @Column({ name: "H_CODE", type: "varchar2", length: 20 })
  h_code!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20 })
  created_by!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50 })
  updated_by!: string;

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
