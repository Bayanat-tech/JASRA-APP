export type TIBasicStnRequest = {
  stn_no: number; // Primary Key
  prin_code: string;
  description?: string;
  stn_date?: Date;
  allocated?: string; // 'Y' or 'N'
  allocated_date?: Date;
  confirmed?: string; // 'Y' or 'N'
  confirmed_date?: Date;
  user_id?: string;
  user_dt?: Date;
  company_code: string;
  replenish_no?: number;
  replenish_date?: Date;
  remarks?: string;
  out_job_no?: string;
  count_no?: string;
  cancel?: string;

  // 🔽 Newly added audit columns
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type IStnDetailRequest = {
  stn_no: number;
  prin_code: string;
  seq_number: number;
  prod_code?: string;
  job_no?: string;
  container_no?: string;
  doc_ref?: string;
  from_site?: string;
  to_site?: string;
  from_loc_start?: string;
  from_loc_end?: string;
  to_loc_start?: string;
  to_loc_end?: string;
  from_column_start?: number;
  from_column_end?: number;
  to_column_start?: number;
  to_column_end?: number;
  from_height_start?: number;
  from_height_end?: number;
  to_height_start?: number;
  to_height_end?: number;
  from_aisle_start?: string;
  from_aisle_end?: string;
  to_aisle_start?: string;
  to_aisle_end?: string;
  lot_no?: string;
  mfg_date?: Date;
  exp_date?: Date;
  user_id?: string;
  user_dt?: Date;
  qty_puom?: number;
  qty_luom?: number;
  p_uom?: string;
  allocated?: string;
  confirmed?: string;
  allocated_date?: Date;
  confirmed_date?: Date;
  serial_no: number;
  mixed_putaway?: string;
  l_uom?: string;
  quantity?: number;
  company_code: string;
  key_number?: string;
  selected?: string;
  processed?: string;
  receipt_type?: string;
  exp_date_to?: Date;
  lot_no_to?: string;
  batch_no_from?: string;
  batch_no_to?: string;
  count_no?: string;
  pallet_id?: string;
  multi_series?: string;
  carton_no_from?: string;
  carton_no_to?: string;
  loc_code_from?: string; // Location code from which the stock is being transferred
  // 🔽 Newly added audit columns
  created_at?: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
};

export type IStnRequest = TIBasicStnRequest & {
  items: IStnDetailRequest[];
};
