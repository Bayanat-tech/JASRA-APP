import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { TVendor, TVendorMain } from '../vendorTypes/TVendor';

import { showAlert } from 'store/CustomAlert/alertSlice';
import { TFile } from 'types/types.file';

export interface IVendorRegister {
  COMPANY_CODE: string;
  DOC_NO: string;
  AC_CODE: string;
  DOC_DATE_FROM: string;
  DOC_DATE_TO: string;
}

export interface VendorActionPayload {
  DOC_NO: string;
  LAST_ACTION: 'APPROVED' | 'REJECTED' | 'SENTBACK';
  REMARKS?: string;
  FLOW_LEVEL?: string;
  COMPANY_CODE: string;
}

class Sec {
  getMasters = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null
  ) => {
    try {
      const page = paginationData && paginationData?.page + 1;
      const limit = paginationData && paginationData?.rowsPerPage;

      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(`api/${app_code}/${master}`, {
        params: {
          ...(page && { page }),
          ...(limit && { limit })
        }
      });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  deleteMasters = async (app_code: string, master: string, listOfId: string[]) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.post(`api/${app_code}/${master}`, { ids: listOfId });

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Deleted successfully!',
            variant: 'alert',
            alert: { color: 'success' },
            severity: 'success',
            close: true
          })
        );
        return response.data.message;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Deletion failed!',
            variant: 'alert',
            alert: { color: 'error' },
            severity: 'error',
            close: true
          })
        );
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  upsertVendorHandler = async (vendor: TVendor): Promise<string | undefined> => {
    try {
      const response = await axiosServices.put(`/api/vendor/gm/upsertVendorHandler`, vendor);
      console.log('response post api', response);

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Vendor saved successfully!',
            variant: 'alert',
            alert: { color: 'success' },
            severity: 'success',
            close: true
          })
        );
        return response.data.message;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Vendor save failed!',
            variant: 'alert',
            alert: { color: 'error' },
            severity: 'error',
            close: true
          })
        );
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred!',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  updateVendorerequest = async (values: TVendorMain) => {
    try {
      console.log('inside Vendor updation changes today 03102025');

      console.log('doc no', values.DOC_NO);
      console.log('AC CoDE', values.AC_CODE);
      const response: IApiResponse<{ requestNumber: string }> = await axiosServices.post('api/vendor/gm/postLpoRequestHandler', values);

      console.log('inside postLpoRequestHandler', response.data);

      if (response.data?.success) {
        dispatch(
          showAlert({
            severity: 'success',
            message: response.data.message || 'No message provided',
            open: true
          })
        );

        return response.data.data?.requestNumber ?? null;
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      return null;
    }
  };

  updateSendBackReject = async (values: VendorActionPayload) => {
    try {
      console.log('Updating vendor action:', values);

      const response: IApiResponse<null> = await axiosServices.post('api/vendor/gm/updateLpoStatus', values);

      if (response.data.success) {
        dispatch(
          showAlert({
            severity: 'success',
            message: response.data.message || 'Action completed successfully',
            open: true
          })
        );
        return true;
      }
      return false;
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        showAlert({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          severity: 'error'
        })
      );
      return false;
    }
  };

  // VendorSentbackMutation = async (query_parameter: string, query_where: string, query_updatevalues: string): Promise<any[] | null> => {
  //   try {
  //     if (!query_parameter || !query_where) {
  //       console.warn('Missing query parameters.');
  //       return null;
  //     }

  //     const response = await axiosServices.post('api/vendor/gm/VendorSentbackMutation', {
  //       query_parameter,
  //       query_where,
  //       query_updatevalues
  //     });

  //     if (response.data?.success && response.data?.data) {
  //       return response.data.data;
  //     } else {
  //       console.error('SQL execution failed:', response.data?.error);
  //       return null;
  //     }
  //   } catch (error: unknown) {
  //     console.error('Error in executeRawSqlbody:', (error as { message: string }).message);
  //     return null;
  //   }
  // };

  getVendorrequest = async (doc_no: string) => {
    try {
      console.log('inside getrequstnumbr check');

      const response: IApiResponse<TVendorMain> = await axiosServices.get(`api/vendor/gm/getVendorrequest/${doc_no}`);

      console.log('return from backend');
      console.log(response.data.data);
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
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  };

  getVendorLeader = async (company_code: string, ac_code: string, doc_date_from: string, doc_date_to: string): Promise<TVendorMain[]> => {
    try {
      console.log('inside getVendorLeader check');

      const response: IApiResponse<TVendorMain[]> = await axiosServices.get(`api/vendor/gm/party-account-statement`, {
        params: { company_code, ac_code, doc_date_from, doc_date_to }
      });

      console.log('return from backend');
      console.log(response.data.data);

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching vendor leader:', error);
      throw error;
    }
  };

  getVendorOutstanding = async (company_code: string, ac_code: string): Promise<TVendorMain[]> => {
    try {
      console.log('inside getVendorOutstanding check');

      const response: IApiResponse<TVendorMain[]> = await axiosServices.get(`api/vendor/gm/party-outstanding`, {
        params: { company_code, ac_code }
      });

      console.log('return from backend');
      console.log(response.data.data);

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching vendor leader:', error);
      throw error;
    }
  };

  getVendorStatus = async (company_code: string, ac_code: string, po_date_from: string, po_date_to: string): Promise<TVendorMain[]> => {
    try {
      console.log('inside getVendorStatus check');

      const response: IApiResponse<TVendorMain[]> = await axiosServices.get(`api/vendor/gm/getInvoiceStatus`, {
        params: { company_code, ac_code, po_date_from, po_date_to }
      });

      console.log('return from backend');
      console.log(response.data.data);

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching vendor leader:', error);
      throw error;
    }
  };

  vendorClose = async (loginid: string): Promise<TVendorMain[]> => {
    try {
      console.log('inside vendorClose check');

      const response: IApiResponse<TVendorMain[]> = await axiosServices.get(`api/vendor/gm/tmp-ac-header-with-erp-doc`, {
        params: { loginid }
      });

      console.log('return from backend');
      console.log(response.data.data);

      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error: unknown) {
      console.error('Error fetching vendor leader:', error);
      throw error;
    }
  };

  // saveFile = async (request_number: string, files: TFile[]) => {
  //   try {
  //     const response: IApiResponse<any> = await axiosServices.post(`api/vendor/gm/saveFile`, {
  //       request_number,
  //       files
  //     });

  //     if (response && response.data) {
  //       dispatch(
  //         openSnackbar({
  //           open: true,
  //           message: `Files saved successfully`,
  //           variant: 'alert',
  //           alert: { color: 'success' },
  //           close: true
  //         })
  //       );
  //       return response.data;
  //     }
  //   } catch (error) {
  //     dispatch(
  //       openSnackbar({
  //         open: true,
  //         message: `Error saving files.`,
  //         variant: 'alert',
  //         alert: { color: 'error' },
  //         close: true
  //       })
  //     );
  //     throw error;
  //   }
  // };
  saveFile = async (request_number: string, files: TFile[]) => {
    try {
      const response: IApiResponse<any> = await axiosServices.post(`api/vendor/gm/saveFile`, {
        request_number,
        files
      });

      if (response && response.data) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Files saved successfully`,
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
        return response.data;
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Error saving files.`,
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      throw error;
    }
  };
  executeVendorInvoicePrint = async (COMPANY_CODE: string, DOC_NO: string, LOGIN_USER: string): Promise<any | null> => {
    try {
      if (!COMPANY_CODE || !DOC_NO || !LOGIN_USER) {
        console.warn('Missing required parameters: COMPANY_CODE, DOC_NO, LOGIN_USER');
        return null;
      }
      const response = await axiosServices.post('/api/vendor/gm/executeVendorInvoicePrintHandler', {
        COMPANY_CODE,
        DOC_NO,
        LOGIN_USER
      });

      if (response.data?.success) {
        return response.data;
      } else {
        console.error('Vendor invoice print execution failed:', response.data?.message || response.data?.error);
        return response.data ?? null;
      }
    } catch (error: unknown) {
      console.error('Error in executeVendorInvoicePrint:', (error as { message: string }).message);
      return null;
    }
  };
}

const VendorServiceInstance = new Sec();
export default VendorServiceInstance;
