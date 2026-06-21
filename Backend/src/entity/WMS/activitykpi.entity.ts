import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('MS_ACTIVITY_KPI')
export class ActivityKpi {
  @PrimaryColumn({ name: 'COMPANY_CODE', length: 5 })
  companyCode: string;

  @PrimaryColumn({ name: 'PRIN_CODE', length: 5 })
  prinCode: string;

  @PrimaryColumn({ name: 'JOB_TYPE', length: 4 })
  jobType: string;

  @PrimaryColumn({ name: 'ACT_CODE', length: 5 })
  actCode: string;

  @Column({ name: 'CUST_CODE', length: 20, nullable: true })
  custCode: string;

  @Column({ name: 'EXP_HOURS', type: 'decimal', precision: 5, scale: 2 })
  expHours: number;

  @Column({ name: 'USER_DT', type: 'date', nullable: true, default: () => 'SYSDATE' })
  userDt: Date;

  @Column({ name: 'USER_ID', length: 10, nullable: true, default: 'USER' })
  userId: string;
}
