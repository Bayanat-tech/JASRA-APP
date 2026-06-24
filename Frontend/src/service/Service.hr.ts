import { ISearch } from 'components/filters/SearchFilter';
import { AppDispatch, dispatch } from 'store'; // ✅ Import AppDispatch for dispatch typing
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { openSnackbar } from 'store/reducers/snackbar';
import { TFile } from 'types/types.file';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class HRService {
  getSupervisorEmployees(loginid1: string) {
    throw new Error('Method not implemented.');
  }
  // ✅ Correctly typed thunk action creator
  upsertLeaveApprovalManualHandler =
    (payload: {
      LEAVE_DAYS: number;
      CREATED_BY: string;
      UPDATED_BY: string;
      COMPANY_CODE: string;
      LAST_ACTION: string;
      REQUEST_NUMBER: string;
      REQUEST_DATE: string;
      EMPLOYEE_CODE: string;
      LEAVE_TYPE: string;
      LEAVE_START_DATE: string;
      LEAVE_END_DATE: string;
      RESUME_DATE: string;
      REMARKS: string;
    }) =>
    async (dispatch: AppDispatch): Promise<boolean> => {
      try {
        // ✅ Correct generic type usage
        const response = await axiosServices.put<IApiResponse<any>>('api/HR/gm/upsertLeaveApprovalHandler', payload);

        if (response.data?.success) {
          dispatch(
            openSnackbar({
              open: true,
              message: response.data.message || 'Leave approval saved successfully.',
              variant: 'alert',
              alert: { color: 'success' },
              close: true
            })
          );
          return true;
        } else {
          throw new Error(response.data?.message || 'Save failed');
        }
      } catch (error: any) {
        dispatch(
          openSnackbar({
            open: true,
            message: error?.response?.data?.message || error.message || 'Something went wrong',
            variant: 'alert',
            alert: { color: 'error' },
            severity: 'error',
            close: true
          })
        );
        return false;
      }
    };

      executeRawSql = async (rawSql: string): Promise<any[] | null> => {
    try {
      if (!rawSql) {
        console.warn('Missing raw SQL input.');
        return null;
      }

      console.log('Executing raw SQL:', rawSql);

      const response = await axiosServices.post('api/HR/gm/executeRawSql', { raw_sql: rawSql });

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

  // ✅ Fetch master data with pagination and optional search
  getMasters = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null,
    code?: string | null,
    sql_string?: string
  ) => {
    try {
      dispatch(openBackdrop()); 
      const page = paginationData?.page ? paginationData.page + 1 : undefined;
      const limit = paginationData?.rowsPerPage;

      const shouldAddCode = master === 'Pg_Leave_flow' || master !== 'hrSection';

      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(
        `api/${app_code}/JASRA/${master}${shouldAddCode ? `?code=${code}` : ''}`,
        {
          params: {
            ...(page !== undefined && { page }),
            ...(limit !== undefined && { limit }),
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        }
      );

      if (response.data.success) {
         dispatch(closeBackdrop());
        return response.data.data;
      } else {
        throw new Error('Failed to fetch data');
      }
      
    } catch (error: any) {
      dispatch(
        openSnackbar({
          open: true,
          message: error?.message || 'An error occurred while fetching data.',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    } finally {
      dispatch(closeBackdrop()); 
    }
  };

  // ✅ Delete master entries
  deleteMasters = async (app_code: string, master: string, listOfId: string[]) => {
    try {
      const response: IApiResponse<any> = await axiosServices.post(`api/${app_code}/${master}`, {
        ids: listOfId
      });

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
        return response.data.data;
      } else {
        throw new Error('Failed to delete data');
      }
    } catch (error: any) {
      dispatch(
        openSnackbar({
          open: true,
          message: error?.message || 'An error occurred while deleting data.',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  

  saveFile = async (request_number: string, files: TFile[]) => {
    try {
      const response: IApiResponse<any> = await axiosServices.post(`api/hr/gm/saveFile`, {
        request_number,
        files
      });
      if (response && response.data) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Files saved successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data; // Ensure the API returns the updated files with SR_NO
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Error saving files.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
      throw error; // Rethrow the error for handling in the caller
    }
  };
}

// ✅ Export the instance
const HrServiceInstance = new HRService();
export default HrServiceInstance;
