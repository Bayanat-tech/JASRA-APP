import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_ACTIVITY_GROUP)
export class ActivityGroupMaster {

  @PrimaryColumn({ name: "ACTIVITY_GROUP_CODE", type: "varchar2", length: 5 })
  activity_group_code!: string;

  @Column({ name: "ACT_GROUP_NAME", type: "varchar2", length: 50, nullable: true })
  act_group_name?: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @Column({ name: "MANDATORY_FLAG", type: "varchar2", length: 1, default: () => "'N'" })
  mandatory_flag!: string;

  @Column({ name: "VALIDATE_FLAG", type: "varchar2", length: 1, default: () => "'N'" })
  validate_flag!: string;

  @Column({ name: "ACCOUNT_CODE", type: "varchar2", length: 50, nullable: true })
  account_code?: string;

  @Column({ name: "ACT_GROUP_TYPE", type: "varchar2", length: 2, nullable: true })
  act_group_type?: string;

  @Column({ name: "ALTERNATE_ACCODE", type: "varchar2", length: 100, nullable: true })
  alternate_accode?: string;

  @Column({ name: "EXP_ACCOUNT_CODE", type: "varchar2", length: 15, nullable: true })
  exp_account_code?: string;

  @Column({ name: "FREIGHT_FLAG", type: "varchar2", length: 1, default: () => "'Y'" })
  freight_flag!: string;

  @Column({ name: "RPT_GROUP_NAME", type: "varchar2", length: 20, nullable: true })
  rpt_group_name?: string;

  @Column({ name: "SW_FLAG", type: "varchar2", length: 1, nullable: true })
  sw_flag?: string;

  @Column({ name: "SORT_ORDER", type: "number", default: () => "0", nullable: true })
  sort_order?: number;

  @Column({ name: "COST_GROUP", type: "varchar2", length: 1, nullable: true })
  cost_group?: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @CreateDateColumn({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
