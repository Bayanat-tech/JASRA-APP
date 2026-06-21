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

class Wms {
  getMasters = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null,
    code?: string | null,
    code2?: string | null,
    additionalParams?: Record<string, any>
  ) => {
    try {
      dispatch(openBackdrop());
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;
      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(
        `api/${app_code}/${master}?code=${code}&code2=${code2}`,
        {
          params: {
            ...(page && { page }),
            ...(limit && { limit }),
            ...(searchData && { filter: JSON.stringify(searchData) }),
            ...(additionalParams && additionalParams)
          }
        }
      );
      if (response.data.success) {
        dispatch(closeBackdrop());
        return response.data.data;
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

  getAllOutboundReports = async () => {
    try {
      const response: IApiResponse<JobReportsT[]> = await axiosServices.get(`api/wms/outbound-reports`);

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

  getddSiteLocation = async (company_code: string, site_code: string): Promise<TddSiteLocation[] | null> => {
    try {
      if (!company_code || !site_code) {
        console.warn('Missing company_code or site_code input.');
        return null;
      }

      console.log('Fetching site location data for company_code and site_code:', company_code, site_code);

      const params = new URLSearchParams({ company_code, site_code });
      const url = `/api/wms/inbound/getddSiteLocation?${params.toString()}`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Site location data received:', response.data.data);
        return response.data.data as TddSiteLocation[];
      } else {
        console.error('Failed to fetch site location data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddSiteLocation:', (error as { message: string }).message);
      return null;
    }
  };
  executeRawSqlbody = async (query_parameter: string, query_where: string, query_updatevalues: string): Promise<any[] | null> => {
    try {
      if (!query_parameter || !query_where) {
        console.warn('Missing query parameters.');
        return null;
      }

      const response = await axiosServices.post('/api/wms/inbound/executeRawSqlbody', {
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

      const response = await axiosServices.post('/api/wms/inbound/executeRawSql', { raw_sql: rawSql });

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
  putMasters = async (
    app_code: string,
    endpoint: string,
    params: Record<string, any>,
    payload: Record<string, any>
  ) => {
    try {
      dispatch(openBackdrop());
      console.log('putMasters called with:', { app_code, endpoint, params, payload });

      const response: IApiResponse<any> = await axiosServices.put(
        `api/${app_code}/${endpoint}`,
        payload,
        { params }
      );

      dispatch(closeBackdrop());

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Updated successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      } else {
        throw new Error(response.data.message || 'Update failed');
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
      throw error;
    }
  };
}

const WmsSerivceInstance = new Wms();
export default WmsSerivceInstance;