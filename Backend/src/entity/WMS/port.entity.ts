import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_PORT)
export class PortMaster {
  @PrimaryColumn({ name: "PORT_CODE", type: "varchar2", length: 8 })
  port_code!: string;

  @Column({ name: "PORT_NAME", type: "varchar2", length: 40, nullable: true })
  port_name?: string;

  @Column({ name: "TRP_MODE", type: "varchar2", length: 10, nullable: true })
  trp_mode?: string;

  @Column({ name: "COUNTRY_CODE", type: "varchar2", length: 7 })
  country_code!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

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
