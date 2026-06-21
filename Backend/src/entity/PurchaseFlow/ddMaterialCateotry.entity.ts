import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity("MS_PS_SUPPLIER_MAT_CATEGORY")
export class DdMaterialCategory {
  @PrimaryColumn({ name: "SUPP_MAT_CAT_CODE", type: "varchar2", length: 40 })
  supp_mat_cat_code!: string;

  @Column({ name: "SUPP_MAT_CAT_DESP", type: "varchar2", length: 200 })
  supp_mat_cat_desp!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;

  @Column({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  created_at?: Date;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updated_at?: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;
}
