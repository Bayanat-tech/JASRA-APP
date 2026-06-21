import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class PutwayDetails {
  addPutwayDetails = async (job_no: string, queryParams: string, body: any) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/putway_details/${job_no}?${queryParams}`,
        body
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

  processPackingItemPutway = async (
    packdet_no: string[],
    site_to: string,
    site_from: string,
    location_to: string,
    location_from: string,
    job_no: string,
    prin_code: string,
    selectedAllData: boolean,
    searchData?: ISearch | null
  ) => {
    try {
      const packdet_no_str = (packdet_no || []).map((v) => String(v));
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/putway_details/${job_no}`,
        {
          packdet_no: packdet_no_str,
          site_to: !!site_to ? site_to : 'All',
          site_from: !!site_from ? site_from : 'All',
          location_to: !!location_to ? location_to : 'All',
          location_from: !!location_from ? location_from : 'All'
        },
        {
          params: {
            prin_code,
            all: selectedAllData ? 'all' : '',
            ...(searchData && { filter: JSON.stringify(searchData.search) })
          }
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

  exportData = async (searchData?: ISearch | null) => {
    try {
      const response = await axiosServices.get(`/api/wms/inbound/putway_details/export`, {
        params: {
          ...(searchData && { filter: JSON.stringify(searchData) })
        }
      });

      if (response.data.success) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `putway_details.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
      } else {
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

const putwayServiceInstance = new PutwayDetails();
export default putwayServiceInstance;