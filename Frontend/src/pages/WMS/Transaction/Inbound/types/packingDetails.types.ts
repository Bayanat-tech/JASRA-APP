export interface TPackingDetails {
  PACKDET_NO?: number;
  PROD_CODE?: string;
  JOB_NO?: string;
  PRIN_CODE?: string;
  doc_ref_no?: string;
  company_code?: string;
  packdet_no?: number;
  clearance?: string;
  job_no?: string;
  prin_code?: string;
  prod_name?: string;
  prod_code: string;
  qty_puom: number;
  qty_luom: number;
  p_uom: string;
  l_uom: string;
  quantity: number;
  lot_no: string;
  mfg_date: Date;
  exp_date: Date;
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
  uom_count?: number;
  uppp?: number;
  upp?: number;
  vessel_name?: string;
  voyage_no?: string;
  qty_string?: string; // For display purposes
  qty_arrived_string?: string; // For display purposes
  qty_netarrived_string?: string; // For display purposes
  qty_netqty_string?: string; // For display purposes
}
export interface TPackDetailEDI {
  company_code?: string; // default 'BSG'
  prin_code: string;
  job_no: string;
  packdet_no: number; // Serial number for the line item
  error_msg?: string; // To capture any validation errors
  // Mapped fields
  container_no?: string;
  vessel_name?: string;
  voyage_no?: string;

  product_code: string; // Maps to PROD_CODE
  puom?: string;        // Maps to P_UOM
  qty_puom?: number;    // Maps to QTY_PUOM
  luom?: string;        // Maps to L_UOM
  qty_luom?: number;    // Maps to QTY_LUOM

  unit_price?: number;  // Maps to UNIT_PRICE
  curr_code?: string;   // Maps to CURR_CODE

  lot_no?: string;
  mfg_date?: Date;
  exp_date?: Date;

  manu_code?: string;           // Manufacturer
  origin_country?: string;

  from_site?: string;           // Maps to FROM_SITE
  to_site?: string;             // Optional depending on flow
  location_from?: string;
  location_to?: string;

  batch_no?: string;
  po_no?: string;

  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
  user_id?: string;
}