import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_PRODUCT)
export class ProductMaster {
  @PrimaryColumn({ name: "PROD_CODE", type: "varchar2", length: 50 })
  prod_code!: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 30 })
  prin_code!: string;

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 10 })
  company_code!: string;

  @Column({ name: "PROD_NAME", type: "varchar2", length: 30 })
  prod_name!: string;

  @Column({ name: "UPP", type: "number", nullable: true })
  upp!: number;

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
