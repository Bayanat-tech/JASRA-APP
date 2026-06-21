import { TLeavetype } from 'pages/HR/type/AddLeavetypeHr.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class HRLeavetype {
  //--------------Country--------------
  addHrLeavetype = async (values: TLeavetype) => {
    try {
      console.log(values);

      const response: IApiResponse<null> = await axiosServices.post('api/HR/gm/leavetype', values);
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
  editHrLeavetype = async (values: TLeavetype) => {
    try {
      ///${values.leave_type}
      const response: IApiResponse<null> = await axiosServices.put(`api/HR/gm/leavetype`, values);
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
  deleteHrLeavetype = async (hrLeavetypeCodes: string[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/HR/gm/leavetype/delete', HRLeavetype);
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
}
const hrLeavetypeServiceInstance = new HRLeavetype();
export default hrLeavetypeServiceInstance;
