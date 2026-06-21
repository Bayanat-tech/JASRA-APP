import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.SMS_UPLOADED_FILES)
export class SmsFiles {
  @PrimaryGeneratedColumn({ name: "SR_NO" })
  sr_no!: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;

  @Column({ name: "MODULE", type: "varchar2", length: 20 })
  module!: string;

  @Column({ name: "FILE_NAME", type: "varchar2", length: 300 })
  file_name!: string;

  @Column({ name: "ORG_FILE_NAME", type: "varchar2", length: 300 })
  org_file_name!: string;

  @Column({ name: "EXTENSION", type: "varchar2", length: 10 })
  extension!: string;

  @Column({ name: "AWS_FILE_LOCATION", type: "varchar2", length: 500 })
  aws_file_location!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 30 })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 30 })
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
