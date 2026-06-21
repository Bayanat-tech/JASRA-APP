import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_LINE)
export class LineMaster {
  @PrimaryColumn({ name: "LINE_CODE", type: "varchar2", length: 5 })
  line_code!: string;

  @Column({ name: "LINE_NAME", type: "varchar2", length: 50, nullable: true })
  line_name?: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 7, nullable: true })
  company_code?: string;

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
