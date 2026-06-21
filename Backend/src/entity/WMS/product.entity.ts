import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('MS_PRODUCT')
export class Product {
    @Column({ name: 'PRIN_CODE', type: 'varchar', length: 5, nullable: false })
    prinCode: string;

    @PrimaryColumn({ name: 'PROD_CODE', type: 'varchar', length: 40, nullable: false })
    prodCode: string;

    @Column({ name: 'PROD_NAME', type: 'varchar', length: 250, nullable: false })
    prodName: string;

    @Column({ name: 'GROUP_CODE', type: 'varchar', length: 50, nullable: true })
    groupCode: string;

    @Column({ name: 'BRAND_CODE', type: 'varchar', length: 50, nullable: true })
    brandCode: string;

    @Column({ name: 'PACKDESC', type: 'varchar', length: 50, nullable: true })
    packDesc: string;

    @Column({ name: 'BARCODE', type: 'varchar', length: 40, nullable: true })
    barcode: string;

    @Column({ name: 'P_UOM', type: 'varchar', length: 5, nullable: false })
    pUom: string;

    @Column({ name: 'SUOM', type: 'varchar', length: 5, nullable: true })
    suom: string;

    @Column({ name: 'LENGTH', type: 'decimal', precision: 12, scale: 6, nullable: true })
    length: number;

    @Column({ name: 'BREADTH', type: 'decimal', precision: 12, scale: 6, nullable: true })
    breadth: number;

    @Column({ name: 'HEIGHT', type: 'decimal', precision: 12, scale: 6, nullable: true })
    height: number;

    @Column({ name: 'VOLUME', type: 'decimal', precision: 12, scale: 6, nullable: false })
    volume: number;

    @Column({ name: 'GROSS_WT', type: 'decimal', precision: 12, scale: 6, nullable: true })
    grossWt: number;

    @Column({ name: 'NET_WT', type: 'decimal', precision: 12, scale: 6, nullable: true })
    netWt: number;

    @Column({ name: 'FOC', type: 'varchar', length: 20, nullable: true })
    foc: string;

    @Column({ name: 'CPU', type: 'decimal', precision: 10, scale: 4, nullable: true })
    cpu: number;

    @Column({ name: 'HARM_CODE', type: 'varchar', length: 20, nullable: true })
    harmCode: string;

    @Column({ name: 'IMCO_CODE', type: 'varchar', length: 20, nullable: true })
    imcoCode: string;

    @Column({ name: 'KITTING', type: 'varchar', length: 1, nullable: true })
    kitting: string;

    @Column({ name: 'MANU_CODE', type: 'varchar', length: 10, nullable: true })
    manuCode: string;

    @Column({ name: 'BASE_PRICE', type: 'decimal', precision: 16, scale: 6, nullable: true })
    basePrice: number;

    @Column({ name: 'FLAT_STORAGE', type: 'decimal', precision: 10, scale: 4, nullable: true })
    flatStorage: number;

    @Column({ name: 'SITE_TYPE', type: 'varchar', length: 5, nullable: true })
    siteType: string;

    @Column({ name: 'SITE_IND', type: 'varchar', length: 5, nullable: true })
    siteInd: string;

    @Column({ name: 'PACK_KEY', type: 'varchar', length: 40, nullable: true })
    packKey: string;

    @Column({ name: 'PROD_TI', type: 'int', nullable: true })
    prodTi: number;

    @Column({ name: 'PROD_HI', type: 'int', nullable: true })
    prodHi: number;

    @Column({ name: 'CHARGETIME', type: 'varchar', length: 5, nullable: true })
    chargeTime: string;

    @Column({ name: 'PROD_STATUS', type: 'varchar', length: 2, nullable: true })
    prodStatus: string;

    @Column({ name: 'SHELF_LIFE', type: 'int', nullable: true })
    shelfLife: number;

    @Column({ name: 'CATEGORY_ABC', type: 'varchar', length: 2, nullable: true })
    categoryAbc: string;

    @Column({ name: 'REORD_LEVEL', type: 'int', nullable: true })
    reordLevel: number;

    @Column({ name: 'REORD_QTY', type: 'decimal', precision: 12, scale: 1, nullable: true })
    reordQty: number;

    @Column({ name: 'ALT_PROD_CODE', type: 'varchar', length: 40, nullable: true })
    altProdCode: string;

    @Column({ name: 'PREF_SITE', type: 'varchar', length: 5, nullable: true })
    prefSite: string;

    @Column({ name: 'PREF_LOC_FROM', type: 'varchar', length: 15, nullable: true })
    prefLocFrom: string;

    @Column({ name: 'PREF_LOC_TO', type: 'varchar', length: 15, nullable: true })
    prefLocTo: string;

    @Column({ name: 'PREF_AISLE_FROM', type: 'varchar', length: 5, nullable: true })
    prefAisleFrom: string;

    @Column({ name: 'PREF_AISLE_TO', type: 'varchar', length: 5, nullable: true })
    prefAisleTo: string;

    @Column({ name: 'PREF_COL_FROM', type: 'int', nullable: true })
    prefColFrom: number;

    @Column({ name: 'PREF_COL_TO', type: 'int', nullable: true })
    prefColTo: number;

    @Column({ name: 'PREF_HT_FROM', type: 'int', nullable: true })
    prefHtFrom: number;

    @Column({ name: 'PREF_HT_TO', type: 'int', nullable: true })
    prefHtTo: number;

    @Column({ name: 'UPPP', type: 'int', nullable: false })
    uppp: number;

    @Column({ name: 'CHK_MANUCODE', type: 'varchar', length: 1, nullable: true })
    chkManucode: string;

