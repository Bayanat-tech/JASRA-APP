import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import constants from "../../helpers/constants";
import { IHrEmpStatus } from "../../interfaces/Hr/hr_employee_status";

/**
 * Represents the HrEmpStatus entity.
 */
@Entity(constants.TABLE.MS_HR_EMP_STATUS)
export class HrEmpStatus implements IHrEmpStatus {
  /**
   * Company code.
   */
  @PrimaryColumn({ type: "varchar2", name: "COMPANY_CODE", length: 7, nullable: false })
  company_code!: string;

  /**
   * Employee status code.
   */
  @PrimaryColumn({ type: "varchar2", name: "EMPSTATUS_CODE", length: 2, nullable: false })
  empstatus_code!: string;

  /**
   * Employee status name.
   */
  @Column({ type: "varchar2", name: "EMPSTATUS_NAME", length: 50, nullable: true })
  empstatus_name!: string;

  /**
   * Employee status short description.
   */
  @Column({ type: "varchar2", name: "EMPSTATUS_SHORT_DESC", length: 10, nullable: true })
  empstatus_short_desc!: string;

  /**
   * Remarks.
   */
  @Column({ type: "varchar2", name: "REMARKS", length: 100, nullable: true })
  remarks!: string;

  /**
   * Updated by.
   */
  @Column({ type: "varchar2", name: "UPDATED_BY", length: 50, nullable: true })
  updated_by!: string;

  /**
   * Created by.
   */
  @Column({ type: "varchar2", name: "CREATED_BY", length: 20, nullable: true })
  created_by!: string;

  /**
   * Created at timestamp.
   */
  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp", nullable: true })
  created_at!: Date;

  /**
   * Updated at timestamp.
   */
  @UpdateDateColumn({ name: "UPDATED_AT", type: "timestamp", nullable: true })
  updated_at!: Date;
}