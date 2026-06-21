// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrBank } from "../../interfaces/Hr/hr_bank";

// Define the HrBank entity
@Entity(constants.TABLE.MS_HR_BANK)
export class HrBank implements IHrBank {
  // Unique code for the bank (primary key)
  @PrimaryColumn({ 
    name: "BANK_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  bank_code!: string;

  // Full name of the bank
  @Column({ 
    name: "BANK_NAME", 
    type: "varchar2", 
    length: 50, 
    nullable: false 
  })
  bank_name!: string;

  // Short name of the bank
  @Column({ 
    name: "BANK_SHORT_NAME", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  bank_short_name!: string;

  // Address line 1 of the bank
  @Column({ 
    name: "BANK_ADDR1", 
    type: "varchar2", 
    length: 50, 
    nullable: false 
  })
  bank_addr1!: string;

  // Address line 2 of the bank
  @Column({ 
    name: "BANK_ADDR2", 
    type: "varchar2", 
    length: 50, 
    nullable: false 
  })
  bank_addr2!: string;

  // Address line 3 of the bank
  @Column({ 
    name: "BANK_ADDR3", 
    type: "varchar2", 
    length: 50, 
    nullable: false 
  })
  bank_addr3!: string;

  // Country code of the bank
  @Column({ 
    name: "COUNTRY_CODE", 
    type: "varchar2", 
    length: 5, 
    nullable: false 
  })
  country_code!: string;

  // Phone number of the bank
  @Column({ 
    name: "PHONE", 
    type: "varchar2", 
    length: 25, 
    nullable: true 
  })
  phone!: string;

  // Fax number of the bank
  @Column({ 
    name: "FAX", 
    type: "varchar2", 
    length: 25, 
    nullable: true 
  })
  fax!: string;

  // Email address of the bank
  @Column({ 
    name: "EMAIL", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  email!: string;

  // Remarks for the bank
  @Column({ 
    name: "REMARKS", 
    type: "varchar2", 
    length: 100, 
    nullable: true 
  })
  remarks!: string;

  // Status of the bank (currently commented out in original)
  /*
  @Column({ 
    name: "STATUS", 
    type: "varchar2", 
    length: 1, 
    nullable: false 
  })
  status!: string;
  */

  // Main bank code
  @Column({ 
    name: "MAIN_BANK_CODE", 
    type: "varchar2", 
    length: 10, 
    nullable: true 
  })
  main_bank_code!: string;

  // Company flag
  @Column({ 
    name: "COMPANY_FLAG", 
    type: "varchar2", 
    length: 1, 
    nullable: true 
  })
  company_flag!: string;

  // Company account code
  @Column({ 
    name: "COMP_ACCT_CODE", 
    type: "varchar2", 
    length: 30, 
    nullable: true 
  })
  comp_acct_code!: string;

  // Company code
  @Column({ 
    name: "COMPANY_CODE", 
    type: "varchar2", 
    length: 7, 
    nullable: true 
  })
  company_code!: string;

  // Created by attribute
  @Column({ 
    name: "CREATED_BY", 
    type: "varchar2", 
    length: 50, 
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

  // Updated by attribute
  @Column({ 
    name: "UPDATED_BY", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  updated_by!: string;

  // Updated at attribute (automatically managed)
  @UpdateDateColumn({ 
    name: "UPDATED_AT", 
    type: "timestamp",
    nullable: true 
  })
  updated_at!: Date;
}