
//import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';

import {TPutawaymanual} from 'pages/WMS/Transaction/Inbound/types/manualputaway_wms.types';
import axiosServices from 'utils/axios';

class ManualPutwayDetails {
upsertPutawaymanualHandler = async (values: TPutawaymanual) => {
  try {
    console.log('inside upsertPutawaymanualHandler');

    // ✅ Send object, not array
    const response: IApiResponse<null> = await axiosServices.post(
      'api/wms/inbound/upsertPutawaymanualHandler',
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
        message: knownError.message || 'Something went wrong while saving EDI order detail',
        variant: 'alert',
        alert: { color: 'error' },
        severity: 'error',
        close: true
      })
    );
  }
};

}

const ManualPutwayServiceInstance = new ManualPutwayDetails();
export default ManualPutwayServiceInstance;