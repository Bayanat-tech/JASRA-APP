export type TwarehouseUtilization = {
  data: {
    name: string;
    data: number[];
  }[];
  categories: string[];
};

export type TFilterDataDashboard = {
  time: string;
  from_date: Date;
  to_date: Date;
  site_code: string[];
  prin_code: string;
  prin_group_code: string;
};

export type TWarehouseData = {
  outbound: {
    count: number;
    total: number;
    prevTotal: number;
  };
  inbound: {
    count: number;
    total: number;
    prevTotal: number;
  };
  return: {
    count: number;
    total: number;
    prevTotal: number;
  };
  jobListing: TJobListingDashboard;
};

export type TJobListingDashboard = {
  count?: number;
  confirm?: number;
  pending?: number;
  cancelled?: number;
};
