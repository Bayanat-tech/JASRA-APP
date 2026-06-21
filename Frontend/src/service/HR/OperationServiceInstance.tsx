import { Operation } from 'pages/HR/type/AddCategoryHr.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class OperationService {
  //-------------- Operations --------------

  // Add Operation
  addOperation = async (values: Operation) => {
    try {
      console.log(values);

      const response: IApiResponse<null> = await axiosServices.post('api/HR/gm/kpioperation', values); // Updated endpoint
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

  // Edit Operation
  editOperation = async (values: Operation) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/HR/gm/kpioperation', values); // Updated endpoint
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

const OperationServiceInstance = new OperationService();
export default OperationServiceInstance;
