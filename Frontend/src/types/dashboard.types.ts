export interface PipelineData {
  status: string;
  value: number;
}

export interface DealData {
  probability: string;
  count: number;
}

export interface DashboardResponse<T> {
  status: number;
  success: boolean;
  data: T[];
  message?: string;
}
