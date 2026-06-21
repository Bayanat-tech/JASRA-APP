import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('MS_PRODGROUP')
export class ProductGroup {
    @PrimaryColumn({ name: 'COMPANY_CODE', length: 7 })
    companyCode: string;

    @PrimaryColumn({ name: 'PRIN_CODE', length: 5 })
    prinCode: string;

    @PrimaryColumn({ name: 'GROUP_CODE', length: 5 })
    groupCode: string;

    @Column({ name: 'GROUP_NAME', length: 50 })
    groupName: string;

    @Column({ name: 'PREF_SITE', length: 5, nullable: true })
    prefSite: string;

    @Column({ name: 'PREF_LOC_FROM', length: 15, nullable: true })
    prefLocFrom: string;

    @Column({ name: 'PREF_LOC_TO', length: 15, nullable: true })
    prefLocTo: string;

    @Column({ name: 'PREF_AISLE_FROM', length: 5, nullable: true })
    prefAisleFrom: string;

    @Column({ name: 'PREF_AISLE_TO', length: 5, nullable: true })
    prefAisleTo: string;

    @Column({ name: 'PREF_COL_FROM', type: 'number', nullable: true })
    prefColFrom: number;

    @Column({ name: 'PREF_COL_TO', type: 'number', nullable: true })
    prefColTo: number;

    @Column({ name: 'PREF_HT_FROM', type: 'number', nullable: true })
    prefHtFrom: number;

    @Column({ name: 'PREF_HT_TO', type: 'number', nullable: true })
    prefHtTo: number;

    @Column({ name: 'EXPIRY_CONS_DAYS', type: 'number', nullable: true })
    expiryConsDays: number;

    @Column({ name: 'UPDATED_BY', length: 50, nullable: true })
    updatedBy: string;

    @Column({ name: 'CREATED_BY', length: 20, nullable: true })
    createdBy: string;

    @CreateDateColumn({ name: 'CREATED_AT', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
    updatedAt: Date;
}
