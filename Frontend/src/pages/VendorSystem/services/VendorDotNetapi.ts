import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { TVendorMain } from '../vendorTypes/TVendor';

class vendorsystem {
  createOrUpdateVendorLPO = async (values: TVendorMain) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/wms/vendor/gm/createOrUpdateVendorLPO', values);

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
    }
  };
}
const VendorServiceInstance = new vendorsystem();
export default VendorServiceInstance;
