import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.SMS_COMPANY)
export class CompanyMaster {
  @PrimaryGeneratedColumn({ name: "ID" })
  id!: number;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 50 })
  company_code!: string;

  @Column({ name: "COMPANY_NAME", type: "varchar2", length: 200 })
  company_name!: string;

  @Column({ name: "ADDRESS", type: "varchar2", length: 80 })
  address!: string;

  @Column({ name: "CITY", type: "varchar2", length: 80 })
  city!: string;

  @Column({ name: "COUNTRY", type: "varchar2", length: 50 })
  country!: string;

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
