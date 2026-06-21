import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_CURRENCY)

export class CurrencyMaster {
  
  @PrimaryColumn({ name: "CURR_CODE", type: "varchar2", length: 3 })
  curr_code!: string;
  
  @Column({ name: "CURR_NAME", type: "varchar2", length: 40 })
  curr_name!: string;
  
  @Column({ name: "EX_RATE", type: "number", precision: 15, scale: 5, nullable: true })
  ex_rate!: number;
  
  @Column({ name: "DIVISION", type: "varchar2", length: 40, nullable: true })
  division!: string;
  
  @Column({ name: "SUBDIVISION", type: "number" })
  subdivision!: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;
  
  @Column({ name: "CURR_SIGN", type: "varchar2", length: 5, nullable: true })
  curr_sign!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by!: string;

  @CreateDateColumn({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true
  })
  updated_at!: Date;
}
