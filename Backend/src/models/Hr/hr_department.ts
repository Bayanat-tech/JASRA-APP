// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrDepartment } from "../../interfaces/Hr/hr_department";

// Define the HrDepartment entity
@Entity(constants.TABLE.MS_HR_DEPARTMENT)
export class HrDepartment implements IHrDepartment {
  // Company code attribute
  @Column({ 
    name: "COMPANY_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  company_code!: string;

  // Division code attribute
  @Column({ 
    name: "DIV_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  div_code!: string;

  // Department code attribute (primary key)
  @PrimaryColumn({ 
    name: "DEPT_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  dept_code!: string;

  // Department name attribute
  @Column({ 
    name: "DEPT_NAME", 
    type: "varchar2", 
    length: 50, 
    nullable: false 
  })
  dept_name!: string;

  // Department short name attribute
  @Column({ 
    name: "DEPT_SHORT_NAME", 
    type: "varchar2", 
    length: 10, 
    nullable: false 
  })
  dept_short_name!: string;

  // Department address 1 attribute
  @Column({ 
    name: "DEPT_ADDR1", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  dept_addr1!: string;

  // Department address 2 attribute
  @Column({ 
    name: "DEPT_ADDR2", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  dept_addr2!: string;

  // Department address 3 attribute
  @Column({ 
    name: "DEPT_ADDR3", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  dept_addr3!: string;

  // Phone number attribute
  @Column({ 
    name: "PHONE", 
    type: "varchar2", 
    length: 25, 
    nullable: true 
  })
  phone!: string;

  // Fax number attribute
  @Column({ 
    name: "FAX", 
    type: "varchar2", 
    length: 25, 
    nullable: true 
  })
  fax!: string;

  // Email address attribute
  @Column({ 
    name: "EMAIL", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  email!: string;

  // Department head ID attribute
  @Column({ 
    name: "DEPT_HEAD_ID", 
    type: "varchar2", 
    length: 10, 
    nullable: true 
  })
  dept_head_id!: string;

  // Remarks attribute
  @Column({ 
    name: "REMARKS", 
    type: "varchar2", 
    length: 100, 
    nullable: true 
  })
  remarks!: string;

  // Status attribute
  @Column({ 
    name: "STATUS", 
    type: "varchar2", 
    length: 1, 
    nullable: false 
  })
  status!: string;

  // Enterprise code attribute (note: fixed typo from "enterprice_code")
  @Column({ 
    name: "ENTERPRISE_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: true 
  })
  enterprice_code!: string;

  // Updated by attribute
  @Column({ 
    name: "UPDATED_BY", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  updated_by!: string;

  // Created by attribute
  @Column({ 
    name: "CREATED_BY", 
    type: "varchar2", 
    length: 20, 
    nullable: true 
  })
  created_by!: string;

  // Created at attribute (automatically managed)
  @CreateDateColumn({ 
    name: "CREATED_AT", 
    type: "timestamp",
    nullable: true 
  })
  created_at!: Date;

  // Updated at attribute (automatically managed)
  @UpdateDateColumn({ 
    name: "UPDATED_AT", 
    type: "timestamp",
    nullable: true 
  })
  updated_at!: Date;
}