// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrLabourDesignation } from "../../interfaces/Hr/hr_labour_designation";

// Define the HrLabourDesignation entity
@Entity(constants.TABLE.MS_HR_LABOUR_DESIGNATION)
export class HrLabourDesignation implements IHrLabourDesignation {
  // Company code attribute (composite primary key)
  @PrimaryColumn({ type: "varchar2", name: "COMPANY_CODE", length: 7, nullable: false })
  company_code!: string;

  // Labour designation code attribute (composite primary key)
  @PrimaryColumn({ type: "varchar2", name: "LABOUR_DESG_CODE", length: 5, nullable: false })
  labour_desg_code!: string;

  // Labour designation name attribute
  @Column({ type: "varchar2", name: "LABOUR_DESG_NAME", length: 50, nullable: true })
  labour_desg_name!: string;

  // Labour designation short name attribute
  @Column({ type: "varchar2", name: "LABOUR_DESG_SHORT_NAME", length: 10, nullable: true })
  labour_desg_short_name!: string;

  // Remarks attribute
  @Column({ type: "varchar2", name: "REMARKS", length: 100, nullable: true })
  remarks!: string;

  // Status attribute
  @Column({ type: "varchar2", name: "STATUS", length: 1, nullable: true })
  status!: string;

  // Updated by attribute
  @Column({ type: "varchar2", name: "UPDATED_BY", length: 50, nullable: true })
  updated_by!: string;

  // Created by attribute
  @Column({ type: "varchar2", name: "CREATED_BY", length: 20, nullable: true })
  created_by!: string;

  // Created at attribute (automatically managed)
  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp", nullable: true })
  created_at!: Date;

  // Updated at attribute (automatically managed)
  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp", nullable: true })
  updated_at!: Date;
}