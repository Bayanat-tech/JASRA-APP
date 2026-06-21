import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('MS_ACTIVITY_SUBGROUP')
export class ActivitySubgroup {
  @PrimaryColumn({ name: 'ACTIVITY_SUBGROUP_CODE', type: 'char', length: 5 })
  activitySubgroupCode: string;

  @Column({ name: 'ACT_SUBGROUP_NAME', type: 'varchar2', length: 50, nullable: true })
  actSubgroupName: string;

  @Column({ name: 'USER_ID', type: 'varchar2', length: 10, nullable: true, default: 'USER' })
  userId: string;

  @Column({ name: 'USER_DT', type: 'date', nullable: true, default: () => 'SYSDATE' })
  userDt: Date;

  @Column({ name: 'COMPANY_CODE', type: 'varchar2', length: 5 })
  companyCode: string;

  @Column({ name: 'MANDATORY_FLAG', type: 'varchar2', length: 1, nullable: true, default: 'N' })
  mandatoryFlag: string;

  @Column({ name: 'VALIDATE_FLAG', type: 'varchar2', length: 1, nullable: true, default: 'N' })
  validateFlag: string;

  @Column({ name: 'ACCOUNT_CODE', type: 'varchar2', length: 50, nullable: true })
  accountCode: string;

  @Column({ name: 'ACT_GROUP_CODE', type: 'varchar2', length: 5, nullable: true })
  actGroupCode: string;

  @Column({ name: 'UPDATED_AT', type: 'date', nullable: true })
  updatedAt: Date;

  @Column({ name: 'UPDATED_BY', type: 'varchar2', length: 100, nullable: true })
  updatedBy: string;

  @Column({ name: 'CREATED_BY', type: 'varchar2', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'CREATED_AT', type: 'date', nullable: true })
  createdAt: Date;
}
