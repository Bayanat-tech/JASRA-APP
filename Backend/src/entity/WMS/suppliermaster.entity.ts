import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_SUPPLIER_JASRA)
export class SupplierMaster {

  @PrimaryColumn({ name: "COMPANY_CODE", type: "varchar2", length: 5 })
  company_code!: string;

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code!: string;

  @PrimaryColumn({ name: "SUPP_CODE", type: "varchar2", length: 5 })
  supp_code!: string;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ name: "COUNTRY_CODE", type: "varchar2", length: 5, nullable: true })
  country_code?: string;

  @Column({ name: "SUPP_NAME", type: "varchar2", length: 50, nullable: true })
  supp_name?: string;

  @Column({ name: "SUPP_ADDR1", type: "varchar2", length: 50, nullable: true })
  supp_addr1?: string;

  @Column({ name: "SUPP_ADDR2", type: "varchar2", length: 50, nullable: true })
  supp_addr2?: string;

  @Column({ name: "SUPP_ADDR3", type: "varchar2", length: 50, nullable: true })
  supp_addr3?: string;

  @Column({ name: "SUPP_ADDR4", type: "varchar2", length: 50, nullable: true })
  supp_addr4?: string;

  @Column({ name: "SUPP_CITY", type: "varchar2", length: 50, nullable: true })
  supp_city?: string;

  @Column({ name: "SUPP_CONTACT1", type: "varchar2", length: 50, nullable: true })
  supp_contact1?: string;

  @Column({ name: "SUPP_TELNO1", type: "varchar2", length: 50, nullable: true })
  supp_telno1?: string;

  @Column({ name: "SUPP_FAXNO1", type: "varchar2", length: 50, nullable: true })
  supp_faxno1?: string;

  @Column({ name: "SUPP_EMAIL1", type: "varchar2", length: 50, nullable: true })
  supp_email1?: string;

  @Column({ name: "SUPP_CONTACT2", type: "varchar2", length: 50, nullable: true })
  supp_contact2?: string;

  @Column({ name: "SUPP_TELNO2", type: "varchar2", length: 50, nullable: true })
  supp_telno2?: string;

  @Column({ name: "SUPP_FAXNO2", type: "varchar2", length: 50, nullable: true })
  supp_faxno2?: string;

  @Column({ name: "SUPP_EMAIL2", type: "varchar2", length: 50, nullable: true })
  supp_email2?: string;

  @Column({ name: "SUPP_CONTACT3", type: "varchar2", length: 50, nullable: true })
  supp_contact3?: string;

  @Column({ name: "SUPP_TELNO3", type: "varchar2", length: 50, nullable: true })
  supp_telno3?: string;

  @Column({ name: "SUPP_FAXNO3", type: "varchar2", length: 50, nullable: true })
  supp_faxno3?: string;

  @Column({ name: "SUPP_REF1", type: "varchar2", length: 50, nullable: true })
  supp_ref1?: string;

  @Column({ name: "SUPP_REF2", type: "varchar2", length: 50, nullable: true })
  supp_ref2?: string;

  @Column({ name: "SUPP_REF3", type: "varchar2", length: 50, nullable: true })
  supp_ref3?: string;

  @Column({ name: "SERVICE_DATE", type: "date", nullable: true })
  service_date?: Date;

  @Column({ name: "SUPP_ACREF", type: "varchar2", length: 10, nullable: true })
  supp_acref?: string;

  @Column({ name: "SUPP_CREDIT", type: "int", nullable: true })
  supp_credit?: number;

  @Column({ name: "SUPP_STAT", type: "varchar2", length: 5, nullable: true })
  supp_stat?: string;

  @Column({ name: "SUPP_IMP_CODE", type: "varchar2", length: 25, nullable: true })
  supp_imp_code?: string;

  @Column({ name: "SUPP_LIC_NO", type: "varchar2", length: 25, nullable: true })
  supp_lic_no?: string;

  @Column({ name: "SUPP_LIC_TYPE", type: "varchar2", length: 25, nullable: true })
  supp_lic_type?: string;

  @Column({ name: "USER_ID", type: "varchar2", length: 10, default: () => "USER", nullable: true })
  user_id?: string;

  @Column({ name: "DATE_TIME", type: "date", nullable: true })
  date_time?: Date;

  @Column({ name: "PRICE_CHECK", type: "varchar2", length: 1, nullable: true })
  price_check?: string;

  @Column({ name: "SUPP_EMAIL3", type: "varchar2", length: 50, nullable: true })
  supp_email3?: string;

  @Column({ name: "PAYMENT_TERMS", type: "int", nullable: true })
  payment_terms?: number;

  @Column({ name: "IMPORTER_CODE", type: "varchar2", length: 40, nullable: true })
  importer_code?: string;

  @Column({ name: "TERRITORY_CODE", type: "varchar2", length: 10, nullable: true })
  territory_code?: string;

  @Column({ name: "TRN_NO", type: "varchar2", length: 30, nullable: true })
  trn_no?: string;

  @Column({ name: "PRIN_INFZE", type: "varchar2", length: 1, default: () => "'N'" })
  prin_infze!: string;

  @Column({ name: "TAX_REGISTRD", type: "varchar2", length: 1, default: () => "'N'" })
  tax_registrd!: string;
}
