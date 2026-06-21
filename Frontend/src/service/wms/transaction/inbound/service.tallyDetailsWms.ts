import { ISearch } from 'components/filters/SearchFilter';
import { TTallyDetails } from 'pages/WMS/Transaction/Inbound/types/tallyDetails.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class TallyDetails {
  getTally = async (prin_code: string, job_no: string, packdet_no: string, seq_number?: number) => {
    try {
      const response: IApiResponse<TTallyDetails> = await axiosServices.get(`api/wms/inbound/tally_details`, {
        params: {
          ...(prin_code && { prin_code }),
          ...(job_no && { job_no }),
          ...(packdet_no && { packdet_no }),
          ...(seq_number && { seq_number })
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
  createTallyDetail = async (values: TTallyDetails) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/tally_details', values);
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
  updateTallyDetail = async (values: TTallyDetails, packdet_no: string, prin_code: string, job_no: string, seq_number?: number) => {
    try {
      const url = seq_number
        ? `api/wms/inbound/tally_details/${packdet_no}/${seq_number}?prin_code=${prin_code}&job_no=${job_no}`
        : `api/wms/inbound/tally_details/${packdet_no}?prin_code=${prin_code}&job_no=${job_no}`;

      const response: IApiResponse<null> = await axiosServices.put(url, values);
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
  deleteTallyDetails = async (values: { prin_code: string; job_no: string; packdet_no: number; seq_number?: number }[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/wms/inbound/tally_details/delete`, {
        tally_details: values
      });
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
  addBulkData = async (values: TTallyDetails[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/tally_details/bulk', values);
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
        .get(`/api/wms/inbound/tally_details/export`, {
          params: {
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `tally_detail.csv`);
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
  getProductTally = async (prin_code: string, job_no: string, container_no: string) => {
    try {
      const response: IApiResponse<TTallyDetails[]> = await axiosServices.get(`api/wms/inbound/tally_product_data`, {
        params: {
          ...(prin_code && { prin_code }),
          ...(job_no && { job_no }),
          ...(container_no && { container_no })
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
}

const tallyServiceInstance = new TallyDetails();
export default tallyServiceInstance;
