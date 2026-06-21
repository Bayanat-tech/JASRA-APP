import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { JobReportsT } from 'types/common.types';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';

export interface TddSiteLocation {
  site_code: string;
  location_code: string;
  loc_desc: string;
  loc_type: string;
  loc_stat: string;
}

class Vendor {
  getAllVendorReports = async () => {
    try {
      const response: IApiResponse<JobReportsT[]> = await axiosServices.get(`api/wms/vendor-reports`);

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

  getAllEmployeeReports = async () => {
    try {
      const response: IApiResponse<JobReportsT[]> = await axiosServices.get(`api/wms/employee-reports`);

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

  getAllDynamicReports = async (
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null,
    module?: string,
    reportname?: string
  ) => {
    try {
      dispatch(openBackdrop());
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;
      const response = await axiosServices.get('api/wms/dynamic-reports', {
        params: {
          ...(page && { page }),
          ...(limit && { limit }),
          ...(searchData && { filter: JSON.stringify(searchData) }),
          ...(module && { module }),
          ...(reportname && { reportname })
        }
      });

      if (response.data.success) {
        dispatch(closeBackdrop());
        return response.data;
      }
    } catch (error: unknown) {
      dispatch(closeBackdrop());
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

  executeRawSqlbody = async (query_parameter: string, query_where: string, query_updatevalues: string): Promise<any[] | null> => {
    try {
      if (!query_parameter || !query_where) {
        console.warn('Missing query parameters.');
        return null;
      }

      const response = await axiosServices.post('/api/vendor/gm/executeRawSqlbody', {
        query_parameter,
        query_where,
        query_updatevalues
      });

      if (response.data?.success && response.data?.data) {
        return response.data.data;
      } else {
        console.error('SQL execution failed:', response.data?.error);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in executeRawSqlbody:', (error as { message: string }).message);
      return null;
    }
  };
  executeRawSql = async (rawSql: string): Promise<any[] | null> => {
    try {
      if (!rawSql) {
        console.warn('Missing raw SQL input.');
        return null;
      }

      console.log('Executing raw SQL:', rawSql);

      const response = await axiosServices.post('/api/vendor/gm/executeRawSql', { raw_sql: rawSql });

      if (response.data?.success && response.data?.data) {
        console.log('Raw SQL execution result:', response.data.data);
        return response.data.data;
      } else {
        console.error('SQL execution failed:', response.data?.error);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in executeRawSql:', (error as { message: string }).message);
      return null;
    }
  };
}
const VendorSerivceInstance = new Vendor();
export default VendorSerivceInstance;
