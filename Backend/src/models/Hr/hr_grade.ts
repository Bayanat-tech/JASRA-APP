// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrGrade } from "../../interfaces/Hr/hr_grade";

// Define the HrGrade entity
@Entity(constants.TABLE.MS_HR_GRADE)
export class HrGrade implements IHrGrade {
  // Company code attribute (composite primary key)
  @PrimaryColumn({ type: "varchar2", name: "COMPANY_CODE", length: 5, nullable: false })
  company_code!: string;

  // Grade code attribute (composite primary key)
  @PrimaryColumn({ type: "varchar2", name: "GRADE_CODE", length: 5, nullable: false })
  grade_code!: string;

  // Grade name attribute
  @Column({ type: "varchar2", name: "GRADE_NAME", length: 50, nullable: true })
  grade_name!: string;

  // Grade short name attribute
  @Column({ type: "varchar2", name: "GRADE_SHORT_NAME", length: 10, nullable: true })
  grade_short_name!: string;

  // OT eligibility attribute
  @Column({ type: "varchar2", name: "OT_ELIGIBILITY", length: 1, nullable: true })
  ot_eligibility!: string;

  // Airfare entitlement attribute
  @Column({ 
    type: "number", 
    name: "AIRFARE_ENTITLEMENT", 
    precision: 10, 
    scale: 2, 
    nullable: true 
  })
  airfare_entitlement!: string;

  // Spouse airfare entitlement attribute
  @Column({ 
    type: "number", 
    name: "SPOUSE_AF_ENTITLEMENT", 
    precision: 10, 
    scale: 2, 
    nullable: true 
  })
  spouse_af_entitlement!: string;

  // Dependent airfare entitlement attribute
  @Column({ 
    type: "number", 
    name: "DEP_AF_ENTITLEMENT", 
    precision: 10, 
    scale: 2, 
    nullable: true 
  })
  dep_af_entitlement!: string;

  // Medical entitlement attribute
  @Column({ 
    type: "number", 
    name: "MEDICAL_ENTITLEMENT", 
    precision: 10, 
    scale: 2, 
    nullable: true 
  })
  medical_entitlement!: string;

  // Spouse medical entitlement attribute
  @Column({ type: "varchar2", name: "SPOUSE_MED_ENTITLEMENT", length: 10, nullable: true })
  spouse_med_entitlement!: string;

  // Dependent medical entitlement attribute
  @Column({ type: "varchar2", name: "DEP_MED_ENTITLEMENT", length: 10, nullable: true })
  dep_med_entitlement!: string;

  // Remarks attribute
  @Column({ type: "varchar2", name: "REMARKS", length: 100, nullable: true })
  remarks!: string;

  // Status attribute
  @Column({ type: "varchar2", name: "STATUS", length: 1, nullable: true })
  status!: string;

  // Type attribute
  @Column({ type: "varchar2", name: "TYPE", length: 10, nullable: true })
  type!: string;

  // Grade status attribute
  @Column({ type: "varchar2", name: "GRADE_STATUS", length: 10, nullable: true })
  grade_status!: string;

  // Updated by attribute
  @Column({ type: "varchar2", name: "UPDATED_BY", length: 255, nullable: true })
  updated_by!: string;

  // Created by attribute
  @Column({ type: "varchar2", name: "CREATED_BY", length: 255, nullable: true })
  created_by!: string;

  // Created at attribute (automatically managed)
  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp", nullable: true })
  created_at!: Date;

  // Updated at attribute (automatically managed)
  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp", nullable: true })
  updated_at!: Date;
}