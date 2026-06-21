import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
//bold report service
// Base settings interface
interface Settings {
  token: string;
  serviceUrl: string;
  serverUrl: string;
  reportPath?: string;
}

// API Response interfaces

// Settings response types
interface BoldReportsList {
  reports: {
    id: string;
    name: string;
    path: string;
    isFolder: boolean;
    hasChildren: boolean;
  }[];
}

class ReportService {
  authorize = async () => {
    try {
      const response: IApiResponse<any> = await axiosServices.post('api/reports/authorize');
      return response.data;
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Authorization failed',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };

  getViewerSettings = async (reportPath?: string): Promise<Settings> => {
    try {
      const response = await axiosServices.post<Settings>('api/reports/viewer-settings', {
        reportPath: reportPath // default report if none specified
      });

      if (!response.data || !response.data.serviceUrl || !response.data.serverUrl || !response.data.token) {
        throw new Error('Invalid viewer settings response');
      }

      return response.data;
    } catch (error) {
      console.error('Viewer settings error:', error);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to get viewer settings',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };

  getDesignerSettings = async (): Promise<Settings> => {
    try {
      // Similarly, designer settings returns the object directly
      const response = await axiosServices.post<{
        token: string;
        serviceUrl: string;
        serverUrl: string;
      }>('api/reports/designer-settings');

      if (!response.data || !response.data.token || !response.data.serviceUrl || !response.data.serverUrl) {
        throw new Error('Invalid designer settings response');
      }

      return response.data;
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to get designer settings',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };

  getPfReportSettings = async (reportPath: string): Promise<Settings> => {
    try {
      const response = await axiosServices.post<Settings>('api/reports/viewer-settings', { reportPath });
      if (!response.data) {
        throw new Error('Invalid viewer settings response');
      }
      return response.data;
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to get report settings',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };

  getReportInfo = async (reportName: string, reportPath: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get('api/reports/info', {
        params: { reportName, reportPath }
      });
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to get report info',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };

  getAllReports = async () => {
    try {
      const response: IApiResponse<BoldReportsList> = await axiosServices.get('api/reports/list');
      if (!response.data) {
        throw new Error('Failed to fetch reports');
      }
      return response.data;
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to fetch reports list',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };
}

export const reportsService = new ReportService();
export default reportsService;
