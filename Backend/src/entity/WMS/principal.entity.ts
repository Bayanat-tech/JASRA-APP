import { Entity, PrimaryColumn, Column } from "typeorm";
import constants from "../../helpers/constants";

@Entity(constants.TABLE.MS_PRINCIPAL)
export class PrincipalMaster {

  @PrimaryColumn({ name: "PRIN_CODE", type: "varchar2", length: 5 })
  prin_code!: string;

  @Column({ name: "COMPANY_CODE", type: "varchar2", length: 20 })
  company_code!: string;

  @Column({ name: "PRIN_NAME", type: "varchar2", length: 50 })
  prin_name!: string;

  @Column({ name: "PRIN_ADDR1", type: "varchar2", length: 50, nullable: true })
  prin_addr1?: string;

  @Column({ name: "PRIN_ADDR2", type: "varchar2", length: 50, nullable: true })
  prin_addr2?: string;

  @Column({ name: "PRIN_ADDR3", type: "varchar2", length: 50, nullable: true })
  prin_addr3?: string;

  @Column({ name: "PRIN_ADDR4", type: "varchar2", length: 50, nullable: true })
  prin_addr4?: string;

  @Column({ name: "PRIN_CITY", type: "varchar2", length: 50, nullable: true })
  prin_city?: string;

  @Column({ name: "COUNTRY_CODE", type: "varchar2", length: 7 })
  country_code!: string;

  @Column({ name: "TAX_COUNTRY_CODE", type: "varchar2", length: 5, nullable: true })
  tax_country_code?: string;

  @Column({ name: "TAX_COUNTRY_SN", type: "varchar2", length: 7, nullable: true })
  tax_country_sn?: string;

  @Column({ name: "SALESMAN_CODE", type: "varchar2", length: 10, nullable: true })
  salesman_code?: string;

  @Column({ name: "SECTOR_CODE", type: "varchar2", length: 10, nullable: true })
  sector_code?: string;

  @Column({ name: "PRIN_CONTACT1", type: "varchar2", length: 100, nullable: true })
  prin_contact1?: string;

  @Column({ name: "PRIN_CONTACT2", type: "varchar2", length: 100, nullable: true })
  prin_contact2?: string;

  @Column({ name: "PRIN_CONTACT3", type: "varchar2", length: 100, nullable: true })
  prin_contact3?: string;

  @Column({ name: "PRIN_EMAIL1", type: "varchar2", length: 40, nullable: true })
  prin_email1?: string;

  @Column({ name: "PRIN_EMAIL2", type: "varchar2", length: 40, nullable: true })
  prin_email2?: string;

  @Column({ name: "PRIN_EMAIL3", type: "varchar2", length: 40, nullable: true })
  prin_email3?: string;

  @Column({ name: "PRIN_TELNO1", type: "varchar2", length: 40, nullable: true })
  prin_telno1?: string;

  @Column({ name: "PRIN_TELNO2", type: "varchar2", length: 40, nullable: true })
  prin_telno2?: string;

  @Column({ name: "PRIN_TELNO3", type: "varchar2", length: 40, nullable: true })
  prin_telno3?: string;

  @Column({ name: "PRIN_FAXNO1", type: "varchar2", length: 40, nullable: true })
  prin_faxno1?: string;

  @Column({ name: "PRIN_FAXNO2", type: "varchar2", length: 40, nullable: true })
  prin_faxno2?: string;

  @Column({ name: "PRIN_FAXNO3", type: "varchar2", length: 40, nullable: true })
  prin_faxno3?: string;

  @Column({ name: "PRIN_REF1", type: "varchar2", length: 50, nullable: true })
  prin_ref1?: string;

  @Column({ name: "PRIN_CONT_EMAIL1", type: "varchar2", length: 40, nullable: true })
  prin_cont_email1?: string;

  @Column({ name: "PRIN_CONT_EMAIL2", type: "varchar2", length: 40, nullable: true })
  prin_cont_email2?: string;

  @Column({ name: "PRIN_CONT_EMAIL3", type: "varchar2", length: 40, nullable: true })
  prin_cont_email3?: string;

  @Column({ name: "PRIN_CONT_TELNO1", type: "varchar2", length: 40, nullable: true })
  prin_cont_telno1?: string;

