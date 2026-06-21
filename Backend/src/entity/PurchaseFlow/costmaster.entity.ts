import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity('MS_COST')
export class CostMaster {
  @PrimaryColumn({ name: "COST_CODE", type: "varchar2", length: 50 })
  cost_code!: string;

  @Column({ name: "COST_NAME", type: "varchar2", length: 30 })
  cost_name!: string;

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
