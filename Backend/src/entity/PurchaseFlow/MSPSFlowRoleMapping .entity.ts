import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("MS_PS_FLOW_ROLE_MAPPING")
export class MSPSFlowRoleMapping {
  @PrimaryColumn({ name: "FLOW_CODE", type: "varchar2", length: 5 })
  flow_code!: string;

  @PrimaryColumn({ name: "FLOW_LEVEL", type: "number" })
  flow_level!: number;

  @PrimaryColumn({ name: "FLOW_ROLE", type: "varchar2", length: 5 })
  flow_role!: string;

  @Column({ name: "CONDITION1", type: "number", precision: 10, scale: 2 })
  condition1!: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 10 })
  company_code!: string;

  @Column({ name: "USER_DT", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  user_dt!: Date;

  @Column({ name: "USER_ID", type: "varchar2", length: 15, nullable: true })
  user_id?: string;
}
