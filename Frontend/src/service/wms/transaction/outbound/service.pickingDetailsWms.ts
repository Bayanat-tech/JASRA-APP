import { ISearch } from 'components/filters/SearchFilter';
import { TPickingCriteria, TPickingItemPreference } from 'pages/WMS/Transaction/outbound/types/pickingDetails.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class PickingDetails {
  getPickingItemStockDetails = async (paginationData?: { page: number; rowsPerPage: number }, searchData?: ISearch | null) => {
    try {
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;

      // app_code = 'pf';
      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(
        `api/wms/outbound/picking_details/stock_details`,
        {
          params: {
            ...(page && { page }),
            ...(limit && { limit }),
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        }
      );
      if (response.data.success) {
        return response.data.data;
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
  getPickingPreferenceData = async (
    selectedItem: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null
  ) => {
    try {
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;

      // app_code = 'pf';
      const response: IApiResponse<{ tableData: TPickingItemPreference[]; count: number }> = await axiosServices.get(
        `api/wms/outbound/picking_details/preference?distinct_field=${selectedItem}`,
        {
          params: {
            ...(page && { page }),
            ...(limit && { limit }),
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        }
      );
      if (response.data.success) {
        return response.data.data;
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
  getPickingOptionData = async () => {
    try {
      const response: IApiResponse<TPickingCriteria[]> = await axiosServices.get(`api/wms/outbound/picking_details/picking_option`);
      if (response.data.success) {
        return response.data.data;
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
  // Picking orders
  pickOrders = async (
    serial_no: string[],
    job_no: string,
    prin_code: string,
    preference: string,
    pick: string,
    min_qty: string,
    exp_period: string
  ) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/outbound/picking_details/pick_order/${job_no}`,
        { serial_no },
        {
          params: {
            prin_code,
            preference,
            pick,
            min_qty,
            exp_period
          }
        }
      );

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' },
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
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  // Fetch picking details
  getPickingDetails = async (job_no: string, prin_code: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get(`api/wms/outbound/picking_details/${job_no}`, {
        params: { prin_code }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch picking details', error);
    }
  };

  confirmOrder = async (serial_no: string[], job_no: string, prin_code: string, confirm_date: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/outbound/picking_details/confirm_order/${job_no}`, // <-- job_no as req.params
        { serial_no }, // <-- body
        { params: { prin_code, confirm_date } } // <-- query
      );

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' },
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
          message: knownError.message || 'Something went wrong while confirming the order',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };
  exportData = async (filterData?: ISearch) => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/wms/outbound/picking_details/export`, {
          params: {
            ...(filterData && { filter: JSON.stringify(filterData) })
          }
        })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `picking_detail.csv`);
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
  exportStockData = async (filterData?: ISearch) => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/wms/outbound/picking_details/stock_details/export`, {
          params: {
            ...(filterData && { filter: JSON.stringify(filterData) })
          }
        })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');

            link.href = url;
            link.setAttribute('download', `stock_detail.csv`);
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
}

const pickingServiceInstance = new PickingDetails();
export default pickingServiceInstance;
