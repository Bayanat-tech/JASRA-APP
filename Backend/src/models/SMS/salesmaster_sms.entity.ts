import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.SMS_SALES)
export class SalesMaster {
  @PrimaryGeneratedColumn({ name: "ID" })
  id!: number;

  @Column({ name: "SALES_CODE", type: "varchar2", length: 50, nullable: true })
  sales_code!: string;

  @Column({ name: "SALES_NAME", type: "varchar2", length: 200 })
  sales_name!: string;

  @Column({ name: "CONTACT_NO", type: "varchar2", length: 50 })
  contact_no!: string;

  @Column({ name: "EMAIL", type: "varchar2", length: 50 })
  email!: string;

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
