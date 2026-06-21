// TA_ADJHEADER Interface
export interface IStockAdjustmentHeader {
  ADJ_CODE: string;
  PRIN_CODE?: string;
  REMARKS?: string;
  CONFIRMED?: string; // Y/N
  ADJ_DATE?: Date;
  CONFIRMED_DATE?: Date;
  COMPANY_CODE: string;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

// TA_ADJDETAIL Interface
export interface IStockAdjustmentDetail {
  JOB_NO: string;
  PROD_CODE?: string;
  ADJ_TYPE?: string;
  QTY_PUOM?: number;
  SITE_CODE?: string;
  LOCATION_CODE?: string;
  QTY_LUOM?: number;
  PRIN_CODE?: string;
  P_UOM?: string;
  L_UOM?: string;
  PALLET_ID?: string;
  KEY_NUMBER?: string;
  COMPANY_CODE: string;
  CREATED_BY?: string;
  UPDATED_BY?: string;
}

// Request body for creating stock adjustment
export interface ICreateStockAdjustmentRequest {
  // Header fields
  ADJ_CODE: string;
  PRIN_CODE?: string;
  REMARKS?: string;
  CONFIRMED?: string;
  ADJ_DATE?: Date;
  CONFIRMED_DATE?: Date;
  
  // Detail fields
  JOB_NO: string;
  PROD_CODE?: string;
  ADJ_TYPE?: string;
  QTY_PUOM?: number;
  SITE_CODE?: string;
  LOCATION_CODE?: string;
  QTY_LUOM?: number;
  P_UOM?: string;
  L_UOM?: string;
  PALLET_ID?: string;
  KEY_NUMBER?: string;
}

// Request body for processing stock adjustment
export interface IProcessAdjustmentRequest {
  COMPANY_CODE: string;
  PRIN_CODE: string;
  ADJ_NO: number;
  USERID: string;
}
