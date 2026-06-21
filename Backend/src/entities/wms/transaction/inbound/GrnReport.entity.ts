import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('grn_report_wms')
export class GrnReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  job_no: string;

  @Column({ type: 'varchar', length: 255 })
  company_code: string;

  @Column({ type: 'varchar', length: 255 })
  prin_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  container_no: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Add other columns as per your database schema
}
