// service/Service.hr.ts
import axiosServices from 'utils/axios';
import { openSnackbar } from 'store/reducers/snackbar';
import { Dispatch } from 'redux';
import { TLeaveApproval } from 'pages/Purchasefolder/type/leave-approval-types';

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class HRService {
  upsertLeaveApprovalManualHandler =
    (values: TLeaveApproval & { CREATED_BY: string; UPDATED_BY: string; COMPANY_CODE: string; LAST_ACTION: string }) =>
    async (dispatch: Dispatch): Promise<boolean> => {
      try {
        const response = await axiosServices.put<IApiResponse<null>>('api/hr/upsertLeaveApprovalManualHandler', values);

        if (response.data?.success) {
          dispatch(
            openSnackbar({
              open: true,
              message: response.data.message ?? 'Leave approval saved successfully.',
              variant: 'alert',
              alert: { color: 'success' },
              close: true
            })
          );
          return true;
        } else {
          throw new Error(response.data?.message ?? 'Save failed');
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
}

const hrapprovalInstance = new HRService();
export default hrapprovalInstance;
