import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity('MS_PS_MATER_CATEGORY') // Or use a constant if you have one
export class MaterialCategoryMaster {
  @PrimaryColumn({ name: "MATER_CATEGORY_CODE", type: "varchar2", length: 50 })
  mater_category_code!: string;

  @Column({ name: "MATER_CATEGORY_DESP", type: "varchar2", length: 30 })
  mater_category_desp!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 10 })
  company_code!: string;

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
