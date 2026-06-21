import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";

// Use string literal for table name to avoid case issues.
// If your table is in a specific schema, use: @Entity({ name: "SCHEMA_NAME.TABLE_NAME" })
// For example: @Entity({ name: "MYSCHEMA.MS_COUNTRY" })
@Entity({ name: constants.TABLE.MS_COUNTRY }) // Use object form for clarity
export class CountryMaster {
    
  @PrimaryColumn({ name: "COUNTRY_CODE", type: "varchar2", length: 30 })
  country_code!: string;
    
  @Column({ name: "COUNTRY_NAME", type: "varchar2", length: 100 })
  country_name!: string;
    
  @Column({ name: "COUNTRY_GCC", type: "varchar2", length: 30 })
  country_GCC!: string;
    
  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 30 })
  company_code!: string;
    
  @Column({ name: "SHORT_DESC", type: "varchar2", length: 30 })
  short_desc!: string;

  @Column({ name: "NATIONALITY", type: "varchar2", length: 50 })
  nationality!: string;

    @Column({ name: "UPDATED_BY", type: "varchar2", length: 50 })
  updated_by!: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 50 })
  created_by!: string;

    @CreateDateColumn({
    name: "CREATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "UPDATED_AT",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;
}