  @Column({ name: "PRIN_CONT_TELNO2", type: "varchar2", length: 40, nullable: true })
  prin_cont_telno2?: string;

  @Column({ name: "PRIN_CONT_TELNO3", type: "varchar2", length: 40, nullable: true })
  prin_cont_telno3?: string;

  @Column({ name: "PRIN_CONT_FAXNO1", type: "varchar2", length: 40, nullable: true })
  prin_cont_faxno1?: string;

  @Column({ name: "PRIN_CONT_FAXNO2", type: "varchar2", length: 40, nullable: true })
  prin_cont_faxno2?: string;

  @Column({ name: "PRIN_CONT_FAXNO3", type: "varchar2", length: 40, nullable: true })
  prin_cont_faxno3?: string;

  @Column({ name: "PRIN_CONT_REF1", type: "varchar2", length: 50, nullable: true })
  prin_cont_ref1?: string;

  @Column({ name: "PRIN_STATUS", type: "varchar2", length: 5, nullable: true })
  prin_status?: string;

  @Column({ name: "ACC_EMAIL", type: "varchar2", length: 50, nullable: true })
  acc_email?: string;

  @Column({ name: "PRIN_DEPT_CODE", type: "varchar2", length: 3, nullable: true })
  prin_dept_code?: string;

  @Column({ name: "PRIN_ACREF", type: "varchar2", length: 50, nullable: true })
  prin_acref?: string;

  @Column({ name: "TRN_NO", type: "varchar2", length: 30, nullable: true })
  trn_no?: string;

  @Column({ name: "TRN_EXP_DATE", type: "date", nullable: true })
  trn_exp_date?: Date;

  @Column({ name: "PRIN_INVDATE", type: "date", nullable: true })
  prin_invdate?: Date;

  @Column({ name: "CURR_CODE", type: "varchar2", length: 3, nullable: true })
  curr_code?: string;

  @Column({ name: "PRIN_BACKDT", type: "number", nullable: true })
  prin_backdt?: number;

  @Column({ name: "PRIN_INFZE", type: "char", length: 1, nullable: true })
  prin_infze?: string;

  @Column({ name: "CREDIT_LIMIT", type: "number", nullable: true })
  credit_limit?: number;

  @Column({ name: "CREDITDAYS", type: "number", nullable: true })
  creditdays?: number;

  @Column({ name: "CREDITDAYS_FREIGHT", type: "number", nullable: true })
  creditdays_freight?: number;

  @Column({ name: "PRIN_LIC_NO", type: "varchar2", length: 25, nullable: true })
  prin_lic_no?: string;

  @Column({ name: "PRIN_LIC_TYPE", type: "varchar2", length: 25, nullable: true })
  prin_lic_type?: string;

  @Column({ name: "COMM_REG_NO", type: "varchar2", length: 25, nullable: true })
  comm_reg_no?: string;

  @Column({ name: "COMM_REG_EXP_DATE", type: "date", nullable: true })
  comm_reg_exp_date?: Date;

  @Column({ name: "PRIN_IMP_CODE", type: "varchar2", length: 25, nullable: true })
  prin_imp_code?: string;

  @Column({ name: "PARENT_PRIN_CODE", type: "varchar2", length: 5, nullable: true })
  parent_prin_code?: string;

  @Column({ name: "PICK_WAVE", type: "varchar2", length: 25, nullable: true, default: "'FEFO'" })
  pick_wave?: string;

  @Column({ name: "PICK_WAVE_QTY_SORT", type: "char", length: 1, nullable: true, default: "'Y'" })
  pick_wave_qty_sort?: string;

  @Column({ name: "PICK_WAVE_IGN_MIN_EXP", type: "char", length: 1, nullable: true, default: "'N'" })
  pick_wave_ign_min_exp?: string;

  @Column({ name: "PREF_SITE", type: "varchar2", length: 5, nullable: true })
  pref_site?: string;

  @Column({ name: "PREF_LOC_FROM", type: "varchar2", length: 15, nullable: true })
  pref_loc_from?: string;

  @Column({ name: "PREF_LOC_TO", type: "varchar2", length: 15, nullable: true })
  pref_loc_to?: string;

