import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.SMS_SALES_REQUEST)
export class SalesRequestMaster {
  @PrimaryGeneratedColumn({ name: "SR_NO" })
  sr_no!: number;

  @Column({ name: "SALES_NAME", type: "varchar2", length: 50 })
  sales_name!: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", length: 50 })
  company_name!: string;

  @Column({ name: "SERVICE_OFFERED", type: "varchar2", length: 200 })
  service_offered!: string;

  @Column({ name: "SEGMENT", type: "varchar2", length: 100 })
  segment!: string;

  @Column({ name: "CONTACT_NAME", type: "varchar2", length: 300 })
  contact_name!: string;

  @Column({ name: "CONTACT_NUMBER", type: "number", nullable: true })
  contact_number!: number;

  @Column({ name: "DEAL_DESC", type: "varchar2", length: 900 })
  deal_desc!: string;

  @Column({ name: "DEAL_REF", type: "varchar2", length: 200 })
  deal_ref!: string;

  @Column({ name: "DEAL_DATE", type: "timestamp" })
  deal_date!: Date;

  @Column({ name: "DEAL_SIZE", type: "varchar2", length: 100 })
  deal_size!: string;

  @Column({ name: "DEAL_PROBABILITY", type: "varchar2", length: 50 })
  deal_probability!: string;

  @Column({ name: "DEAL_STATUS", type: "varchar2", length: 50 })
  deal_status!: string;

  @Column({ name: "WEIGHTED_FORECAST", type: "varchar2", length: 20 })
  weighted_forecast!: string;

  @Column({ name: "LOST_REASON", type: "varchar2", length: 300 })
  lost_reason!: string;

  @Column({ name: "STATUS_UPDATE", type: "varchar2", length: 50 })
  status_update!: string;

  @Column({ name: "PROJECT_CLOSING_DATE", type: "timestamp" })
  project_closing_date!: Date;

  @Column({ name: "NEXT_ACTION", type: "varchar2", length: 100 })
  next_action!: string;

  @Column({ name: "NOTE", type: "varchar2", length: 300 })
  note!: string;

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
