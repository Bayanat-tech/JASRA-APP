import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { openSnackbar } from 'store/reducers/snackbar';
import { TFilterDataDashboard, TWarehouseData, TwarehouseUtilization } from 'types/dashboard/dashboard.types';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

export interface TddSiteLocation {
  site_code: string;
  location_code: string;
  loc_desc: string;
  loc_type: string;
  loc_stat: string;
}
export interface TddProductMst {
  prod_code: string;
  prod_name: string;
  upp: number;
  uppp: number;
  p_uom: string;
  l_uom: string;
  prin_code: string;
}

export interface TddPrinProduct {
  COMPANY_CODE: string;
  PRIN_CODE: string;
  PROD_CODE: string;
  PROD_NAME: string;
  P_UOM: string;
  L_UOM: string;
  UPPP: number;
  UPP: number;
  QTY_AVL: number;
}
class Wms {
 
  getMasters = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null
  ) => {
    try {
      dispatch(openBackdrop());
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;
      // app_code = 'pf';
      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(`api/${app_code}/${master}`, {
        params: {
          ...(page && { page }),
          ...(limit && { limit })
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
    } finally {
      dispatch(closeBackdrop());
    }
  };
  deleteMasters = async (app_code: string, master: string, listOfId: string[]) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.post(`api/${app_code}/${master}`, { ids: listOfId });
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
  getWmsGraph = async (filterData: TFilterDataDashboard) => {
    try {
      // app_code = 'pf';
      const response: IApiResponse<TwarehouseUtilization> = await axiosServices.get('api/wms/dashboard/warehouseGraph', {
        params: {
          ...{ filter: JSON.stringify(filterData) }
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
  getWmsData = async (filterData: TFilterDataDashboard) => {
    try {
      // app_code = 'pf';
      const response: IApiResponse<TWarehouseData> = await axiosServices.get('api/wms/dashboard/warehouseData', {
        params: {
          ...{ filter: JSON.stringify(filterData) }
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

  getddPrinceProductavaliable = async (company_code: string, prin_code: string): Promise<TddPrinProduct | null> => {
    try {
      if (!company_code || !prin_code) {
        console.warn('Missing company_code or prin_code input.');
        return null;
      }

      console.log('Fetching product data for company_code and prin_code:', company_code, prin_code);

      const params = new URLSearchParams({ company_code, prin_code });
      const url = `/api/wms/inbound/getddPrinceProduct?${params.toString()}`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Prince product data received:', response.data.data);
        return response.data.data as TddPrinProduct;
      } else {
        console.error('Failed to fetch prince product data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddPrinceProduct:', (error as { message: string }).message);
      return null;
    }
  };


  getddPrinceProduct = async (company_code: string, prin_code: string): Promise<TddProductMst | null> => {
    try {
      if (!company_code || !prin_code) {
        console.warn('Missing company_code or prin_code input.');
        return null;
      }

      console.log('Fetching product data for company_code and prin_code:', company_code, prin_code);

      const params = new URLSearchParams({ company_code, prin_code });
      const url = `/api/wms/inbound/getddPrinceProduct?${params.toString()}`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Prince product data received:', response.data.data);
        return response.data.data as TddProductMst;
      } else {
        console.error('Failed to fetch prince product data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddPrinceProduct:', (error as { message: string }).message);
      return null;
    }
  };

  getProductAvailability = async (company_code: string, product_code?: string): Promise<any[] | null> => {
    try {
      if (!company_code) {
        console.warn('Missing company_code input.');
        return null;
      }

      const params = new URLSearchParams({ company_code });
      if (product_code) {
        params.append('product_code', product_code);
      }

      const response: IApiResponse<any[]> = await axiosServices.get(`/api/wms/stocktransfer/getProductAvailability?${params.toString()}`);

      if (response.data?.success) {
        // ✅ Return the array directly
        return Array.isArray(response.data.data) ? response.data.data : null;
      }

      console.error('Failed to fetch product availability:', response.data?.message);
      return null;
    } catch (error: unknown) {
      const knownError = error as { message: string };
      console.error('Error in getProductAvailability:', knownError.message);

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

      return null;
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
      console.error('Error in getddLocationCode:', (error as { message: string }).message);
      return null;
    }
  };

  executeRawSql = async (rawSql: string): Promise<any[] | null> => {
    try {
      dispatch(openBackdrop());
      if (!rawSql) {
        console.warn('Missing raw SQL input.');
        return null;
      }

      console.log('Executing raw SQL:', rawSql);

      const response = await axiosServices.post('/api/wms/inbound/executeRawSql', { raw_sql: rawSql });
      
      if (response.data?.success && response.data?.data) {
        console.log('Raw SQL execution result:', response.data.data);
        dispatch(closeBackdrop());
        return response.data.data;
      } else {
        dispatch(closeBackdrop());
        console.error('SQL execution failed:', response.data?.error);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in executeRawSql:', (error as { message: string }).message);
      return null;
    } finally {
      dispatch(closeBackdrop());
    }
  };

  getddLocationCode = async (): Promise<TddSiteLocation[] | null> => {
    try {
      const url = `/api/wms/outbound/getddLocationCode`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Site location data received:', response.data.data);
        return response.data.data as TddSiteLocation[];
      } else {
        console.error('Failed to fetch site location data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddLocationCode:', (error as { message: string }).message);
      return null;
    }
  };
   proc_build_dynamic_sql_wms = async (params: {
    parameter: string;
    loginid: string;
    code1?: string;
    code2?: string;
    code3?: string;
    code4?: string;
    number1?: number;
    number2?: number;
    number3?: number;
    number4?: number;
    date1?: string | null;
    date2?: string | null;
    date3?: string | null;
    date4?: string | null;
  }): Promise<any[] | null> => {
    try {
      if (!params?.parameter) {
        console.warn("Missing required 'parameter' value.");
        return null;
      }

      console.log('Sending parameters to backend:', params);

      const response = await axiosServices.post('/api/wms/inbound/proc_build_dynamic_sql_wms', params);

      if (response.data?.success && response.data?.data) {
        console.log('SQL execution results:', response.data.data);
        console.log(response.data.data);
        return response.data.data;
      } else {
        console.error('Execution failed:', response.data?.error);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in proc_build_dynamic_sql_wms:', (error as { message: string }).message);
      return null;
    }
  };
 
  


}

const WmsSerivceInstance = new Wms();
export default WmsSerivceInstance;
