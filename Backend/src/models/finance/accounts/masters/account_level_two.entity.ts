import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../../../helpers/constants";

@Entity(constants.TABLE.MS_AC_L2)
export class AccountLevelTwo {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "L2_CODE", type: "varchar2", length: 2 })
  l2_code!: string;

  @Column({ name: "L2_DESCRIPTION", type: "varchar2", length: 50, nullable: true })
  l2_description!: string;

  @Column({ name: "L1_CODE", type: "varchar2", length: 2, nullable: true })
  l1_code!: string;

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
