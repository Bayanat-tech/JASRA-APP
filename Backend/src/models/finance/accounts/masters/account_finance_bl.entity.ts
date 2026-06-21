import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../../../helpers/constants";

@Entity(constants.TABLE.MS_AC_BLSETUP)
export class AccountBlSetup {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "BL_CODE", type: "varchar2" })
  bl_code!: string;

  @Column({ name: "BL_NAME", type: "varchar2", length: 50 })
  bl_name!: string;

  @Column({ name: "BL_TYPE", type: "varchar2", length: 2 })
  bl_type!: string;

  @Column({ name: "H_CODE", type: "varchar2", length: 20 })
  h_code!: string;

  @Column({ name: "PRV_CODE", type: "varchar2", length: 20 })
  prv_code!: string;
}
