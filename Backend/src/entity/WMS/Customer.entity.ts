import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_CUSTOMER)
export class CustomerMaster {

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code!: string;

  @PrimaryColumn({ name: "CUST_CODE", type: "varchar2", length: 20 })
  cust_code!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code!: string;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ name: "COUNTRY_CODE", type: "varchar2", length: 5, nullable: true })
  country_code?: string;

  @Column({ name: "CUST_NAME", type: "varchar2", length: 250, nullable: true })
  cust_name?: string;

  @Column({ name: "CUST_ADDR1", type: "varchar2", length: 50, nullable: true })
  cust_addr1?: string;

  @Column({ name: "CUST_ADDR2", type: "varchar2", length: 50, nullable: true })
  cust_addr2?: string;

  @Column({ name: "CUST_ADDR3", type: "varchar2", length: 50, nullable: true })
  cust_addr3?: string;

  @Column({ name: "CUST_ADDR4", type: "varchar2", length: 50, nullable: true })
  cust_addr4?: string;

  @Column({ name: "CUST_CITY", type: "varchar2", length: 50, nullable: true })
  cust_city?: string;

  @Column({ name: "CUST_CONTACT1", type: "varchar2", length: 50, nullable: true })
  cust_contact1?: string;

  @Column({ name: "CUST_TELNO1", type: "varchar2", length: 50, nullable: true })
  cust_telno1?: string;

  @Column({ name: "CUST_FAXNO1", type: "varchar2", length: 50, nullable: true })
  cust_faxno1?: string;

  @Column({ name: "CUST_EMAIL1", type: "varchar2", length: 50, nullable: true })
  cust_email1?: string;

  @Column({ name: "CUST_CONTACT2", type: "varchar2", length: 50, nullable: true })
  cust_contact2?: string;

  @Column({ name: "CUST_TELNO2", type: "varchar2", length: 50, nullable: true })
  cust_telno2?: string;

  @Column({ name: "CUST_FAXNO2", type: "varchar2", length: 50, nullable: true })
  cust_faxno2?: string;

  @Column({ name: "CUST_EMAIL2", type: "varchar2", length: 50, nullable: true })
  cust_email2?: string;

  @Column({ name: "CUST_CONTACT3", type: "varchar2", length: 50, nullable: true })
  cust_contact3?: string;

  @Column({ name: "CUST_TELNO3", type: "varchar2", length: 50, nullable: true })
  cust_telno3?: string;

  @Column({ name: "CUST_FAXNO3", type: "varchar2", length: 50, nullable: true })
  cust_faxno3?: string;

  @Column({ name: "CUST_REF1", type: "varchar2", length: 50, nullable: true })
  cust_ref1?: string;

  @Column({ name: "CUST_REF2", type: "varchar2", length: 50, nullable: true })
  cust_ref2?: string;

  @Column({ name: "CUST_REF3", type: "varchar2", length: 50, nullable: true })
  cust_ref3?: string;

  @Column({ name: "SERVICE_DATE", type: "date", nullable: true })
  service_date?: Date;

  @Column({ name: "CUST_ACREF", type: "varchar2", length: 10, nullable: true })
  cust_acref?: string;

  @Column({ name: "CUST_CREDIT", type: "int", nullable: true })
  cust_credit?: number;

  @Column({ name: "CUST_STAT", type: "varchar2", length: 5, nullable: true })
  cust_stat?: string;

  @Column({ name: "CUST_IMP_CODE", type: "varchar2", length: 25, nullable: true })
  cust_imp_code?: string;

  @Column({ name: "CUST_LIC_NO", type: "varchar2", length: 25, nullable: true })
  cust_lic_no?: string;

  @Column({ name: "CUST_LIC_TYPE", type: "varchar2", length: 25, nullable: true })
  cust_lic_type?: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, default: () => "USER", nullable: true })
  user_id?: string;

  @Column({ name: "DATE_TIME", type: "date", nullable: true })
  date_time?: Date;

  @Column({ name: "PRICE_CHECK", type: "varchar2", length: 1, nullable: true })
  price_check?: string;

  @Column({ name: "CUST_EMAIL3", type: "varchar2", length: 50, nullable: true })
  cust_email3?: string;

  @Column({ name: "PAYMENT_TERMS", type: "int", nullable: true })
  payment_terms?: number;

  @Column({ name: "IMPORTER_CODE", type: "varchar2", length: 40, nullable: true })
  importer_code?: string;

  @Column({ name: "REFF_CUST_CODE", type: "varchar2", length: 25, nullable: true })
  reff_cust_code?: string;

  @Column({ name: "MIN_EXP_DAYS", type: "number", nullable: true })
  min_exp_days?: number;

  @Column({ name: "CUST_MOBILE_NO", type: "varchar2", length: 10, nullable: true })
  cust_mobile_no?: string;

  @Column({ name: "VAT_NO", type: "varchar2", length: 20, nullable: true })
  vat_no?: string;

  @Column({ name: "CUST_PHOTO", type: "varchar2", length: 200, nullable: true })
  cust_photo?: string;

  @Column({ name: "LABEL_SEQ_NO", type: "number", nullable: true })
  label_seq_no?: number;

  @Column({ name: "CUST_PREFIX", type: "varchar2", length: 5, nullable: true })
  cust_prefix?: string;

  @Column({ name: "ACT_CODE", type: "varchar2", length: 5, nullable: true })
  act_code?: string;

  @Column({ name: "ZONE_ID", type: "varchar2", length: 10, nullable: true })
  zone_id?: string;
}
