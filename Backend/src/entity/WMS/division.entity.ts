import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("MS_HR_DIVISION")
export class Division {
  @PrimaryColumn({ name: "COMPANY_CODE", length: 5 })
  companyCode: string;

  @PrimaryColumn({ name: "DIV_CODE", length: 5 })
  divCode: string;

  @Column({ name: "DIV_NAME", length: 50 })
  divName: string;

  @Column({ name: "DIV_SHORT_NAME", length: 10, nullable: true })
  divShortName: string;

  @Column({ name: "DIV_ADDRESS1", length: 50 })
  divAddress1: string;

  @Column({ name: "DIV_ADDRESS2", length: 50, nullable: true })
  divAddress2: string;

  @Column({ name: "DIV_ADDRESS3", length: 50, nullable: true })
  divAddress3: string;

  @Column({ name: "COUNTRY_CODE", length: 5 })
  countryCode: string;

  @Column({ name: "PHONE", length: 25, nullable: true })
  phone: string;

  @Column({ name: "FAX", length: 25, nullable: true })
  fax: string;

  @Column({ name: "EMAIL", length: 50, nullable: true })
  email: string;

  @Column({ name: "DIV_HEAD_ID", length: 10, nullable: true })
  divHeadId: string;

  @Column({ name: "REMARKS", length: 100, nullable: true })
  remarks: string;

  @Column({ name: "STATUS", length: 1 })
  status: string;

  @Column({ name: "USER_ID", length: 10, nullable: true })
  userId: string;

  @Column({ name: "USER_DT", type: "date", nullable: true })
  userDate: Date;

  @Column({ name: "ENTERPRICE_CODE", length: 5, nullable: true })
  enterpriceCode: string;

  @Column({ name: "PAYROLL_DATE", type: "date", nullable: true })
  payrollDate: Date;

  @Column({ name: "PAYROLL_STATUS", length: 1, nullable: true })
  payrollStatus: string;

  @Column({ name: "NORMAL_WORKING_HRS", type: "number", nullable: true })
  normalWorkingHours: number;

  @Column({ name: "DAY_OFF1", length: 1, nullable: true })
  dayOff1: string;

  @Column({ name: "DAY_OFF2", length: 1, nullable: true })
  dayOff2: string;

  @Column({ name: "HR_REPRESENTATIVE", length: 10, nullable: true })
  hrRepresentative: string;

  @Column({ name: "PAY_MONTH", type: "number", precision: 2, nullable: true })
  payMonth: number;

  @Column({ name: "PAY_YEAR", type: "number", precision: 4, nullable: true })
  payYear: number;

  @Column({ name: "PAYROLL_CALC_TYPE", length: 1, nullable: true })
  payrollCalcType: string;

  @Column({ name: "DAY_OFF1_HALF_DAY", length: 1, nullable: true })
  dayOff1HalfDay: string;

  @Column({ name: "DAY_OFF2_HALF_DAY", length: 1, nullable: true })
  dayOff2HalfDay: string;

  @Column({ name: "FIN_YEAR_START", type: "date", nullable: true })
  finYearStart: Date;

  @Column({ name: "FIN_YEAR_END", type: "date", nullable: true })
  finYearEnd: Date;

  @Column({ name: "BANK_NAME_INV", length: 50, nullable: true })
  bankNameInv: string;

  @Column({ name: "AC_CODE_INV", length: 50, nullable: true })
  acCodeInv: string;

  @Column({ name: "REFERENCE_NO_INV", length: 50, nullable: true })
  referenceNoInv: string;

  @Column({ name: "BANK_ADDRESS_INV", length: 50, nullable: true })
  bankAddressInv: string;

  @Column({ name: "SWIFT_CODE_INV", length: 50, nullable: true })
  swiftCodeInv: string;

  @Column({ name: "EMP_DOCUMENT_PATH", length: 200, nullable: true })
  empDocumentPath: string;

  @Column({ name: "PAYROLL_CUTOFF_DATE", type: "date", nullable: true })
  payrollCutoffDate: Date;

  @Column({ name: "PAYROLL_DAY", type: "number", nullable: true })
  payrollDay: number;

  @Column({ name: "EMP_ACGROUP", length: 10, nullable: true })
  empAcgroup: string;

  @Column({ name: "EMP_CNT", type: "number", nullable: true })
  empCnt: number;

  @Column({ name: "TRN_NO", length: 20, nullable: true })
  trnNo: string;
}
