import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import {
  TOrderDetail,
  IEDIOrderDetail,
  IToOrderEntry,
  TddPrinceCustomer
} from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';

class OutboundJob {
  //--------------job---------- ✅
   addInboundjob = async (values: TJobInboundWms) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/inboundjob', values);
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
  
  getOutboundJobOrder = async (job_no: string) => {
    try {
      console.log('inside getOutboundJob', job_no);
      const response: IApiResponse<IToOrderEntry> = await axiosServices.get(`api/wms/outbound/job/${job_no}`);
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

  editInboundjob = async (values: TJobInboundWms) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/inboundjob?prin_code=${values.prin_code}&job_no=${values.job_no}`,
        values
      );
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

  upsertOutboundOrderDetail = async (
    values: TOrderDetail,
    dispatch: any // fallback if AppDispatch is not typed
  ): Promise<boolean | void> => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/outbound/upsertoutboundOrderDetail?prin_code=${values.prin_code}&job_no=${values.job_no}`,
        values
      );

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
        return true;
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

  deleteToOrderDetHandler = async (company_code: string, prin_code: string, job_no: string, serial_no: number): Promise<boolean | void> => {
    try {
      dispatch(openBackdrop());

      const response: IApiResponse<null> = await axiosServices.delete(`api/wms/outbound/deleteToOrderDetHandler`, {
        params: {
          company_code,
          prin_code,
          job_no,
          serial_no
        }
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
        return true;
      }
    } catch (error: unknown) {
      const knownError = error as { message?: string };
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
    } finally {
      dispatch(closeBackdrop());
    }
  };

  upsertOutboundOrderDetailManualHandler = async (values: TOrderDetail) => {
    try {
      dispatch(openBackdrop());
      const response: IApiResponse<null> = await axiosServices.put('api/wms/outbound/upsertOutboundOrderDetailManualHandler', values);

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
    } finally {
      dispatch(closeBackdrop());
    }
  };

  // EDI

  upsertEDIOrderDetailHandler = async (values: IEDIOrderDetail) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/wms/outbound/upsertEDIOrderDetailHandler', values);

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

  getAllOrderDetails = async (company_code: string, prin_code: string, job_no: string) => {
    try {
      const response: IApiResponse<TOrderDetail[]> = await axiosServices.get(`api/wms/outbound/getAllOrderDetails`, {
        params: {
          company_code,
          prin_code,
          job_no
        }
      });

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

  

  getEDIOrderDetailHandler = async (
    user_id: string,
    company_code: string,
    prin_code: string,
    job_no: string
  ): Promise<IEDIOrderDetail[] | undefined> => {
    try {
      const query = new URLSearchParams({
        user_id,
        company_code,
        prin_code,
        job_no
      }).toString();

      const response: IApiResponse<IEDIOrderDetail[]> = await axiosServices.get(`api/wms/outbound/getEDIOrderDetailHandler?${query}`);
 if (response.data.success && response.data.data) {
      return this.convertKeysToLowercase(response.data.data);
    }

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };

      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Failed to fetch EDI order details',
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

  copyEDIToOrderDetailHandler = (login_id: string, job_no: string, prin_code: string, company_code: string) => async (dispatch: any) => {
    dispatch(openBackdrop());
    try {
      const response: IApiResponse<null> = await axiosServices.post('/api/outbound/copyEDIToOrderDetailHandler', {
        login_id,
        job_no,
        prin_code,
        company_code
      });

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'EDI copied to Order Detail successfully',
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
      }

      return response.data.success;
    } catch (error: unknown) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Something went wrong while copying EDI to Order Detail',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      return false;
    } finally {
      dispatch(closeBackdrop());
    }
  };

  getddPrinceCustomer = async (company_code: string, prin_code: string): Promise<TddPrinceCustomer[] | null> => {
    try {
      if (!company_code || !prin_code) {
        console.warn('Missing company_code or prin_code input.');
        return null;
      }

      console.log('Fetching site Customer data for company_code and prin_code:', company_code, prin_code);

      const params = new URLSearchParams({ company_code, prin_code });
      const url = `/api/wms/outbound/getddPrinceCustomer?${params.toString()}`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Customer data received:', response.data.data);
        return response.data.data as TddPrinceCustomer[];
      } else {
        console.error('Failed to fetch  Customer data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddPrinceCustomer', (error as { message: string }).message);
      return null;
    }
  };

  getddSiteCode = async (): Promise<any[] | null> => {
    try {
      const url = `api/wms/outbound/getddSiteCode`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        return response.data.data as any[];
      } else {
        console.error('Failed to fetch data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error', (error as { message: string }).message);
      return null;
    }
  };
  // Utility function to convert object keys to lowercase
  convertKeysToLowercase = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertKeysToLowercase(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      Object.keys(obj).forEach((key) => {
        newObj[key.toLowerCase()] = obj[key];
      });
      return newObj;
    }

    return obj;
  };

  getTotalAvailableQty = async (params: any): Promise<number | null> => {
    console.log(params);
    try {
      const url = `api/wms/outbound/getTotalAvailableQty`;

      // Use POST and send params in the body
      const response = await axiosServices.post(url, params);

      if (response.data?.success && response.data?.TOT_AVL_QTY !== undefined) {
        return response.data.TOT_AVL_QTY as number;
      } else {
        console.error('Failed to fetch total available qty:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error fetching total available qty:', (error as { message: string }).message);
      return null;
    }
  };

  oubcancelPick = async (serial_no: string[], job_no: string, prin_code: string, freeze: string) => {
    try {
      console.log('oub');
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/outbound/picking_details/oubcancelPick/${job_no}?prin_code=${prin_code}&freeze=${freeze}`,
        { serial_no }
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
          message: knownError.message || 'Something went wrong while cancelling pick',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  getddLotNum = async (): Promise<any[] | null> => {
    try {
      const url = `api/wms/outbound/getddLotNum`;
      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        return this.convertKeysToLowercase(response.data.data) as any[];
      } else {
        console.error('Failed to fetch data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error', (error as { message: string }).message);
      return null;
    }
  };
}

const OutboundJobServiceInstance = new OutboundJob();
export default OutboundJobServiceInstance;
