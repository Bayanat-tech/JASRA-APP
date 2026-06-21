import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.SMS_SEGMENT)
export class SegmentMaster {
  @PrimaryGeneratedColumn({ name: "ID" })
  id!: number;

  @Column({ name: "SEGMENT_CODE", type: "varchar2", length: 50, nullable: true })
  segment_code!: string;

  @Column({ name: "SEGMENT_NAME", type: "varchar2", length: 200 })
  segment_name!: string;

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
