// Import necessary modules from TypeORM
import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";
import { IHrSection } from "../../interfaces/Hr/hr_section";

// Define the HrSection entity
@Entity(constants.TABLE.MS_HR_SECTION)
export class HrSection implements IHrSection {
  // Company code attribute
  @Column({ type: "varchar2", name: "COMPANY_CODE", length: 10, nullable: false })
  company_code!: string;

  // Division code attribute
  @Column({ type: "varchar2", name: "DIV_CODE", length: 5, nullable: false })
  div_code!: string;

  // Department code attribute
  @Column({ type: "varchar2", name: "DEPT_CODE", length: 5, nullable: false })
  dept_code!: string;

  // Section code attribute (primary key)
  @PrimaryColumn({ type: "varchar2", name: "SECTION_CODE", length: 5, nullable: false })
  section_code!: string;

  // Section name attribute
  @Column({ type: "varchar2", name: "SECTION_NAME", length: 50, nullable: false })
  section_name!: string;

  // Section short name attribute
  @Column({ type: "varchar2", name: "SECTION_SHORT_NAME", length: 10, nullable: true })
  section_short_name!: string;

  // Section address 1 attribute
  @Column({ type: "varchar2", name: "SECT_ADDR1", length: 50, nullable: true })
  sect_addr1!: string;

  // Section address 2 attribute
  @Column({ type: "varchar2", name: "SECT_ADDR2", length: 50, nullable: true })
  sect_addr2!: string;

  // Section address 3 attribute
  @Column({ type: "varchar2", name: "SECT_ADDR3", length: 50, nullable: true })
  sect_addr3!: string;

  // Phone number attribute
  @Column({ type: "varchar2", name: "PHONE", length: 15, nullable: true })
  phone!: string;

  // Fax number attribute
  @Column({ type: "varchar2", name: "FAX", length: 15, nullable: true })
  fax!: string;

  // Email address attribute
  @Column({ type: "varchar2", name: "EMAIL", length: 50, nullable: true })
  email!: string;

  // Section head ID attribute
  @Column({ type: "varchar2", name: "SECT_HEAD_ID", length: 10, nullable: true })
  sect_head_id!: string;

  // Remarks attribute
  @Column({ type: "varchar2", name: "REMARKS", length: 100, nullable: true })
  remarks!: string;

  // Status attribute
  @Column({ type: "varchar2", name: "STATUS", length: 1, nullable: true })
  status!: string;

  // User ID attribute
  @Column({ type: "varchar2", name: "USER_ID", length: 10, nullable: true })
  user_id!: string;

  // User date attribute
  @Column({ type: "date", name: "USER_DT", nullable: true })
  user_dt!: Date;

  // Enterprise code attribute (note: fixed typo from "enterprice_code")
  @Column({ type: "varchar2", name: "ENTERPRISE_CODE", length: 10, nullable: true })
  enterprice_code!: string;

  // Staff control account group attribute
  @Column({ type: "varchar2", name: "STAFF_CNTRL_AC_GROUP", length: 10, nullable: true })
  staff_cntrl_ac_group!: string;

  // Staff loan account group attribute
  @Column({ type: "varchar2", name: "STAFF_LOAN_AC_GROUP", length: 10, nullable: true })
  staff_loan_ac_group!: string;

  // Salary expense account code attribute
  @Column({ type: "varchar2", name: "SALARY_EXPENSE_AC_CODE", length: 10, nullable: true })
  salary_expense_ac_code!: string;

  // Expense sub-type attribute
  @Column({ type: "varchar2", name: "EXPENSE_SUB_TYPE", length: 10, nullable: true })
  expense_sub_type!: string;

  // Expense type attribute
  @Column({ type: "varchar2", name: "EXPENSE_TYPE", length: 10, nullable: true })
  expense_type!: string;
}