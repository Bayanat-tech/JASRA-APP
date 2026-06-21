import { Entity, PrimaryColumn, Column } from 'typeorm';
import constants from "../../helpers/constants";
@Entity(constants.TABLE.MS_AC_SETUP)
export class AcSetup {
  @PrimaryColumn({ name: 'COMPANY_CODE', type: 'varchar', length: 5 })
  companyCode: string;

  @PrimaryColumn({ name: 'AC_CODE', type: 'varchar', length: 15 })
  acCode: string;

  @Column({ name: 'PDC_RECEIPT_CODE', type: 'varchar', length: 13, nullable: true })
  pdcReceiptCode: string;

  @Column({ name: 'PDC_ISSUE_CODE', type: 'varchar', length: 13, nullable: true })
  pdcIssueCode: string;

  @Column({ name: 'DOC_DATE_EDITABLE', type: 'varchar', length: 1, nullable: true })
  docDateEditable: string;

  @Column({ name: 'BANK_NAME', type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @Column({ name: 'AC_NAME', type: 'varchar', length: 70, nullable: true })
  acName: string;

  @Column({ name: 'SWIFT_CODE', type: 'varchar', length: 100, nullable: true })
  swiftCode: string;

  @Column({ name: 'BASE_CURR_CODE', type: 'varchar', length: 5, nullable: true })
  baseCurrCode: string;

  @Column({ name: 'PRICE_DECIMAL_NOS', type: 'numeric', precision: 2, nullable: true })
  priceDecimalNos: number;

  @Column({ name: 'AMOUNT_DECIMAL_NOS', type: 'numeric', precision: 2, nullable: true })
  amountDecimalNos: number;

  @Column({ name: 'LCUR_DECIMAL_NOS', type: 'numeric', precision: 2, nullable: true })
  lcurDecimalNos: number;

  @Column({ name: 'QTY_DECIMAL_NOS', type: 'numeric', precision: 2, nullable: true })
  qtyDecimalNos: number;

  @Column({ name: 'FINANCIAL_YR_START', type: 'date', nullable: true })
  financialYrStart: Date;

  @Column({ name: 'FINANCIAL_YR_END', type: 'date', nullable: true })
  financialYrEnd: Date;

  @Column({ name: 'DOC_EDIT_FROM', type: 'date', nullable: true })
  docEditFrom: Date;

  @Column({ name: 'DOC_EDIT_TO', type: 'date', nullable: true })
  docEditTo: Date;

  @Column({ name: 'JOB_CLASS', type: 'varchar', length: 1, nullable: true })
  jobClass: string;

  @Column({ name: 'EXCHANGE_DIFF_AC', type: 'varchar', length: 15, nullable: true })
  exchangeDiffAc: string;

  @Column({ name: 'PRINCIPAL_AC_GROUP', type: 'varchar', length: 5, nullable: true })
  principalAcGroup: string;

  @Column({ name: 'EXPSUBTYPE_ACCIDENT', type: 'varchar', length: 10, nullable: true })
  expsubtypeAccident: string;

  @Column({ name: 'EXPSUBTYPE_FINE', type: 'varchar', length: 10, nullable: true })
  expsubtypeFine: string;

  @Column({ name: 'EXPSUBTYPE_FUEL', type: 'varchar', length: 10, nullable: true })
  expsubtypeFuel: string;

  @Column({ name: 'EXPSUBTYPE_INS', type: 'varchar', length: 10, nullable: true })
  expsubtypeIns: string;

  @Column({ name: 'EXPSUBTYPE_REG', type: 'varchar', length: 10, nullable: true })
  expsubtypeReg: string;

  @Column({ name: 'EXPSUBTYPE_REPAIR', type: 'varchar', length: 10, nullable: true })
  expsubtypeRepair: string;

  @Column({ name: 'EXPSUBTYPE_SERVICE', type: 'varchar', length: 10, nullable: true })
  expsubtypeService: string;

  @Column({ name: 'SUPPLIER_AC_GROUP', type: 'varchar', length: 5, nullable: true })
  supplierAcGroup: string;

  @Column({ name: 'EXPCODE_VEHICLE', type: 'varchar', length: 5, nullable: true })
  expcodeVehicle: string;

  @Column({ name: 'AGE_1', type: 'numeric', precision: 10, nullable: true })
  age1: number;

  @Column({ name: 'AGE_2', type: 'numeric', precision: 10, nullable: true })
  age2: number;

  @Column({ name: 'AGE_3', type: 'numeric', precision: 10, nullable: true })
  age3: number;

  @Column({ name: 'AGE_4', type: 'numeric', precision: 10, nullable: true })
  age4: number;

  @Column({ name: 'AGE_5', type: 'numeric', precision: 10, nullable: true })
  age5: number;

  @Column({ name: 'DOCNO_TYPE', type: 'varchar', length: 10, nullable: true })
  docnoType: string;

  @Column({ name: 'INTERCOMPANY_AC_GROUP', type: 'varchar', length: 15, nullable: true })
  intercompanyAcGroup: string;

  @Column({ name: 'MULTY_DIV_ACCOUNTING', type: 'varchar', length: 1, nullable: true, default: 'N' })
  multyDivAccounting: string;

  @Column({ name: 'BILL_SETTLE_LCUR', type: 'varchar', length: 1, nullable: true, default: 'N' })
  billSettleLcur: string;

  @Column({ name: 'DEFAULT_TAX_BSTYPE', type: 'varchar', length: 10, nullable: true })
  defaultTaxBstype: string;

  @Column({ name: 'AGE_6', type: 'numeric', nullable: true })
  age6: number;

  @Column({ name: 'UPDATED_AT', type: 'date', nullable: true })
  updatedAt: Date;

  @Column({ name: 'UPDATED_BY', type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @Column({ name: 'CREATED_BY', type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'CREATED_AT', type: 'date', nullable: true })
  createdAt: Date;

  @Column({ name: 'TAX_PERC', type: 'numeric', precision: 5, scale: 2, nullable: true })
  taxPerc: number;
}
