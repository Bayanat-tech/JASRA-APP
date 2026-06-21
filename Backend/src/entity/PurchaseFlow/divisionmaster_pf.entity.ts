import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_HR_DIVISION)
export class DivisionMaster {
  @PrimaryColumn({ name: "DIV_CODE", type: "varchar2", length: 5 })
  div_code!: string;

  @Column({ name: "DIV_NAME", type: "varchar2", length: 50 })
  div_name!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 10 })
  company_code!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50 })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20 })
  created_by!: string;

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
