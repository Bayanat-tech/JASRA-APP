import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_PS_CUSTOMER)
export class CustomerMaster {
  @PrimaryColumn({ name: "CUST_CODE", type: "varchar2", length: 20 })
  cust_code!: string;

  @Column({ name: "CUST_NAME", type: "varchar2", length: 100 })
  cust_name!: string;

  @Column({ name: "CUST_ADD1", type: "varchar2", length: 100, nullable: true })
  cust_add1?: string;

  @Column({ name: "CUST_ADD2", type: "varchar2", length: 100, nullable: true })
  cust_add2?: string;

  @Column({ name: "CUST_ADD3", type: "varchar2", length: 100, nullable: true })
  cust_add3?: string;

  @Column({ name: "PINCODE", type: "varchar2", length: 20, nullable: true })
  pincode?: string;

  @Column({ name: "PHONE_NUMBER", type: "varchar2", length: 15, nullable: true })
  phone_number?: string;

  @Column({ name: "EMAIL_ID", type: "varchar2", length: 100, nullable: true })
  email_id?: string;

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

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50 })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20 })
  created_by!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 40 })
  company_code!: string;
}
