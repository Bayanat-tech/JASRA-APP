import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { AxiosError } from 'axios';
import { detailsTVendor, TVendor } from '../vendorTypes/TVendor';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// =======================
// Interfaces
// =======================

export interface IAccount {
  AC_CODE: string;
  AC_NAME: string;
  COMPANY_CODE: string;
  CURR_CODE: string;
  ADDRESS: string;
  FAX: string;
  PHONE: string;
  SALESMAN_CODE: string;
  SECTOR_CODE: string;
  INVOICE_NUMBER: string;
  INVOICE_DATE: string;
  EMAIL: string;
  MOBILE: string;
  DEPT_CODE: string;
  TAX_COUNTRY_CODE: string;
  CONTACT_PERSON: string;
  TERRITORY_CODE: string;
  COUNTRY_CODE: string;
}

export interface IDivision {
  COMPANY_CODE: string;
  DIV_CODE: string;
  DIV_NAME: string;
}

export interface IRefDocNo {
  COMPANY_CODE: string;
  DOC_NO: string;
  AC_CODE: string;
  DIV_CODE: string;
  DIV_NAME: string;
  DOC_TYPE: string;
  REF_DOC_NO: string | null | object;
  PDO_TYPE: string | null;
  CURR_CODE: string | null;
  EX_RATE: number | null;
  INVOICE_DATE: string;
}

export interface IDetails {
  COMPANY_CODE: string;
  DOC_NO: string;
  AC_CODE: string;
}

export interface IVendorRegister {
  COMPANY_CODE: string;
  DOC_NO: string;
  AC_CODE: string;
  DOC_DATE_FROM: string;
  DOC_DATE_TO: string;
}

// =======================
// Service Class
// =======================

class VendorRequestService {
  getAccountsList = async (companyCode?: string, acCode?: string) => {
    try {
      const response: IApiResponse<IAccount[]> = await axiosServices.get(`api/vendor/gm/accounts`, {
        params: {
          company_code: companyCode || undefined,
          ac_code: acCode || undefined
        }
      });

      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  };

  // Get Divisions
  async getDivisionList() {
    try {
      const response: IApiResponse<IDivision[]> = await axiosServices.get(`api/vendor/gm/divisions`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching divisions:', error);
      return [];
    }
  }

  // Get Pending Reference Docs
  async getRefDocNo(company_code: string, ac_code: string) {
    try {
      const response: IApiResponse<IRefDocNo[]> = await axiosServices.get(`api/vendor/gm/pending-lpo`, {
        params: { company_code, ac_code }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching ref docs:', error);
      return [];
    }
  }

  // Get Pending LPO Details
  async getDetails(company_code: string, ac_code: string, doc_no: string) {
    try {
      const response: IApiResponse<detailsTVendor[]> = await axiosServices.get(`api/vendor/gm/pending-lpo-detail`, {
        params: { company_code, ac_code, doc_no }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching details:', error);
      return [];
    }
  }

  // Create Vendor
  async addVendorSystem(values: TVendor) {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/vendor/gm/CreateVendor', values);

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
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || axiosError.message || 'Error creating vendor';

      dispatch(
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  }

  // Update Vendor
  async editVendorSystem(values: TVendor) {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/vendor/gm/UpdateVendor', values);

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
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || axiosError.message || 'Error updating vendor';

      dispatch(
        openSnackbar({
          open: true,
          message,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
    }
  }

  // Get Vendor Register
  async getRegister(): Promise<IVendorRegister[]> {
    try {
      const response: IApiResponse<IVendorRegister[]> = await axiosServices.get('api/vendor/gm/getPartyAccountStatement');

      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }

      console.warn('Unexpected response structure:', response.data);
      return [];
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching vendor register:', axiosError.message);

      if (axiosError.response) {
        console.error('Response error:', axiosError.response.status, axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No response received:', axiosError.request);
      }

      return [];
    }
  }
}

// =======================
// Export Service Instance
// =======================

const VendorRequestServiceInstance = new VendorRequestService();
export default VendorRequestServiceInstance;