  @Column({ name: "PREF_AISLE_FROM", type: "varchar2", length: 5, nullable: true })
  pref_aisle_from?: string;

  @Column({ name: "PREF_AISLE_TO", type: "varchar2", length: 5, nullable: true })
  pref_aisle_to?: string;

  @Column({ name: "PREF_COL_FROM", type: "number", nullable: true })
  pref_col_from?: number;

  @Column({ name: "PREF_COL_TO", type: "number", nullable: true })
  pref_col_to?: number;

  @Column({ name: "PREF_HT_FROM", type: "number", nullable: true })
  pref_ht_from?: number;

  @Column({ name: "PREF_HT_TO", type: "number", nullable: true })
  pref_ht_to?: number;

  @Column({ name: "PRIN_SITEIND", type: "varchar2", length: 5, nullable: true })
  prin_siteind?: string;

  @Column({ name: "SERVICE_DATE", type: "date", nullable: true })
  service_date?: Date;

  @Column({ name: "STORAGE_TYPE", type: "varchar2", length: 10, nullable: true })
  storage_type?: string;

  @Column({ name: "DEFAULT_FOC", type: "varchar2", length: 6, nullable: true })
  default_foc?: string;

  @Column({ name: "UNDER_VALUE", type: "char", length: 1, nullable: true, default: "'N'" })
  under_value?: string;

  @Column({ name: "AUTO_INSERT_BILLACTIVITY", type: "char", length: 1, nullable: true })
  auto_insert_billactivity?: string;

  @Column({ name: "PRIN_CHARGE", type: "char", length: 1, nullable: true })
  prin_charge?: string;

  @Column({ name: "PRIN_PRICECHK", type: "char", length: 1, nullable: true })
  prin_pricechk?: string;

  @Column({ name: "PRIN_LANDEDPR", type: "char", length: 1, nullable: true })
  prin_landedpr?: string;

  @Column({ name: "AUTO_JOB", type: "char", length: 1, nullable: true })
  auto_job?: string;

  @Column({ name: "VALIDATE_LOTNO", type: "char", length: 1, nullable: true })
  validate_lotno?: string;

  @Column({ name: "STORAGE_PRODUCTWISE", type: "char", length: 1, nullable: true })
  storage_productwise?: string;

  @Column({ name: "VALIDATE_EXPDATE", type: "date", nullable: true })
  validate_expdate?: Date;

  @Column({ name: "MINPERIOD_EXPPICK", type: "number", nullable: true })
  minperiod_exppick?: number;

  @Column({ name: "RCPT_EXP_LIMIT", type: "number", nullable: true })
  rcpt_exp_limit?: number;

  @Column({ name: "PERPECTUAL_CONFIRM_ALLOW", type: "char", length: 1, nullable: true })
  perpectual_confirm_allow?: string;

  @Column({ name: "AUTOMATE_ACTIVITY", type: "char", length: 1, nullable: true })
  automate_activity?: string;

  @Column({ name: "TERRITORY_CODE", type: "varchar2", length: 10, nullable: true })
  territory_code?: string;

  @Column({ name: "DIR_SHPMNT", type: "char", length: 1, nullable: true, default: "'N'" })
  dir_shpmnt?: string;

  @Column({ name: "PRIN_GRNNO", type: "number", nullable: true })
  prin_grnno?: number;

  @Column({ name: "PRIN_LICENSE", type: "varchar2", length: 100, nullable: true })
  prin_licence?: string;

  @Column({ name: "DIV_CODE", type: "varchar2", length: 10, nullable: true })
  div_code?: string;

  @Column({ name: "BACKORDER_PICK", type: "varchar2", length: 5, nullable: true })
  backorder_pick?: string;

  @Column({ name: "BOX_NO", type: "varchar2", length: 10, nullable: true })
  box_no?: string;

  @Column({ name: "CREATED_AT", type: "date", nullable: true })
  created_at?: Date;

  @Column({ name: "CREATED_BY", type: "varchar2", length: 20, nullable: true })
  created_by?: string;

  @Column({ name: "UPDATED_AT", type: "date", nullable: true })
  updated_at?: Date;

  @Column({ name: "UPDATED_BY", type: "varchar2", length: 50, nullable: true })
  updated_by?: string;
}
