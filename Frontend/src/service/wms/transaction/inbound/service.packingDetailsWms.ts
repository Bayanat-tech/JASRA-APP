import { ISearch } from 'components/filters/SearchFilter';
import { TPackingDetails,TPackDetailEDI} from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class PackingDetails {
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
  updatePackingDetail = async (values: TPackingDetails, packdet_no: string, prin_code: string, job_no: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/packing_details/${packdet_no}?prin_code=${prin_code}&job_no=${job_no}`,
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

   getEDIPackdetHandler = async (
  job_no: string,
  prin_code: string,
  company_code: string,
  user_id: string,
): Promise<TPackDetailEDI[] | undefined> => {
  try {
    const query = new URLSearchParams({
      job_no,
      prin_code,
      company_code,
      user_id,
    }).toString();

    const response: IApiResponse<TPackDetailEDI[]> = await axiosServices.get(
      `api/wms/inbound/getEDIPackdetHandler?${query}`
    );

    if (response.data.success === true && response.data.data) {
      return response.data.data;
    }
  } catch (error: unknown) {
    const knownError = error as { message: string };

    dispatch(
      openSnackbar({
        open: true,
        message: knownError.message || 'Failed to fetch EDI order details',
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

copyEDIToPackdetHandler = async (
  login_id: string,
  job_no: string,
  prin_code: string,
  company_code:string,
) => {
  try {
    const response: IApiResponse<null> = await axiosServices.post(
      '/api/wms/inbound/copyEDIToPackdetHandler',
      {
        login_id,
        job_no,
        prin_code,
        company_code
      }
    );

    if (response.data.success) {
      dispatch(
        openSnackbar({
          open: true,
          message: response.data.message || 'EDI copied to Packdet successfully',
          variant: 'alert',
          alert: { color: 'success' },
          close: true
        })
      );
      return response.data.success;
    }
  } catch (error: unknown) {
    const knownError = error as { message?: string };

    dispatch(
      openSnackbar({
        open: true,
        message: knownError.message || 'Something went wrong while copying EDI to Packdet',
        variant: 'alert',
        alert: { color: 'error' },
        severity: 'error',
        close: true
      })
    );
  }
};

  
  upsertPackDetailEDIHandler = async (values: TPackDetailEDI[]) => {
  try {
    const response: IApiResponse<null> = await axiosServices.put('api/wms/inbound/upsertPackDetailEDIHandler', values);

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
        message: knownError.message || 'Something went wrong while saving EDI order detail',
        variant: 'alert',
        alert: { color: 'error' },
        severity: 'error',
        close: true
      })
    );
  }
};
}

const packingServiceInstance = new PackingDetails();
export default packingServiceInstance;
