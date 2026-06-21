import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('MS_HARMONIZE')
export class Harmonize {
    @PrimaryColumn({ name: 'HARM_CODE', length: 20 })
    harmCode: string;

    @Column({ name: 'HARM_DESC', length: 255 })
    harmDesc: string;

    @Column({ name: 'COMPANY_CODE', length: 7 })
    companyCode: string;

    @Column({ name: 'SHORT_DESC', length: 100, nullable: true })
    shortDesc: string;

    @Column({ name: 'UOM', length: 5, nullable: true })
    uom: string;

    @Column({ name: 'PERMIT_REQD', length: 1, nullable: true })
    permitReqd: string;

    @Column({ name: 'UNIT', length: 5, nullable: true })
    unit: string;

    @Column({ name: 'UPDATED_BY', length: 50, nullable: true })
    updatedBy: string;

    @Column({ name: 'CREATED_BY', length: 20, nullable: true })
    createdBy: string;

    @CreateDateColumn({ name: 'CREATED_AT', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'UPDATED_AT', nullable: true })
    updatedAt: Date;
}
