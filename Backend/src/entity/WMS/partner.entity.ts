import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_BROKER)
export class BrokerMaster {

  @PrimaryColumn({ name: "BROKER_CODE", type: "varchar2", length: 5 })
  broker_code!: string;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ name: "COUNTRY_CODE", type: "varchar2", length: 5, nullable: true })
  country_code?: string;

  @Column({ name: "BROKER_NAME", type: "varchar2", length: 50, nullable: true })
  broker_name?: string;

  @Column({ name: "BROKER_ADDR1", type: "varchar2", length: 50, nullable: true })
  broker_addr1?: string;

  @Column({ name: "BROKER_ADDR2", type: "varchar2", length: 50, nullable: true })
  broker_addr2?: string;

  @Column({ name: "BROKER_ADDR3", type: "varchar2", length: 50, nullable: true })
  broker_addr3?: string;

  @Column({ name: "BROKER_ADDR4", type: "varchar2", length: 50, nullable: true })
  broker_addr4?: string;

  @Column({ name: "BROKER_CITY", type: "varchar2", length: 50, nullable: true })
  broker_city?: string;

  @Column({ name: "BROKER_CONTACT1", type: "varchar2", length: 50, nullable: true })
  broker_contact1?: string;

  @Column({ name: "BROKER_TELNO1", type: "varchar2", length: 50, nullable: true })
  broker_telno1?: string;

  @Column({ name: "BROKER_FAXNO1", type: "varchar2", length: 50, nullable: true })
  broker_faxno1?: string;

  @Column({ name: "BROKER_EMAIL1", type: "varchar2", length: 50, nullable: true })
  broker_email1?: string;

  @Column({ name: "BROKER_CONTACT2", type: "varchar2", length: 50, nullable: true })
  broker_contact2?: string;

  @Column({ name: "BROKER_TELNO2", type: "varchar2", length: 50, nullable: true })
  broker_telno2?: string;

  @Column({ name: "BROKER_FAXNO2", type: "varchar2", length: 50, nullable: true })
  broker_faxno2?: string;

  @Column({ name: "BROKER_EMAIL2", type: "varchar2", length: 50, nullable: true })
  broker_email2?: string;

  @Column({ name: "BROKER_CONTACT3", type: "varchar2", length: 50, nullable: true })
  broker_contact3?: string;

  @Column({ name: "BROKER_TELNO3", type: "varchar2", length: 50, nullable: true })
  broker_telno3?: string;

  @Column({ name: "BROKER_FAXNO3", type: "varchar2", length: 50, nullable: true })
  broker_faxno3?: string;

  @Column({ name: "BROKER_REF1", type: "varchar2", length: 50, nullable: true })
  broker_ref1?: string;

  @Column({ name: "BROKER_REF2", type: "varchar2", length: 50, nullable: true })
  broker_ref2?: string;

  @Column({ name: "BROKER_REF3", type: "varchar2", length: 50, nullable: true })
  broker_ref3?: string;

  @Column({ name: "SERVICE_DATE", type: "date", nullable: true })
  service_date?: Date;

  @Column({ name: "BROKER_ACREF", type: "varchar2", length: 10, nullable: true })
  broker_acref?: string;

  @Column({ name: "BROKER_CREDIT", type: "int", nullable: true })
  broker_credit?: number;

  @Column({ name: "BROKER_STAT", type: "varchar2", length: 5, nullable: true })
  broker_stat?: string;

  @Column({ name: "BROKER_IMP_CODE", type: "varchar2", length: 25, nullable: true })
  broker_imp_code?: string;

  @Column({ name: "BROKER_LIC_NO", type: "varchar2", length: 25, nullable: true })
  broker_lic_no?: string;

  @Column({ name: "BROKER_LIC_TYPE", type: "varchar2", length: 25, nullable: true })
  broker_lic_type?: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, default: () => "USER", nullable: true })
  user_id?: string;

  @Column({ name: "DATE_TIME", type: "date", nullable: true })
  date_time?: Date;

  @Column({ name: "PRICE_CHECK", type: "varchar2", length: 1, nullable: true })
  price_check?: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code!: string;

  @Column({ name: "BROKER_EMAIL3", type: "varchar2", length: 50, nullable: true })
  broker_email3?: string;

  @Column({ name: "PAYMENT_TERMS", type: "int", nullable: true })
  payment_terms?: number;

  @Column({ name: "IMPORTER_CODE", type: "varchar2", length: 40, nullable: true })
  importer_code?: string;

  @Column({ name: "PARTNER_TYPE", type: "varchar2", length: 1, nullable: true })
  partner_type?: string;

  @Column({ name: "TAX_COUNTRY_CODE", type: "varchar2", length: 5, nullable: true })
  tax_country_code?: string;

  @Column({ name: "TAX_REGISTRD", type: "char", length: 1, default: () => "'N'" })
  tax_registrd!: string;

  @Column({ name: "PRIN_INFZE", type: "char", length: 1, default: () => "'N'" })
  prin_infze!: string;

  @Column({ name: "TRN_NO", type: "varchar2", length: 30, nullable: true })
  trn_no?: string;

  @Column({ name: "TERRITORY_CODE", type: "varchar2", length: 10, nullable: true })
  territory_code?: string;
}
