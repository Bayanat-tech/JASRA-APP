import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('MS_MANUFACTURER')
export class Manufacturer {
  @PrimaryColumn({ name: 'PRIN_CODE', type: 'varchar', length: 5 })
  prinCode: string;

  @PrimaryColumn({ name: 'MANU_CODE', type: 'varchar', length: 10 })
  manuCode: string;

  @Column({ name: 'COUNTRY_CODE', type: 'varchar', length: 5, nullable: true })
  countryCode: string;

  @Column({ name: 'MANU_NAME', type: 'varchar', length: 250 })
  manuName: string;

  @Column({ name: 'MANU_ADDR1', type: 'varchar', length: 50, nullable: true })
  manuAddr1: string;

  @Column({ name: 'MANU_ADDR2', type: 'varchar', length: 50, nullable: true })
  manuAddr2: string;

  @Column({ name: 'MANU_ADDR3', type: 'varchar', length: 50, nullable: true })
  manuAddr3: string;

  @Column({ name: 'MANU_ADDR4', type: 'varchar', length: 50, nullable: true })
  manuAddr4: string;

  @Column({ name: 'MANU_CITY', type: 'varchar', length: 50, nullable: true })
  manuCity: string;

  @Column({ name: 'MANU_CONTACT', type: 'varchar', length: 50, nullable: true })
  manuContact: string;

  @Column({ name: 'MANU_TELNO1', type: 'varchar', length: 20, nullable: true })
  manuTelno1: string;

  @Column({ name: 'MANU_FAXNO1', type: 'varchar', length: 20, nullable: true })
  manuFaxno1: string;

  @Column({ name: 'MANU_EMAIL1', type: 'varchar', length: 50, nullable: true })
  manuEmail1: string;

  @Column({ name: 'COMPANY_CODE', type: 'varchar', length: 7 })
  companyCode: string;

  @Column({ 
    name: 'UPDATED_AT', 
    type: 'timestamp', 
    nullable: true, 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  updatedAt: Date;

  @Column({ name: 'UPDATED_BY', type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @Column({ name: 'CREATED_BY', type: 'varchar', length: 20, nullable: true })
  createdBy: string;

  @Column({ 
    name: 'CREATED_AT', 
    type: 'timestamp', 
    nullable: true, 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  createdAt: Date;
}
