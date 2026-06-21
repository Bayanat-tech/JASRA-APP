import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import constants from "../../../../helpers/constants";
import AccountLevelFour from "./account_level_four.model";


@Entity(constants.TABLE.MS_ACCODES)
export class Account {
  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 7 })
  company_code!: string;

  @PrimaryColumn({ name: "AC_CODE", type: "varchar2", length: 13 })
  ac_code!: string;

  @Column({ name: "AC_NAME", type: "varchar2", length: 100 })
  ac_name!: string;

  @Column({ name: "COUNTRY_CODE", type: "varchar2", length: 10, nullable: true })
  country_code?: string;

  @Column({ name: "TERRITORY_CODE", type: "varchar2", length: 10, nullable: true })
  territory_code?: string;

  @Column({ name: "ADDRESS_1", type: "varchar2", length: 255, nullable: true })
  address_1?: string;

  @Column({ name: "ADDRESS_2", type: "varchar2", length: 100, nullable: true })
  address_2?: string;

  @Column({ name: "ADDRESS_3", type: "varchar2", length: 100, nullable: true })
  address_3?: string;

  @Column({ name: "PHONE", type: "varchar2", length: 50, nullable: true })
  phone?: string;

  @Column({ name: "FAX", type: "varchar2", length: 50, nullable: true })
  fax?: string;

  @Column({ name: "E_MAIL", type: "varchar2", length: 50, nullable: true })
  e_mail?: string;

  @Column({ name: "CONTACT_PERSON", type: "varchar2", length: 50, nullable: true })
  contact_person?: string;

  @Column({ name: "MOBILE_NO", type: "varchar2", length: 50, nullable: true })
  mobile_no?: string;

  @Column({ name: "EXP_ALLOC", type: "char", length: 1, nullable: true })
  exp_alloc?: string;

  @Column({ name: "L4_CODE", type: "varchar2", length: 8, nullable: true })
  l4_code?: string;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 5, nullable: true })
  curr_code?: string;

  @Column({ name: "AC_TYPE", type: "char", length: 1, nullable: true })
  ac_type?: string;

  @Column({ name: "AC_ACTIVE", type: "char", length: 1, nullable: true })
  ac_active?: string;

  @Column({ name: "CREDIT_PERIOD", type: "number", nullable: true })
  credit_period?: number;

  @Column({ name: "CREDIT_AMOUNT", type: "number", precision: 18, scale: 4, nullable: true })
  credit_amount?: number;

  @Column({ name: "AC_CLOSED_REASON", type: "varchar2", length: 50, nullable: true })
  ac_closed_reason?: string;

  @Column({ name: "EXP_TYPE_CODE", type: "varchar2", length: 3, nullable: true })
  exp_type_code?: string;

  @Column({ name: "PL_BL_CODE", type: "varchar2", length: 10, nullable: true })
  pl_bl_code?: string;

  @Column({ name: "AC_STATUS", type: "char", length: 1, nullable: true })
  ac_status?: string;

  @Column({ name: "DEPT_CODE", type: "varchar2", length: 10, nullable: true })
  dept_code?: string;

  @Column({ name: "EXP_SUBTYPE_CODE", type: "varchar2", length: 10, nullable: true })
  exp_subtype_code?: string;

  @Column({ name: "BANK_AC_CODE", type: "varchar2", length: 50, nullable: true })
  bank_ac_code?: string;

  @Column({ name: "BANK_NAME", type: "varchar2", length: 70, nullable: true })
  bank_name?: string;

  @Column({ name: "BANK_SWIFT", type: "varchar2", length: 50, nullable: true })
  bank_swift?: string;

  @Column({ name: "SALESMAN_CODE", type: "varchar2", length: 10, nullable: true })
  salesman_code?: string;

  @Column({ name: "SECTOR_CODE", type: "varchar2", length: 10, nullable: true })
  sector_code?: string;

  @Column({ name: "EXP_TYPE_CODE_BACK", type: "varchar2", length: 3, nullable: true })
  exp_type_code_back?: string;

  @Column({ name: "EXP_SUBTYPE_CODE_BACK", type: "varchar2", length: 10, nullable: true })
  exp_subtype_code_back?: string;

  @Column({ name: "CONTRACT_EXPRY_DATE", type: "date", nullable: true })
  contract_expry_date?: Date;

  @Column({ name: "BI_MAIN_GROUP", type: "varchar2", length: 50, nullable: true })
  bi_main_group?: string;

  @Column({ name: "BI_SUB_GROUP", type: "varchar2", length: 50, nullable: true })
  bi_sub_group?: string;

  @Column({ name: "BI_EXP_TYPE", type: "varchar2", length: 100, nullable: true })
  bi_exp_type?: string;

  @Column({ name: "BI_PL_BS_IND", type: "varchar2", length: 10, nullable: true })
  bi_pl_bs_ind?: string;

  @Column({ name: "BI_DEPT", type: "varchar2", length: 50, nullable: true })
  bi_dept?: string;

  @Column({ name: "TRN_NO", type: "varchar2", length: 30, nullable: true })
  trn_no?: string;

  @Column({ name: "AC_INFZE", type: "char", length: 1, nullable: true })
  ac_infze?: string;

  @Column({ name: "TAX_REGISTRD", type: "char", length: 1, nullable: true })
  tax_registrd?: string;

  @Column({ name: "CITY_NAME", type: "varchar2", length: 100, nullable: true })
  city_name?: string;

  @Column({ name: "TAX_COUNTRY_CODE", type: "varchar2", length: 5, nullable: true })
  tax_country_code?: string;

  @Column({ name: "RCM_APPLY", type: "char", length: 1, nullable: true })
  rcm_apply?: string;

  @Column({ name: "APPROVED_BY", type: "varchar2", length: 10, nullable: true })
  approved_by?: string;

  @Column({ name: "APPROVED_DATE", type: "date", nullable: true })
  approved_date?: Date;

  @Column({ name: "CR_NO", type: "varchar2", length: 50, nullable: true })
  cr_no?: string;

  @Column({ name: "APPRVAL_FACTOR", type: "char", length: 1, nullable: true })
  apprval_factor?: string;

  @Column({ name: "REQUEST_NUMBER", type: "varchar2", length: 20, nullable: true })
  request_number?: string;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ name: "CREATED_AT", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @Column({ name: "UPDATED_AT", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at!: Date;

  // Relation with AccountLevelFour
  @ManyToOne(() => AccountLevelFour, (l4: { accounts: any; }) => l4.accounts)
  @JoinColumn({ name: "L4_CODE", referencedColumnName: "l4_code" })
  account_level_four?: AccountLevelFour;
}
