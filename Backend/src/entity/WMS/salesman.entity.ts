import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";

@Entity({ name: constants.TABLE.MS_SALESMAN }) // Use object form for clarity
export class SalesmanMaster {

  @PrimaryColumn({ name: "SALESMAN_CODE", type: "varchar", length: 10 })
  salesman_code!: string;

   @Column({ name: "COMPANY_CODE", type: "varchar", length: 7 })
  company_code!: string;

  @Column({ name: "SALESMAN_NAME", type: "varchar", length: 70, nullable: true })
  salesman_name?: string;

  @Column({ name: "UPDATED_BY", type: "varchar", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar", length: 20, nullable: true })
  created_by?: string;

  @CreateDateColumn({
    name: "CREATED_AT",
    type: "timestamp",
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "UPDATED_AT",
    type: "timestamp",
  })
  updated_at!: Date;
}
