import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from "typeorm";

@Entity({ name: "MS_PICKWAVE" })
export class MsPickwave {
  @PrimaryColumn({ type: "varchar2", length: 50 })
  wave_name: string;

  @PrimaryColumn({ type: "number" })
  wave_code: number;

  @PrimaryColumn({ type: "varchar2", length: 5 })
  company_code: string;

  @Column({ type: "varchar2", length: 25, nullable: false })
  col_name: string;

  @Column({ type: "char", length: 1, nullable: false })
  indicator: string;

  @Column({ type: "char", length: 2, nullable: false })
  seq_order: string;

  @Column({ type: "date", nullable: false })
  updated_at: Date;

  @Column({ type: "varchar2", length: 50, nullable: false })
  updated_by: string;

  @Column({ type: "varchar2", length: 20, nullable: false })
  created_by: string;

  @Column({ type: "date", nullable: false })
  created_at: Date;
}
