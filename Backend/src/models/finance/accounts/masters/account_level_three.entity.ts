import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../../../helpers/constants";

@Entity(constants.TABLE.MS_AC_L3)
export class AccountLevelThree {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "L3_CODE", type: "varchar2", length: 3 })
  l3_code!: string;

  @Column({ name: "L3_DESCRIPTION", type: "varchar2", length: 50 })
  l3_description!: string;

  @Column({ name: "L2_CODE", type: "varchar2", length: 2 })
  l2_code!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50 })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20 })
  created_by!: string;

  @CreateDateColumn({ 
    name: "CREATED_AT", 
    type: "timestamp", 
    default: () => "CURRENT_TIMESTAMP" 
  })
  created_at!: Date;

  @UpdateDateColumn({ 
    name: "UPDATED_AT", 
    type: "timestamp", 
    default: () => "CURRENT_TIMESTAMP" 
  })
  updated_at!: Date;
}
