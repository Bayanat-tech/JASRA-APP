// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrContract } from "../../interfaces/Hr/hr_contract";

// Define the HrContract entity
@Entity(constants.TABLE.MS_HR_CONTRACT_TYPES)
export class HrContract implements IHrContract {
  // Company code attribute (composite primary key)
  @PrimaryColumn({ 
    name: "COMPANY_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  company_code!: string;

  // Contract type attribute (composite primary key)
  @PrimaryColumn({ 
    name: "CONTRACT_TYPE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  contract_type!: string;

  // Contract type description attribute
  @Column({ 
    name: "CONTRACT_TYPE_DESC", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  contract_type_desc!: string;

  // Contract type short description attribute
  @Column({ 
    name: "CONTRACT_TYPE_SHORT_DESC", 
    type: "varchar2", 
    length: 10, 
    nullable: true 
  })
  contract_type_short_desc!: string;

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