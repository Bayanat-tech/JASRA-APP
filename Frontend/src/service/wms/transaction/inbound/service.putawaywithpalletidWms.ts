// services/putawayWithPalletId.service.ts

import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';

import axiosServices from 'utils/axios';

// ✅ define type for request body
export interface TPutawayWithPalletId {
  prin_code: string;
  job_no: string;
  prod_code: string;
  packdet_no: string;
  pallet_id: string;
  location_from: string;
}

class PutawayWithPalletIdService {
  Putawaywithpalletid = async (values: TPutawayWithPalletId) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(
        'api/wms/inbound/Putawaywithpalletid',
        values
      );

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
          message:
            knownError.message ||
            'Something went wrong while processing putaway with pallet id',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };
}

const PutawayWithPalletIdServiceInstance = new PutawayWithPalletIdService();
export default PutawayWithPalletIdServiceInstance;
