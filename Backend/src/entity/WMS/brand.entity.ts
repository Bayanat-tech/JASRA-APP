import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('MS_PRODBRAND')
export class Brand {
  @PrimaryColumn({ name: 'COMPANY_CODE', type: 'varchar', length: 7 })
  companyCode: string;

  @PrimaryColumn({ name: 'PRIN_CODE', type: 'varchar', length: 5 })
  prinCode: string;

  @PrimaryColumn({ name: 'GROUP_CODE', type: 'varchar', length: 5 })
  groupCode: string;

  @PrimaryColumn({ name: 'BRAND_CODE', type: 'varchar', length: 5 })
  brandCode: string;

  @Column({ name: 'BRAND_NAME', type: 'varchar', length: 50, nullable: true })
  brandName: string;

  @Column({ name: 'PREF_SITE', type: 'varchar', length: 5, nullable: true })
  prefSite: string;

  @Column({ name: 'PREF_LOC_FROM', type: 'varchar', length: 15, nullable: true })
  prefLocFrom: string;

  @Column({ name: 'PREF_LOC_TO', type: 'varchar', length: 15, nullable: true })
  prefLocTo: string;

  @Column({ name: 'PREF_AISLE_FROM', type: 'varchar', length: 5, nullable: true })
  prefAisleFrom: string;

  @Column({ name: 'PREF_AISLE_TO', type: 'varchar', length: 5, nullable: true })
  prefAisleTo: string;

  @Column({ name: 'PREF_COL_FROM', type: 'number', nullable: true })
  prefColFrom: number;

  @Column({ name: 'PREF_COL_TO', type: 'number', nullable: true })
  prefColTo: number;

  @Column({ name: 'PREF_HT_FROM', type: 'number', nullable: true })
  prefHtFrom: number;

  @Column({ name: 'PREF_HT_TO', type: 'number', nullable: true })
  prefHtTo: number;

  @Column({ name: 'UPDATED_BY', type: 'varchar', length: 50, nullable: true })
  updatedBy: string;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'CREATED_BY', type: 'varchar', length: 20, nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
