import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { showAlert } from 'store/CustomAlert/alertSlice';
interface MaterialRequestHeader {
 request_number?: string;
  request_date?: Date;
   description?: string;
   last_action?: string;
   created_by?: string;
   updated_by: string;
   requestor_name : string;
   need_by_date : Date;
  
}

interface TItemMaterialRequest {

   item_code?: string;
  item_rate?: number;
  p_uom?: string;
  l_uom?: string;
  item_p_qty?: number | null; // Allow null
  item_l_qty?: number;
  from_cost_code?: string;
  to_cost_code?: string;
  from_project_code?: string;
  to_project_code?: string;
};


interface TBasicMaterialRequest {
 request_number?: string;
  request_date?: Date;
   description?: string;
   last_action?: string;
   created_by?: string;
   updated_by: string;
   requestor_name : string;
   need_by_date : Date;
    flow_level_running?: number,
  items?: TItemMaterialRequest[];
}

class GMMat {
  // ✅ Implemented Global Search API
  fetchPfGlobalSearch = async (
    keyword: string,
    paginationData: { page: number; rowsPerPage: number },
    searchData: ISearch | undefined
  ): Promise<any> => {
    try {
      const response: IApiResponse<any> = await axiosServices.post(`api/pf/gm/materialrequest/search`, {
        keyword,
        ...paginationData,
        ...searchData
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Search request failed');
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
      return { success: false, tableData: [] };
    }
  };

  getMaterialRequestNumber = async (request_number: string) => {
    try {
      request_number = request_number.replace(/\//g, '$$');
      const response: IApiResponse<TBasicMaterialRequest> = await axiosServices.get(`api/pf/gm/getMaterialRequestNumber/${request_number}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
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

  MaterialRequestListing = async (): Promise<MaterialRequestHeader[]> => {
    try {
      const response = await axiosServices.get('api/pf/gm/MaterialRequestListing');

      console.log('📡 Full API response:', response.data);

      if (response.data?.success) {
        const data = response.data.data ?? [];

        console.log('📦 Material Requests:', data);
        return data;
      } else {
        throw new Error(response.data?.message || 'Failed to fetch material request data');
      }
    } catch (error) {
      console.error('❌ Error fetching material request data:', error);
      throw error;
    }
  };

  updatematerialrequest = async (values: TBasicMaterialRequest) => {
    try {
      console.log('inside updatepurchaserequest');
      // console.log('checking values', values);

      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/materialrequest', values);
      console.log('inside updatepurchaserequest1');
      if (response.data.success) {
        dispatch(
          showAlert({
            severity: 'success',
            message: response.data.message || 'No message provided',
            open: true
          })
        );
        return true;
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };
}

const GmMatServiceInstance = new GMMat();
export default GmMatServiceInstance;
