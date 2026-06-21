import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

interface DashboardResponse {
  data: any[];
  success: boolean;
}

class SMSDashboardService {
  async getPipelineSummary(loginId?: string) {
    const response = await axiosServices.get<IApiResponse<DashboardResponse>>('/api/sms/dashboard/pipeline-summary', {
      params: { loginid: loginId }
    });
    return response.data;
  }

  async getSalesPerformance(salesName?: string, loginId?: string) {
    const response = await axiosServices.get('api/sms/dashboard/sales-performance', {
      params: { sales_name: salesName, loginid: loginId }
    });
    return response.data;
  }

  async getDealProbability(salesName?: string, loginId?: string) {
    const response = await axiosServices.get('api/sms/dashboard/deal-probability', {
      params: { sales_name: salesName, loginid: loginId }
    });
    return response.data;
  }

  async getMonthlyForecast(salesName?: string, loginId?: string) {
    const response = await axiosServices.get('api/sms/dashboard/monthly-forecast', {
      params: { sales_name: salesName, loginid: loginId }
    });
    return response.data;
  }

  async getNextActions(salesName?: string, loginId?: string) {
    const response = await axiosServices.get('api/sms/dashboard/next-actions', {
      params: { sales_name: salesName, loginid: loginId }
    });
    return response.data;
  }

  async getSegmentPerformance(salesName?: string, loginId?: string) {
    const response = await axiosServices.get('api/sms/dashboard/segment-performance', {
      params: { sales_name: salesName, loginid: loginId }
    });
    return response.data;
  }
}

export default new SMSDashboardService();
