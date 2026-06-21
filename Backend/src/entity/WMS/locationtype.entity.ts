import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('MS_LOCTYPE')
export class LocationType {
  @PrimaryColumn({ name: 'LOC_TYPE', type: 'varchar', length: 3 })
  locType: string;

  @Column({ name: 'LOC_CBM', type: 'decimal', precision: 9, scale: 6, nullable: true })
  locCbm: number;

  @Column({ name: 'LOC_WT', type: 'decimal', precision: 9, scale: 6, nullable: true })
  locWt: number;

  @Column({ name: 'PUSH_LEVEL', type: 'varchar', length: 2, nullable: true })
  pushLevel: string;

  @Column({ name: 'USER_ID', type: 'varchar', length: 10, nullable: true, default: 'USER' })
  userId: string;

  @Column({ name: 'USER_DT', type: 'date', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  userDt: Date;

  @Column({ name: 'COMPANY_CODE', type: 'varchar', length: 5 })
  companyCode: string;

  @Column({ name: 'LOC_NAME', type: 'varchar', length: 50, nullable: true })
  locName: string;
}
