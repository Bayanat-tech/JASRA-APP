import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_UOM)
export class UomMaster {

  @PrimaryColumn({ name: "UOM_CODE", type: "varchar2", length: 7 })
  uom_code!: string;

  @Column({ name: "UOM_NAME", type: "varchar2", length: 50, nullable: true })
  uom_name?: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @CreateDateColumn({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "SYSDATE",
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "SYSDATE",
  })
  updated_at!: Date;
}
