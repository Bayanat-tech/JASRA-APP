import { ISearch } from 'components/filters/SearchFilter';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class QalityClearance {
  getPacking = async (prin_code: string, job_no: string, packdet_no: string) => {
    try {
      const response: IApiResponse<TPackingDetails> = await axiosServices.get(`api/wms/inbound/packing_details`, {
        params: {
          ...(prin_code && { prin_code }),
          ...(job_no && { job_no }),
          ...(packdet_no && { packdet_no })
        }
      });

      if (response.data.success === true && response.data.data) {
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
  createPackingDetail = async (values: TPackingDetails) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/packing_details', values);
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
  createQualityClearance = async (payload: {
    company_code: string | undefined;
    prin_code: string;
    job_no: string;
    packdet_no: number;
  }) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/wms/inbound/packing_details/clearance', payload);
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
  updateQualityClearance = async (values: TPackingDetails, packdet_no: string, prin_code: string, job_no: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/quality_clearance/${packdet_no}?prin_code=${prin_code}&job_no=${job_no}`,
        values
      );
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
  deletePackingDetails = async (values: { prin_code: string; job_no: string; packdet_no: number }[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/wms/inbound/packing_details/delete`, { packing_details: values });
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
  addBulkData = async (values: TPackingDetails[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/packing_details/bulk', values);
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
  exportData = async (searchData: ISearch) => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/wms/inbound/packing_details/export`, {
          params: {
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `packing_detail.csv`);
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
  processQualityClearance = async (
    packdet_no: string[],
    prin_code: string,
    job_no: string,
    truck_condition: string,
    container_condition: string,
    container_type: string,
    ref_box_temp: string,
    prod_temp: string,
    prod_con_acceptance: string
  ) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/quality_clearance?prin_code=${prin_code}&job_no=${job_no}`,
        {
          packdet_no,
          truck_condition,
          container_condition,
          container_type,
          ref_box_temp,
          prod_temp,
          prod_con_acceptance
        }
      );

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
}

const clearanceServiceInstance = new QalityClearance();
export default clearanceServiceInstance;
