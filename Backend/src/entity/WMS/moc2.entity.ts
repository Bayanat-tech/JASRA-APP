import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_ACTIVITY_UOC)
export class ActivityUOC {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 3 })
  company_code!: string;

  @PrimaryColumn({ name: "CHARGE_CODE", type: "varchar2", length: 4 })
  charge_code!: string;

  @PrimaryColumn({ name: "CHARGE_TYPE", type: "varchar2", length: 4 })
  charge_type!: string;

  @PrimaryColumn({ name: "ACTIVITY_GROUP_CODE", type: "varchar2", length: 5 })
  activity_group_code!: string;

  @Column({ name: "DESCRIPTION", type: "varchar2", length: 30, nullable: true })
  description?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 20, nullable: true })
  updated_by?: string;

  @Column({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  created_at?: Date;

  @Column({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at?: Date;
}
