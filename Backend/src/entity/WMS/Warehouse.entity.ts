import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "MS_WAREHOUSE" })
export class Warehouse {
  @PrimaryColumn({ type: "varchar2", length: 20 })
  company_code: string;

  @Column({ type: "varchar2", length: 20 })
  country_code: string;

  @PrimaryColumn({ type: "varchar2", length: 255 })
  wh_code: string;

  @Column({ type: "varchar2", length: 20, nullable: true })
  wh_name?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  address?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  city?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  phone?: string;

  @Column({ type: "varchar2", length: 20 })
  created_by: string;

  @Column({ type: "varchar2", length: 50 })
  updated_by: string;

  @CreateDateColumn({ type: "date", name: "created_at" })
  created_at?: Date;

  @UpdateDateColumn({ type: "date", name: "updated_at" })
  updated_at?: Date;
}
