import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_HR_DEPARTMENT)
export class DepartmentMaster {

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code!: string;

  @PrimaryColumn({ name: "DIV_CODE", type: "varchar2", length: 5 })
  div_code!: string;

  @PrimaryColumn({ name: "DEPT_CODE", type: "varchar2", length: 5 })
  dept_code!: string;

  @Column({ name: "DEPT_NAME", type: "varchar2", length: 50 })
  dept_name!: string;

  @Column({ name: "DEPT_SHORT_NAME", type: "varchar2", length: 10, nullable: true })
  dept_short_name?: string;

  @Column({ name: "DEPT_ADDR1", type: "varchar2", length: 50 })
  dept_addr1!: string;

  @Column({ name: "DEPT_ADDR2", type: "varchar2", length: 50, nullable: true })
  dept_addr2?: string;

  @Column({ name: "DEPT_ADDR3", type: "varchar2", length: 50, nullable: true })
  dept_addr3?: string;

  @Column({ name: "PHONE", type: "varchar2", length: 25, nullable: true })
  phone?: string;

  @Column({ name: "FAX", type: "varchar2", length: 25, nullable: true })
  fax?: string;

  @Column({ name: "EMAIL", type: "varchar2", length: 50, nullable: true })
  email?: string;

  @Column({ name: "DEPT_HEAD_ID", type: "varchar2", length: 10, nullable: true })
  dept_head_id?: string;

  @Column({ name: "REMARKS", type: "varchar2", length: 100, nullable: true })
  remarks?: string;

  @Column({ name: "STATUS", type: "varchar2", length: 1 })
  status!: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, nullable: true })
  user_id?: string;

  @Column({ name: "USER_DT", type: "date", nullable: true })
  user_dt?: Date;

  @Column({ name: "ENTERPRICE_CODE", type: "varchar2", length: 5 })
  enterprice_code!: string;
}
