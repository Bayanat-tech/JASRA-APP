import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.SMS_REASON)
export class ReasonMaster {
  @PrimaryGeneratedColumn({ name: "ID" })
  id!: number;

  @Column({ name: "REASON_CODE", type: "varchar2", length: 50, nullable: true })
  reason_code!: string;

  @Column({ name: "LOST_REASON", type: "varchar2", length: 50 })
  lost_reason!: string;

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
