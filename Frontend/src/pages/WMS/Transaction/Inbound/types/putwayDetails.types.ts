export interface TPutwayDetails {
  packdet_no?: number;
  job_no?: string;
  prin_code?: string;
  prod_code: string;
  qty_puom: number;
  qty_luom: number;
  p_uom: string;
  l_uom: string;
  quantity: number;
  lot_no: string;
  MFG_DATE: Date;
  EXP_DATE: Date;
  container_no: string;
  po_no: string;
  doc_ref: string;
  batch_no: string;
  origin_country: string;
  manu_code: string;
  gross_weight: number;
  volume: number;
  shelf_life_days: number;
  shelf_life_date: Date;
  bl_no: string;
  clearance: string;
}
