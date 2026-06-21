import { TActivityKPI } from 'pages/WMS/types/activityKpi-wms.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class ActivityKpi {
  // Add Activity KPI
  addActivityKpi = async (values: TActivityKPI) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/gm/activity-kpi', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  };

  // Edit Activity KPI
  editActivityKpi = async (values: TActivityKPI) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/wms/gm/activity-kpi', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  };

  // Delete Activity KPI
  deleteActivityKpi = async (kpiCodes: string[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/gm/activity-kpi/delete', kpiCodes);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
      }
    } catch (error: unknown) {
      this.handleError(error);
    }
  };

  // Add Bulk Activity KPIs
  addBulkData = async (values: TActivityKPI[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/gm/activity-kpi/bulk', values);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data.success;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
    }
  };

  // Export Activity KPI Data
  exportData = async () => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/wms/gm/activity-kpi/export`, { responseType: 'blob' })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity_kpi.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            resolve(true);
          } else {
            reject(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  // Handle Errors
  private handleError = (error: unknown) => {
    const knownError = error as { message: string };
    dispatch(
      openSnackbar({
        open: true,
        message: knownError.message,
        variant: 'alert',
        alert: {
          color: 'error'
        },
        severity: 'error',
        close: true
      })
    );
  };
}

const activityKpiServiceInstance = new ActivityKpi();
export default activityKpiServiceInstance;
