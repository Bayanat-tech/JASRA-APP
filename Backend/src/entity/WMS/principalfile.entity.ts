import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "UPLOADED_FILES_DLTS", schema: "WMSDEV" })
export class UploadedFilesDlts {
  @Column({ type: "varchar", length: 7 })
  company_code: string;

  @Column({ type: "varchar", length: 25 })
  request_number: string;

  @PrimaryGeneratedColumn({ type: "number" })
  sr_no: number;

  @Column({ type: "varchar", length: 180 })
  file_name: string;

  @Column({ type: "varchar", length: 400 })
  org_file_name: string;

  @Column({ type: "varchar", length: 500 })
  aws_file_locn: string;

  @Column({ type: "number", nullable: true })
  flow_level?: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  modules?: string;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at", default: () => "SYSDATE" })
  updated_at: Date;

  @Column({ type: "varchar", length: 50, nullable: true })
  updated_by?: string;

  @Column({ type: "varchar", length: 20 })
  created_by: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at", default: () => "SYSDATE" })
  created_at: Date;

  @Column({ type: "varchar", length: 5, nullable: true })
  extensions?: string;

  @Column({ type: "varchar", length: 75, nullable: true })
  user_file_name?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  type?: string;
}
