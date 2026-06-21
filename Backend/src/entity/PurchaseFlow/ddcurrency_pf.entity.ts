import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_CURRENCY)
export class DdCurrency {
  @PrimaryColumn({ name: "CURR_CODE", type: "varchar2", length: 5 })
  curr_code!: string;

  @Column({ name: "CURR_NAME", type: "varchar2", length: 50 })
  curr_name!: string;

  @Column({ name: "EX_RATE", type: "float" })
  ex_rate!: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 50, nullable: true })
  created_by?: string;

  @Column({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  created_at?: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updated_at?: Date;
}
