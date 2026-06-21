import { Entity, Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'VW_WM_INB_TT_BATCH_DETS'
})
export class ConfirmInboundjob {
  @PrimaryColumn({ name: 'COMPANY_CODE', type: 'varchar', length: 7 })
  companyCode: string;

  @PrimaryColumn({ name: 'PRIN_CODE', type: 'varchar', length: 5 })
  prinCode: string;

  @PrimaryColumn({ name: 'JOB_NO', type: 'varchar', length: 10 })
  jobNo: string;

  @Column({ name: 'TXN_TYPE', type: 'varchar', length: 40 })
  txnType: string;

  @Column({ name: 'TXN_DATE', type: 'date' })
  txnDate: Date;

  @Column({ name: 'KEY_NUMBER', type: 'varchar', length: 40 })
  keyNumber: string;

  @PrimaryColumn({ name: 'PACKDET_NO', type: 'number' })
  packdetNo: number;

  @Column({ name: 'SITE_CODE', type: 'varchar', length: 40 })
  siteCode: string;

  @Column({ name: 'LOCATION_CODE', type: 'varchar', length: 15, nullable: true })
  locationCode: string;

  @Column({ name: 'PROD_CODE', type: 'varchar', length: 40 })
  prodCode: string;

  @Column({ name: 'PROD_NAME', type: 'varchar', length: 50, nullable: true })
  prodName: string;

  @Column({ name: 'QTY_PUOM', type: 'number', precision: 12, scale: 1 })
  qtyPuom: number;

  @Column({ name: 'P_UOM', type: 'varchar', length: 5 })
  pUom: string;

  @Column({ name: 'QTY_LUOM', type: 'number', precision: 12, scale: 1 })
  qtyLuom: number;

  @Column({ name: 'L_UOM', type: 'varchar', length: 5 })
  lUom: string;

  @Column({ name: 'QUANTITY', type: 'number', precision: 12, scale: 1 })
  quantity: number;

  @Column({ name: 'QTY_CONFIRMED', type: 'varchar', length: 20, nullable: true })
  qtyConfirmed: string;

  @Column({ name: 'PQTY_CONFIRMED', type: 'number', precision: 12, scale: 1 })
  pqtyConfirmed: number;

  @Column({ name: 'LQTY_CONFIRMED', type: 'number', precision: 12, scale: 1 })
  lqtyConfirmed: number;

  @Column({ name: 'PUOM_CONFIRMED', type: 'varchar', length: 20, nullable: true })
  puomConfirmed: string;

  @Column({ name: 'LUOM_CONFIRMED', type: 'varchar', length: 20, nullable: true })
  luomConfirmed: string;

  @Column({ name: 'LOT_NO', type: 'varchar', length: 20, nullable: true })
  lotNo: string;

  @Column({ name: 'PO_NO', type: 'varchar', length: 20, nullable: true })
  poNo: string;

  @Column({ name: 'BL_NO', type: 'varchar', length: 20, nullable: true })
  blNo: string;

  @Column({ name: 'MFG_DATE', type: 'date' })
  mfgDate: Date;

  @Column({ name: 'EXP_DATE', type: 'date' })
  expDate: Date;

  @Column({ name: 'VESSEL_NAME', type: 'varchar', length: 20, nullable: true })
  vesselName: string;

  @Column({ name: 'UPP', type: 'varchar', length: 20, nullable: true })
  upp: string;

  @Column({ name: 'CURR_CODE', type: 'varchar', length: 3, nullable: true })
  currCode: string;

  @Column({ name: 'EX_RATE', type: 'number', precision: 15, scale: 5, nullable: true })
  exRate: number;

  @Column({ name: 'DOC_REF', type: 'varchar', length: 20, nullable: true })
  docRef: string;

  @Column({ name: 'SELECTED', type: 'varchar', length: 1, nullable: true })
  selected: string;

  @Column({ name: 'RECEIPT_TYPE', type: 'varchar', length: 1, nullable: true })
  receiptType: string;

  @Column({ name: 'ALLOCATED', type: 'varchar', length: 1, nullable: true })
  allocated: string;

  @Column({ name: 'PALLET_ID', type: 'varchar', length: 20, nullable: true })
  palletId: string;

  @Column({ name: 'PALLET_SERIAL_NO', type: 'varchar', length: 20, nullable: true })
  palletSerialNo: string;

  @Column({ name: 'USER_ID', type: 'varchar', length: 10, nullable: true })
  userId: string;

  @Column({ name: 'USER_DT', type: 'date', nullable: true })
  userDt: Date;

  @Column({ name: 'UPPP', type: 'number', nullable: true })
  uppp: number;

  @Column({ name: 'CONFIRMED', type: 'varchar', length: 1, nullable: true })
  confirmed: string;

  @Column({ name: 'UNIT_PRICE', type: 'number', precision: 18, scale: 6, nullable: true })
  unitPrice: number;

  @Column({ name: 'CONTAINER_SIZE', type: 'number', nullable: true })
  containerSize: number;

  @Column({ name: 'CUST_CODE', type: 'varchar', length: 20, nullable: true })
  custCode: string;

  @Column({ name: 'MOC1', type: 'varchar', length: 2, nullable: true })
  moc1: string;

  @Column({ name: 'MOC2', type: 'varchar', length: 2, nullable: true })
  moc2: string;

  @Column({ name: 'ORIGIN_COUNTRY', type: 'varchar', length: 15, nullable: true })
  originCountry: string;

  @Column({ name: 'SHELF_LIFE_DAYS', type: 'number', nullable: true })
  shelfLifeDays: number;

  @Column({ name: 'SHELF_LIFE_DATE', type: 'date', nullable: true })
  shelfLifeDate: Date;

  @Column({ name: 'PROD_ATTRIB_CODE', type: 'varchar', length: 50, nullable: true })
  prodAttribCode: string;

  @Column({ name: 'PROD_GRADE2', type: 'varchar', length: 20, nullable: true })
  prodGrade2: string;

  @Column({ name: 'TX_IDENTITY_NUMBER', type: 'varchar', length: 30, nullable: true })
  txIdentityNumber: string;

  @Column({ name: 'SUPP_CODE', type: 'varchar', length: 10, nullable: true })
  suppCode: string;

  @Column({ name: 'PACK_KEY', type: 'varchar', length: 20, nullable: true })
  packKey: string;

  @Column({ name: 'ORDER_NO', type: 'varchar', length: 20, nullable: true })
  orderNo: string;

  @Column({ name: 'SEAL_NO', type: 'varchar', length: 20, nullable: true })
  sealNo: string;

  @Column({ name: 'ORDER_SRNO', type: 'varchar', length: 20, nullable: true })
  orderSrno: string;

  @Column({ name: 'CONTAINER_NO', type: 'varchar', length: 20, nullable: true })
  containerNo: string;

  @Column({ name: 'CONFIRM_DATE', type: 'date', nullable: true })
  confirmDate: Date;

  @Column({ name: 'MANU_CODE', type: 'varchar', length: 40, nullable: true })
  manuCode: string;

  @Column({ name: 'QTY_STRING', type: 'varchar', length: 40, nullable: true })
  qtyString: string;

  @Column({ name: 'QTY_CONFIRM_STRING', type: 'varchar', length: 40, nullable: true })
  qtyConfirmString: string;

  @Column({ name: 'IDENTITY_NUMBER', type: 'number', nullable: true })
  identityNumber: number;
}
