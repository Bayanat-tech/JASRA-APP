import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('MS_VESSEL')
export class Vessel {
  @PrimaryColumn({ name: 'COMPANY_CODE', type: 'varchar2', length: 5 })
  companyCode: string;

  @PrimaryColumn({ name: 'VESSEL_CODE', type: 'varchar2', length: 5 })
  vesselCode: string;

  @Column({ name: 'VESSEL_NAME', type: 'varchar2', length: 50, nullable: true })
  vesselName?: string;

  @Column({ name: 'LINE_CODE', type: 'varchar2', length: 5, nullable: true })
  lineCode?: string;

  @Column({ name: 'CONTACT_PERSON', type: 'varchar2', length: 50, nullable: true })
  contactPerson?: string;

  @Column({ name: 'ADDRESS', type: 'varchar2', length: 200, nullable: true })
  address?: string;

  @Column({ name: 'TEL_NO', type: 'varchar2', length: 20, nullable: true })
  telNo?: string;

  @Column({ name: 'FAX_NO', type: 'varchar2', length: 20, nullable: true })
  faxNo?: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 25, nullable: true })
  email?: string;

  @Column({ name: 'UPDATED_BY', type: 'varchar2', length: 50, nullable: true })
  updatedBy?: string;

  @Column({ name: 'CREATED_BY', type: 'varchar2', length: 50, nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