    @Column({ name: 'CHK_LOTNO', type: 'varchar', length: 1, nullable: true })
    chkLotno: string;

    @Column({ name: 'CHK_MFGEXPDT', type: 'varchar', length: 1, nullable: true })
    chkMfgexpdt: string;

    @Column({ name: 'PUOM_VOLUME', type: 'decimal', precision: 12, scale: 6, nullable: true })
    puomVolume: number;

    @Column({ name: 'PUOM_NETWT', type: 'decimal', precision: 12, scale: 6, nullable: true })
    puomNetwt: number;

    @Column({ name: 'PUOM_GROSSWT', type: 'decimal', precision: 12, scale: 6, nullable: true })
    puomGrosswt: number;

    @Column({ name: 'L_UOM', type: 'varchar', length: 5, nullable: false })
    lUom: string;

    @Column({ name: 'LUPPP', type: 'int', nullable: true })
    luppp: number;

    @Column({ name: 'UOM_COUNT', type: 'int', nullable: false })
    uomCount: number;

    @Column({ name: 'PROD_TYPE', type: 'int', nullable: true })
    prodType: number;

    @Column({ name: 'COMPANY_CODE', type: 'varchar', length: 5, nullable: false })
    companyCode: string;

    @Column({ name: 'TWOPLUS_UOM', type: 'varchar', length: 1, nullable: true })
    twoplusUom: string;

    @Column({ name: 'UPP', type: 'int', nullable: true })
    upp: number;

    @Column({ name: 'WAVE_CODE', type: 'int', nullable: true })
    waveCode: number;

    @Column({ name: 'PRODUCT_STAGE', type: 'varchar', length: 1, nullable: true })
    productStage: string;

    @Column({ name: 'CO_PACK', type: 'varchar', length: 1, nullable: true })
    coPack: string;

    @Column({ name: 'MODEL_NUMBER', type: 'varchar', length: 50, nullable: true })
    modelNumber: string;

    @Column({ name: 'VARIANT_CODE', type: 'varchar', length: 4, nullable: true })
    variantCode: string;

    @Column({ name: 'CNT_ORIGIN', type: 'varchar', length: 20, nullable: true })
    cntOrigin: string;

    @Column({ name: 'SERIALIZE', type: 'varchar', length: 1, nullable: true })
    serialize: string;

    @Column({ name: 'PACKING', type: 'varchar', length: 20, nullable: true })
    packing: string;

    @Column({ name: 'OLD_UPP', type: 'int', nullable: true })
    oldUpp: number;

    @Column({ name: 'AVG_CONSUMPTION', type: 'int', nullable: true })
    avgConsumption: number;

    @Column({ name: 'PROD_IMAGE_PATH_WEB', type: 'varchar', length: 250, nullable: true })
    prodImagePathWeb: string;

    @Column({ name: 'MINPERIOD_EXPPICK', type: 'int', nullable: true })
    minperiodExppick: number;

    @Column({ name: 'RCPT_EXP_LIMIT', type: 'int', nullable: true })
    rcptExpLimit: number;

    @Column({ name: 'QTY_AS_WT', type: 'varchar', length: 1, nullable: true })
    qtyAsWt: string;

    @Column({ name: 'HAZMAT_IND', type: 'varchar', length: 1, nullable: true })
    hazmatInd: string;

    @Column({ name: 'HAZMAT_CLASS', type: 'varchar', length: 10, nullable: true })
    hazmatClass: string;

    @Column({ name: 'FOOD_IND', type: 'varchar', length: 1, nullable: true })
    foodInd: string;

    @Column({ name: 'PHARMA_IND', type: 'varchar', length: 1, nullable: true })
    pharmaInd: string;

    @Column({ name: 'SPECIAL_INSTRUCTIONS', type: 'varchar', length: 100, nullable: true })
    specialInstructions: string;

    @Column({ name: 'STRENGTH', type: 'varchar', length: 50, nullable: true })
    strength: string;

    @Column({ name: 'PACK_SIZE', type: 'int', nullable: true })
    packSize: number;

    @Column({ name: 'GROUP_CODE_BK', type: 'varchar', length: 10, nullable: true })
    groupCodeBk: string;

    @Column({ name: 'BATCH_TYPE', type: 'int', nullable: true })
    batchType: number;

    @Column({ name: 'SAP_PROD_CODE', type: 'varchar', length: 20, nullable: true })
    sapProdCode: string;

    @Column({ name: 'SAP_PROD_DESC', type: 'varchar', length: 250, nullable: true })
    sapProdDesc: string;

    @Column({ name: 'TEMP_CODE', type: 'varchar', length: 250, nullable: true })
    tempCode: string;

    @Column({ name: 'EDIT_USER', type: 'varchar', length: 10, nullable: true })
    editUser: string;

    @Column({ name: 'PRNT_P_CODE', type: 'varchar', length: 40, nullable: true })
    prntPCode: string;

    @Column({ name: 'PROD_SIZE', type: 'varchar', length: 50, nullable: true })
    prodSize: string;

    @Column({ name: 'PROD_COLOR', type: 'varchar', length: 50, nullable: true })
    prodColor: string;

    @Column({ name: 'PROD_GENDER', type: 'varchar', length: 50, nullable: true })
    prodGender: string;

    @Column({ name: 'GENERIC_ARTICLE', type: 'varchar', length: 50, nullable: true })
    genericArticle: string;

    @Column({ name: 'PRODUCT_CATEGORY', type: 'varchar', length: 50, nullable: true })
    productCategory: string;

    @Column({ name: 'CURRENT_SEASON', type: 'varchar', length: 50, nullable: true })
    currentSeason: string;
}
