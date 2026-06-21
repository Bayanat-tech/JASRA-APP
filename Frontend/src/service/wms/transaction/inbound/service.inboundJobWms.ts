import { TJobInboundWmsWithPrinName } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class InboundJob {
  //--------------job----------
  getInboundJob = async (job_no: string) => {
    try {
      const response: IApiResponse<TJobInboundWmsWithPrinName> = await axiosServices.get(`api/wms/inbound/job/${job_no}`);

      if (response.data.success === true && response.data.data) {
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
  //-----get single job print data----------
  getInboundReport = async (report: string, prin_code: string | undefined, job_no: string | undefined) => {
    try {
      const response: IApiResponse<unknown[]> = await axiosServices.get(
        `api/wms/inbound/report/grn?prin_code=${prin_code}&&job_no=${job_no}`
      );

      if (response.data.success === true && response.data.data) {
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
}

const InboundJobServiceInstance = new InboundJob();
export default InboundJobServiceInstance;
