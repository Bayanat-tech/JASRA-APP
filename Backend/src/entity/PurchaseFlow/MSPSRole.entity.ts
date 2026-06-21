import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("MS_PS_ROLE") // Table name in Oracle
export class MSPSRole {
  @PrimaryColumn({ name: "ROLE_CODE", type: "varchar2", length: 5 })
  role_code!: string;

  @Column({ name: "ROLE_NAME", type: "varchar2", length: 100 })
  role_name!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20, nullable: true })
  company_code?: string;

  @Column({
    name: "USER_DT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  user_dt!: Date;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true })
  user_id?: string;

  @Column({ name: "USER_ROLE", type: "varchar2", length: 15 })
  user_role!: string;
}
