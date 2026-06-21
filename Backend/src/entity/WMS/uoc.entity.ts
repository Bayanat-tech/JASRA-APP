import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('MS_ACTIVITY_UOC')
export class ActivityUOC {
    @PrimaryColumn({ name: 'COMPANY_CODE', type: 'varchar', length: 7 })
    companyCode: string;

    @PrimaryColumn({ name: 'CHARGE_TYPE', type: 'varchar', length: 4 })
    chargeType: string;

    @PrimaryColumn({ name: 'CHARGE_CODE', type: 'varchar', length: 4 })
    chargeCode: string;

    @Column({ name: 'DESCRIPTION', type: 'varchar', length: 30, nullable: true })
    description: string;

    @Column({ name: 'ACTIVITY_GROUP_CODE', type: 'varchar', length: 5, nullable: true })
    activityGroupCode: string;

    @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ name: 'UPDATED_BY', type: 'varchar', length: 50, nullable: true })
    updatedBy: string;

    @Column({ name: 'CREATED_BY', type: 'varchar', length: 20, nullable: true })
    createdBy: string;

    @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
