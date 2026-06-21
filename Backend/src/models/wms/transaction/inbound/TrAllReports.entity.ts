import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "MG_REPORTS" })
export class TrAllReports {
  // Since Sequelize had no explicit primary key, we can introduce a generated surrogate key
  // OR you can remove this and use a composite/explicit key if needed.
  @PrimaryGeneratedColumn({ type: "number" })
  id: number;

  @Column({ type: "varchar2", length: 10, nullable: true })
  company_code?: string;

  @Column({ type: "varchar2", length: 100, nullable: true })
  module?: string;

  @Column({ type: "varchar2", length: 100, nullable: true })
  submodule?: string;

  @Column({ type: "varchar2", length: 150, nullable: true })
  reportname?: string;

  @Column({ type: "clob", nullable: true })
  reportobject?: string;

  @Column({ type: "varchar2", length: 255, nullable: true })
  other?: string;

  @Column({ type: "number", nullable: true })
  seq_number?: number;

  @Column({ type: "number", nullable: true })
  reportorder?: number;

  @Column({ type: "varchar2", length: 50, nullable: true })
  report_id?: string;
}
