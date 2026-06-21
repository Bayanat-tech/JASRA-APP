import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_PS_PROJECT_MASTER)
export class DropdownProjectmaster {
  @PrimaryColumn({ name: "PROJECT_CODE", type: "varchar2", length: 5 })
  project_code!: string;

  @Column({ name: "PROJECT_NAME", type: "varchar2", length: 50 })
  project_name!: string;

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 10 })
  company_code!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

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
