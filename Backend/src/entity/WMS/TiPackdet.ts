import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.TI_PACKDET)
export class TiPackdet {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code!: string;

  @PrimaryColumn({ name: "JOB_NO", type: "varchar2", length: 10 })
  job_no!: string;

  @PrimaryColumn({ name: "PACKDET_NO", type: "number" })
  packdet_no!: number;

  @Column({ name: "SELECTED", type: "char", length: 1, nullable: true, default: "N" })
  selected!: string;

  @Column({ name: "ALLOCATED", type: "char", length: 1, nullable: true, default: "N" })
  allocated!: string;

  @Column({ name: "PROD_CODE", type: "varchar2", length: 40, nullable: true })
  prod_code!: string;

  @Column({ name: "QUANTITY", type: "decimal", precision: 12, scale: 3, nullable: true })
  quantity!: number;

  @Column({ name: "REMARKS", type: "varchar2", length: 100, nullable: true })
  remarks!: string;

  @UpdateDateColumn({ name: "UPDATED_AT" })
  updated_at!: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by!: string;

  @CreateDateColumn({ name: "CREATED_AT" })
  created_at!: Date;
}
