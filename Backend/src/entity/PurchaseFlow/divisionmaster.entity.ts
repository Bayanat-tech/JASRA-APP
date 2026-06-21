import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("DIVISION_MASTER")
export class Divisionmaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "COMPANY_CODE", type: "varchar", length: 50 })
  company_code: string;

  @Column({ name: "DIVISION_CODE", type: "varchar", length: 50 })
  division_code: string;

  @Column({ name: "DIVISION_NAME", type: "varchar", length: 255 })
  division_name: string;

  @Column({ name: "CREATED_AT", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ name: "UPDATED_AT", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
