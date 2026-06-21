import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('MS_ALERT')
export class Alert {
  @PrimaryColumn({ name: 'COMPANY_CODE', type: 'varchar', length: 5 })
  companyCode: string;

  @PrimaryColumn({ name: 'OP_TYPE', type: 'varchar', length: 3 })
  opType: string;

  @PrimaryColumn({ name: 'OP_CODE', type: 'int' })
  opCode: number;

  @Column({ name: 'OP_DESC', type: 'varchar', length: 40 })
  opDesc: string;

  @Column({ name: 'OP_SEQUENCE', type: 'int' })
  opSequence: number;

  @Column({ name: 'INSTRUCTION', type: 'varchar', length: 1, nullable: true })
  instruction: string | null;

  @Column({ name: 'OP_MODE', type: 'varchar', length: 1, nullable: true })
  opMode: string | null;

  @Column({ name: 'OP_MODULE', type: 'varchar', length: 5, nullable: true })
  opModule: string | null;
}
