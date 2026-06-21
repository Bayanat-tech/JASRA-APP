// Ensure you're exporting the types correctly

export type TItemMaterialRequest = {
  action?: string;
  item_code?: string;
  item_rate?: number;
  p_uom?: string;
  l_uom?: string;
  item_p_qty?: number | null; // Allow null
  item_l_qty?: number;
  from_cost_code?: string;
  to_cost_code?: string;
  from_project_code?: string;
  to_project_code?: string;
};

export type TBasicMaterialRequest = {
  request_number?: string;
  request_date?: Date;
  description?: string;
  last_action?: string;
  created_by?: string;
  updated_by: string;
  requestor_name: string;
  need_by_date: Date;
  flow_level_running?: number;

  //  created_at: Date;
  // updated_at: Date;
  items?: TItemMaterialRequest[];
};
