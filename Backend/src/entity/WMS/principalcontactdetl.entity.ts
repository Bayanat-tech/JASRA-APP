import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IPrincipalContactDetlWMs } from "../../interfaces/wms/principal_wms.interface";

@Entity({ name: constants.TABLE.MS_PRINCIPAL_CONTACT_DETL })
export class PrincipalContactDetl implements IPrincipalContactDetlWMs {
  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar", length: 5 })
  prin_code: string;

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar", length: 7 })
  company_code: string;

  @Column({ name: "PRIN_CONT1", type: "varchar", length: 40, nullable: true })
  prin_cont1!: string;

  @Column({ name: "PRIN_CONT2", type: "varchar", length: 40, nullable: true })
  prin_cont2!: string;

  @Column({ name: "PRIN_CONT3", type: "varchar", length: 40, nullable: true })
  prin_cont3!: string;

  @Column({ name: "PRIN_CONT_TELNO1", type: "varchar", length: 40, nullable: true })
  prin_cont_telno1!: string;

  @Column({ name: "PRIN_CONT_TELNO2", type: "varchar", length: 40, nullable: true })
  prin_cont_telno2!: string;

  @Column({ name: "PRIN_CONT_TELNO3", type: "varchar", length: 40, nullable: true })
  prin_cont_telno3!: string;

  @Column({ name: "PRIN_CONT_EMAIL1", type: "varchar", length: 40, nullable: true })
  prin_cont_email1!: string;

  @Column({ name: "PRIN_CONT_EMAIL2", type: "varchar", length: 40, nullable: true })
  prin_cont_email2!: string;

  @Column({ name: "PRIN_CONT_EMAIL3", type: "varchar", length: 40, nullable: true })
  prin_cont_email3!: string;

  @Column({ name: "PRIN_CONT_FAXNO1", type: "varchar", length: 40, nullable: true })
  prin_cont_faxno1!: string;

  @Column({ name: "PRIN_CONT_FAXNO2", type: "varchar", length: 40, nullable: true })
  prin_cont_faxno2!: string;

  @Column({ name: "PRIN_CONT_FAXNO3", type: "varchar", length: 40, nullable: true })
  prin_cont_faxno3!: string;

  @Column({ name: "PRIN_CONT_REF1", type: "varchar", length: 45, nullable: true })
  prin_cont_ref1!: string;

  @Column({ name: "UPDATED_BY", type: "varchar", length: 50, nullable: true })
  updated_by: string;

  @Column({ name: "CREATED_BY", type: "varchar", length: 20, nullable: true })
  created_by: string;

  @CreateDateColumn({ name: "CREATED_AT" })
  created_at: Date;

  @UpdateDateColumn({ name: "UPDATED_AT" })
  updated_at: Date;
}
