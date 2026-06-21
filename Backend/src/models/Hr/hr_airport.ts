// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrAirport } from "../../interfaces/Hr/hr_airport";

// Define the HrAirport entity
@Entity(constants.TABLE.MS_HR_AIRPORT)
export class HrAirport implements IHrAirport {
  // Company code attribute
  @Column({ 
    name: "COMPANY_CODE", 
    type: "varchar2", 
    length: 7, 
    nullable: false 
  })
  company_code!: string;

  // Airport code attribute (primary key)
  @PrimaryColumn({ 
    name: "AIRPORT_CODE", 
    type: "varchar2", 
    length: 3, 
    nullable: false 
  })
  airport_code!: string;

  // Airport name attribute
  @Column({ 
    name: "AIRPORT_NAME", 
    type: "varchar2", 
    length: 50, 
    nullable: false 
  })
  airport_name!: string;

  // Airport short name attribute
  @Column({ 
    name: "AIRPORT_SHORT_NAME", 
    type: "varchar2", 
    length: 10, 
    nullable: true 
  })
  airport_short_name!: string;

  // Adult ticket fare attribute
  @Column({ 
    name: "ADULT_TICKET_FAIR", 
    type: "decimal", 
    precision: 18, 
    scale: 3, 
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  adult_ticket_fair!: number;

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
    nullable: true 
  })
  status!: string;

  // Fare class attribute
  @Column({ 
    name: "FAIR_CLASS", 
    type: "varchar2", 
    length: 1, 
    nullable: false 
  })
  fair_class!: string;

  // Currency code attribute
  @Column({ 
    name: "CURR_CODE", 
    type: "varchar2", 
    length: 3, 
    nullable: true 
  })
  curr_code!: string;

  // Exchange rate attribute
  @Column({ 
    name: "EX_RATE", 
    type: "decimal", 
    precision: 6, 
    scale: 3, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  ex_rate!: number;

  // First class adult fare attribute
  @Column({ 
    name: "FC_ADULT_FAIR", 
    type: "decimal", 
    precision: 18, 
    scale: 3, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  fc_adult_fair!: number;

  // First class child fare attribute
  @Column({ 
    name: "FC_CHILD_FAIR", 
    type: "decimal", 
    precision: 18, 
    scale: 3, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  fc_child_fair!: number;

  // First class infant fare attribute
  @Column({ 
    name: "FC_INFANT_FAIR", 
    type: "decimal", 
    precision: 18, 
    scale: 3, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  fc_infant_fair!: number;

  // Destination country attribute
  @Column({ 
    name: "DESTINATION_COUNTRY", 
    type: "varchar2", 
    length: 5, 
    nullable: true 
  })
  destination_country!: string;

  // Created by attribute
  @Column({ 
    name: "CREATED_BY", 
    type: "varchar2", 
    length: 20, 
    nullable: true 
  })
  created_by!: string;

  // Updated by attribute
  @Column({ 
    name: "UPDATED_BY", 
    type: "varchar2", 
    length: 50, 
    nullable: true 
  })
  updated_by!: string;

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