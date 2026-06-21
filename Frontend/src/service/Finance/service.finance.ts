import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { JobReportsT } from 'types/common.types';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class Finance {
  getMasters = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null,
    code?: string | null,
    extra_param1?: string,
    extra_param2?: string,
    extra_param3?: string,
    extra_param4?: string
  ) => {
    try {
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;

      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(`api/${app_code}/${master}`, {
        params: {
          ...(page && { page }),
          ...(limit && { limit }),
          ...(searchData && { filter: JSON.stringify(searchData) }),
          ...(code && { code }),
          ...(extra_param1 && { extra_param1 }),
          ...(extra_param2 && { extra_param2 }),
          ...(extra_param3 && { extra_param3 }),
          ...(extra_param4 && { extra_param4 })
        }
      });
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
  deleteMasters = async (app_code: string, master: string, listOfId: string[]) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.post(`api/${app_code}/${master}`, { ids: listOfId });
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
  getAllReports = async () => {
    try {
      const response: IApiResponse<JobReportsT[]> = await axiosServices.get(`api/wms/inbound-reports`);

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

const financeSerivceInstance = new Finance();
export default financeSerivceInstance;
