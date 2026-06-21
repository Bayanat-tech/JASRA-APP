import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { IStnRequest } from './stocktransfertypes';

class Stocktransfer {
  // ✅ Create or Update STN with Details
  createOrUpdateTSSTNSequential = async (values: IStnRequest) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/wms/stocktransfer/createOrUpdateTSSTNSequential', values);

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
        return response.data.success;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Operation failed',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return false;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Something went wrong',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };

  // ✅ Get STN with Details
  getTSSTNWithDetails = async (stn_no: string, company_code: string, prin_code: string) => {
    try {
      const response: IApiResponse<any> = await axiosServices.get('api/wms/stocktransfer/getTSSTNWithDetails', {
        params: {
          stn_no,
          company_code,
          prin_code
        }
      });

      if (response.data.success) {
        return response.data.data.header || [];
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Failed to fetch STN data',
            variant: 'alert',
            alert: { color: 'warning' },
            close: true
          })
        );
        return null;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Failed to fetch STN details',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      return null;
    }
  };
}

// Exporting instance
const StocktransferServiceInstance = new Stocktransfer();
export default StocktransferServiceInstance;
