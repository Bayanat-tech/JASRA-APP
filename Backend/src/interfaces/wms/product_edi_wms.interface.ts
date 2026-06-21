export interface IProductEdi {
  PRIN_CODE: string;
  PROD_CODE: string;
  PROD_NAME: string;
  GROUP_CODE?: string;
  BRAND_CODE?: string;
  PACKDESC?: string;
  BARCODE?: string;
  P_UOM?: string;
  SUOM?: string;
  LENGTH?: number;
  BREADTH?: number;
  HEIGHT?: number;
  VOLUME?: number;
  GROSS_WT?: number;
  NET_WT?: number;
  FOC?: string;
  CPU?: number;
  HARM_CODE?: string;
  IMCO_CODE?: string;
  KITTING?: string;
  manu_code?: string;
  BASE_PRICE?: number;
  FLAT_STORAGE?: number;
  SITE_TYPE?: string;
  SITE_IND?: string;
  PACK_KEY?: string;
  COMPANY_CODE: string;
  [key: string]: any; // for any additional fields
}
