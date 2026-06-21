import { TCostmaster } from 'pages/Purchasefolder/type/costmaster-pf-types';
//import { Dispatch } from 'redux';  // Import from redux if not using useDispatch
import { TProjectmaster } from 'pages/Purchasefolder/type/projectmaster-pf-types';
import { TItemmaster } from 'pages/Purchasefolder/type/itemmaster-pf-types';
import { MessageBoxItem } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import { TPrrequest } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import { TPurchaserequestPf } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import { TDashboardData } from 'pages/Purchasefolder/type/dashboard-pf-types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { TFile } from 'types/types.file';




import { TPurchaseOrder } from 'pages/Purchasefolder/type/purchaseorder_pf-types';
import {
  TBasicBrequest,
  Titembudgetrequest,
  Addbudgettab3dd,
  TMonthCostWiseInfo,
  TMonthProjectWiseInfo
} from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
//import { Addbudgettab3dd } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
//import { ThemeContext } from '@emotion/react';
import { TProjectBudgetUpload } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import { TCostbudget } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import { TexcelBudgetupload } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';

import { Tbudgetupdatedata } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import { FetchPOListingData } from 'pages/Purchasefolder/type/polisting';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { TMatrialCateogrymst } from 'pages/Purchasefolder/type/CatMatmaster-pf-types';
import { TProduct } from 'pages/WMS/types/product-wms.types';
import { TddProductMst, TddProjectMst } from 'pages/Purchasefolder/type/dddivisondropdown_pf-types';

interface ProjectwisebudgetAAllocationData {
  approved_amt: number;
  request_number: string;
  requested_date: string; // Consider using Date if needed
  project_code: string;
  project_name: string;
}

interface PurchaseRecoveryData {
  request_number: string; // REQUEST_NUMBER
  recovery_flag: string; // IFNULL(a.recovery_confirm, 'No') AS recovery_flag
  request_date: Date; // REQUEST_DATE
  description: string; // DESCRIPTION
  amount: number; // AMOUNT
  recovery_party_code: string; // Recovery_party_code
  recovery_date: Date; // recovery_date
  recovery_remark: string; // Recovery_remark
  recovery_confirm: string; // Recovery_confirm
  ac_name: string; // ac.ac_name
  emp_name: string; // emp.rpt_name
  supplier: string; // supp.supp_name
  company_code: string; // company_code
  history_serial: string; // history_serial
  type_of_pr: string; // type_of_pr
  project_name: string; // proj.project_name
  ac_code?: string; // Optional field
  alternate_id?: string; // Optional field
}

// interface TItemMaterialRequest {
//   request_number?: string;
//   item_code?: string;
//   item_rate?: number;
//   p_uom?: string;
//   item_p_qty?: number | null; // Allow null
//   item_l_qty?: number;
//   l_uom?: string;
//   from_cost_code?: string;
//   to_cost_code?: string;
// }

// interface TBasicMaterialRequest {
//   request_number?: string;
//   project_code?: string;
//   request_date?: string;
//   from_project_code?: string;
//   to_project_code?: string;
//   items?: TItemMaterialRequest[];
// }
interface ReportData {
  request_no: string;
  request_date: string;
  create_user: string;
  amount: string;
  pr_type: string;
  item_code?: string;
  req_qty?: number;
  appr_qty?: number;
  final_rate?: number;
  currency?: string;
  ex_rate?: number;
  local_amt?: number;
}
type MultiDatasetResponse = {
  budgetRequests: TBasicBrequest[];
  itemBudgets: Titembudgetrequest[];
  additionalBudgets: Addbudgettab3dd[];
  TMonthCostWiseInfodata: TMonthCostWiseInfo[];
  TMonthProjectWiseInfodata: TMonthProjectWiseInfo[];
};

class GMpf {
  ediTProduct(costmasterPayload: {
    cost_code: any;
    cost_name: any;
    prin_code: string;
    prod_code: string;
    prod_name: string;
    group_code?: string;
    brand_code?: string;
    packdesc?: string;
    barcode?: string;
    p_uom?: string;
    suom?: string;
    length?: number;
    breadth?: number;
    height?: number;
    volume?: number;
    gross_wt?: number;
    net_wt?: number;
    foc?: string;
    cpu?: number;
    harm_code?: string;
    imco_code?: string;
    kitting?: string;
    manu_code?: string;
    manu_name?: string;
    base_price?: number;
    flat_storage?: number;
    site_type?: string;
    site_ind?: string;
    pack_key?: string;
    prod_ti?: number;
    prod_hi?: number;
    chargetime?: string;
    prod_status?: string;
    shelf_life?: number;
    category_abc?: string;
    reord_level?: number;
    reord_qty?: number;
    alt_prod_code?: string;
    pref_site?: string;
    pref_loc_from?: string;
    pref_loc_to?: string;
    pref_aisle_from?: string;
    pref_aisle_to?: string;
    pref_col_from?: number;
    pref_col_to?: number;
    pref_ht_from?: number;
    pref_ht_to?: number;
    uppp?: number;
    chk_manucode?: string;
    chk_lotno?: string;
    chk_mfgexpdt?: string;
    puom_volume?: number;
    puom_netwt?: number;
    puom_grosswt?: number;
    l_uom?: string;
    luppp?: number;
    uom_count: number;
    prod_type?: number;
    company_code?: string;
    twoplus_uom?: string;
    upp?: number;
    wave_code?: number;
    product_stage?: string;
    co_pack?: string;
    model_number?: string;
    variant_code?: string;
    cnt_origin?: string;
    serialize?: string;
    packing?: string;
    old_upp?: number;
    avg_consumption?: number;
    prod_image_path_web?: string;
    minperiod_exppick?: number;
    rcpt_exp_limit?: number;
    qty_as_wt?: string;
    hazmat_ind?: string;
    hazmat_class?: string;
    food_ind?: string;
    pharma_ind?: string;
    special_instructions?: string;
    strength?: string;
    pack_size?: number;
    group_code_bk?: string;
    batch_type?: number;
    sap_prod_code?: string;
    sap_prod_desc?: string;
    temp_code?: string;
    edit_user?: string;
    class?: string;
    wob?: number;
    unified_code?: string;
    current_season?: string;
    product_category?: string;
    generic_article?: string;
    prod_gender?: string;
    prod_color?: string;
    prod_size?: string;
    prnt_p_code?: string;
    updated_at?: Date;
    updated_by?: string;
    created_by?: string;
    created_at?: Date;
    division?: string;
  }) {
    throw new Error('Method not implemented.');
  }
  ediTMatrialCateogrymst(values: TMatrialCateogrymst) {
    throw new Error('Method not implemented.');
  }
  getbudgetexcel = async (request_number: string): Promise<any | null> => {
    try {
      console.log('Fetching data for request number:', request_number);

      // Sanitize the request_number by replacing '/' with '$$'
      const sanitizedRequestNumber = request_number.replace(/\//g, '$$');

      // Build the API endpoint URL
      //const url = `/api/pf/gm/excebudget/${sanitizedRequestNumber}`;

      // Make the API call
      const response: IApiResponse<TProjectBudgetUpload> = await axiosServices.get(`/api/pf/gm/excebudget/${sanitizedRequestNumber}`);

      // Log and return the response data if successful
      if (response.data?.success) {
        console.log('API Response Data:', response.data);
        console.log(response.data.data);
        return response.data;
      }

      console.error('Failed to fetch data:', response.data.message);
      return null;
    } catch (error) {
      console.error('Error fetching budget data:', error);
      throw error;
    }
  };

  // Assuming GmPfServiceInstance is the service instance you are using to make API calls

  // Modify this function to handle an array of TCostbudget instead of a single record
  updatebudgetcost = async (values: TCostbudget[]) => {
    try {
      console.log('Inside updatebudgetcost1');
      console.log('values check ', values);

      // Call API with the array of values (which will be the multiple records)
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/budgetrequest/cost', values);

      console.log('After API call');

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'No message provided',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return true;
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };

  getPONumber = async (request_number: string) => {
    try {
      console.log('inside getPONumber check', request_number);

      request_number = request_number.replace(/\//g, '$$');
      console.log('Sanitized request number:', request_number);
      const response: IApiResponse<TPurchaseOrder> = await axiosServices.get(`api/pf/gm/purchaserequest/${request_number}`);
      console.log('return from backend', response.data.data);
      console.log(response.data.data);
      if (response.data.success === true && response.data.data) {
        return response.data.data;
      }
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(closeBackdrop());
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

  //***************************************

  getBudgetReqCostdetails = async (request_number: string, cost_code: string): Promise<TCostbudget[] | null> => {
    try {
      dispatch(openBackdrop());
      console.log('Inside getBudgetRequestNumber');

      // Sanitize request number
      const sanitizedRequestNumber = request_number.replace(/\//g, '$$');
      console.log('Sanitized request number:', sanitizedRequestNumber);

      // Ensure cost_code is not always overwritten
      if (!cost_code) {
        cost_code = 'DUMMY';
      }
      console.log('Final Cost code:', cost_code);

      // Build the API URL
      const url = `api/pf/gm/budgetrequest/${sanitizedRequestNumber}/${cost_code}`;
      console.log('Fetching URL:', url);

      // Fetch data
      const response = await axiosServices.get(url);
      console.log('Full API Response:', response.data);

      // Fix response parsing
      if (response.data?.success && Array.isArray(response.data?.data) && response.data.data.length > 0) {
        return response.data.data as TCostbudget[];
      }

      console.error('API response not successful or costBudgetData missing.');
      return null;
    } catch (error: unknown) {
      console.error('Error in getBudgetRequestNumber:', (error as { message: string }).message);
      return null;
    } finally {
      dispatch(closeBackdrop());
    }
  };

  // ***********************************
  /**
   * Fetches budget request data.
   * @param request_number - The request number to fetch data for.
   * @param cost_code - Optional cost code. If provided, only TCostbudget is returned.
   * @param dispatch - Redux dispatch for handling errors.
   * @returns Promise that resolves to either TCostbudget or MultiDatasetResponse.
   */

  getBudgetRequestNumber = async (request_number: string): Promise<MultiDatasetResponse | null> => {
    try {
      console.log('Inside getBudgetRequestNumber');

      // Sanitize the request_number by replacing '/' with '$$'
      const sanitizedRequestNumber = request_number.replace(/\//g, '$$');

      // Build the API endpoint URL
      const url = `api/pf/gm/budgetrequest/${sanitizedRequestNumber}`;

      // Make the API call to fetch the budget request data
      const response = await axiosServices.get(url);

      // Log the response for debugging purposes

      // Validate the response and return the appropriate data
      if (response.data?.success && response.data?.data) {
        const { headerData, itemsData, projectBudgetData, TMonthCostWiseInfodata, TMonthProjectWiseInfodata } = response.data.data;

        // Make sure you log the response
        console.log('Response:', { headerData, itemsData, projectBudgetData, TMonthCostWiseInfodata });

        // If any field is missing, check the API response structure
        return {
          budgetRequests: headerData || [],
          itemBudgets: itemsData || [],
          additionalBudgets: projectBudgetData || [],
          TMonthCostWiseInfodata: TMonthCostWiseInfodata || [],
          TMonthProjectWiseInfodata: TMonthProjectWiseInfodata || []
        };
      }

      console.error('API response not successful or data missing.');
      return null;
    } catch (error: unknown) {
      const knownError = error as { message: string };

      // Log the error for debugging
      console.error('Error in getBudgetRequestNumber:', knownError.message);

      // Dispatch error message to the snackbar (you can modify this part as per your existing dispatch logic)
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unknown error occurred.',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );

      // Rethrow error for handling in the caller
      throw error;
    }
  };

getRequestNumber = async (request_number: string) => {
  try {
    console.log('Inside getRequestNumber, request_number:', request_number);

    // Replace forward slashes (/) with $$ to match backend expectation
    request_number = request_number.replace(/\//g, '$$');

    // Make the API request
    const response: IApiResponse<TPurchaserequestPf> = await axiosServices.get(
      `api/pf/gm/purchaserequest/${request_number}`
    );

    // Log the full response for debugging
    console.log('Response from backend:', response);

    // Check if the response is successful and contains the expected data
    if (response.data.success === true && response.data.data) {
      console.log('Data received:', response.data.data);
      return response.data.data;
    } else {
      console.error('Error: No data or unsuccessful response from backend');
      // Handle case where data is not returned or request was unsuccessful
      return undefined;
    }
  } catch (error: any) {
    // Handle errors properly
    console.error('Error in getRequestNumber:', error);

    // Show snackbar with error message (assuming you have redux dispatch setup)
    const errorMessage = error.message || 'An unexpected error occurred';
    dispatch(
      openSnackbar({
        open: true,
        message: errorMessage,
        variant: 'alert',
        alert: {
          color: 'error',
        },
        severity: 'error',
        close: true,
      })
    );

    // Optionally, return undefined or null if an error occurs
    return undefined;
  }
};


  getddProjectMaster = async (div_code: string): Promise<TddProjectMst | null> => {
    try {
      if (!div_code) {
        console.warn('Missing div_code input.');
        return null;
      }

      console.log('Fetching project master data for div_code:', div_code);

      const params = new URLSearchParams({ div_code });
      const url = `/api/pf/gm/getddProjectMaster?${params.toString()}`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Project master data received:', response.data.data);
        return response.data.data as TddProjectMst;
      } else {
        console.error('Failed to fetch project master data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddProjectMaster:', (error as { message: string }).message);
      return null;
    }
  };

  getddProductMaster = async (div_code: string): Promise<TddProductMst | null> => {
    try {
      if (!div_code) {
        console.warn('Missing div_code input.');
        return null;
      }

      console.log('Fetching project master data for div_code:', div_code);

      const params = new URLSearchParams({ div_code });
      const url = `/api/pf/gm/getddProductMaster?${params.toString()}`;

      const response = await axiosServices.get(url);

      if (response.data?.success && response.data?.data) {
        console.log('Product master data received:', response.data.data);
        return response.data.data as TddProductMst;
      } else {
        console.error('Failed to fetch product master data:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getddProductMaster :', (error as { message: string }).message);
      return null;
    }
  };

  // Save temp_load to actual monthly budget table

  saveexcelbudgetdata = async (
    rows: Tbudgetupdatedata[],
    request_number: string,
    showAlert: (alert: { open: boolean; message: string; severity: 'success' | 'error' }) => void
  ) => {
    try {
      const payload = {
        request_number,
        data: rows
      };

      console.log('data', payload.data);

      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/saveexcelbudgetdata', payload);

      if (response.data.success) {
        console.log('Data saved successfully:', response.data.message);
        dispatch(closeBackdrop());
        showAlert({ open: true, message: 'Data saved successfully!', severity: 'success' });
      } else {
        console.error('Failed to save data:', response.data.message);
        dispatch(closeBackdrop());
        showAlert({ open: true, message: 'Failed to save data. Please try again.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error while saving data:', error);
      dispatch(closeBackdrop());
      showAlert({ open: true, message: 'An error occurred while saving data.', severity: 'error' });
    }
  };

  // End Save temp_load to actual monthly budget table

  updatebudgetrequest = async (values: TBasicBrequest) => {
    try {
      console.log('inside before  updatebudget1');
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/budgetrequest', values);
      console.log('after before  updatebudget2');
      if (response.data.success) {
        /* dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'An unexpected error occurred',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return true;*/
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };

  updatepurchaserequest = async (values: TPurchaserequestPf) => {
    try {
      console.log('inside updatepurchaserequest');
      // console.log('checking values', values);
      console.log('flag_sharing_cost', values.flag_sharing_cost);
      console.log('service_type', values.service_type);
      console.log('comapny_code in pr', values.company_code);
      console.log('Before term and condi', values.Termscondition);
      console.log("ITEM VALUES", values?.items)
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/purchaserequest', values);
      console.log('inside updatepurchaserequest1');
      if (response.data.success) {
        dispatch(
          showAlert({
            severity: 'success',
            message: response.data.message || 'No message provided',
            open: true
          })
        );
        return true;
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };

  // Budget upload API Calling
  budgetexcelupload = async (values: TexcelBudgetupload[], request_number: string | undefined): Promise<boolean> => {
    try {
      const payload = {
        values: values, // The array of budget rows
        request_number: request_number // The request number string
      };
      console.log('payload', payload);
      // Call the API to upload multiple budget values
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/budgetexcelupload', payload);

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

      return false; // Return false if the API response is not successful
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
      return false;
    }
  };

  // Budget upload API Calling end

  updatepurchaserorder = async (values: TPurchaseOrder) => {
    try {
      console.log('inside updatepurchaserorder');
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/purchaseorder', values);
      console.log('inside updatepurchaserequest1');
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };

  //signature update
  updatePrintSignatureInfo = async (REF_DOC_NO: string, loginid: string, FLAG_YES_NO: string): Promise<boolean> => {
    try {
      console.log('Inside updatePrintSignatureInfo');
      console.log('REF_DOC_NO:', REF_DOC_NO);
      console.log('loginid:', loginid);
      console.log('FLAG_YES_NO:', FLAG_YES_NO);

      // Basic input validation
      if (!REF_DOC_NO || !FLAG_YES_NO || !loginid) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Missing required input values',
            variant: 'alert',
            alert: { color: 'warning' },
            close: true
          })
        );
        return false;
      }

      // API call to backend to execute stored procedure
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/updatePrintSignatureInfo', {
        ref_doc_no: REF_DOC_NO,
        loginid,
        flag_yes_no: FLAG_YES_NO
      });

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Signature info updated successfully',
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
        return true;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Failed to update signature info',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return false;
      }
    } catch (error: any) {
      dispatch(
        openSnackbar({
          open: true,
          message: error?.response?.data?.message || error.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      return false;
    }
  };

  //-------------- Costmaster--------------
  addCostmaster = async (values: TCostmaster) => {
    try {
      console.log('inside code add');
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/costmaster', values);
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
  addMaterialCategorymst = async (values: TMatrialCateogrymst) => {
    try {
      console.log('inside code add');
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/CatMatMaster', values);
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

  editMaterialCaterogy = async (values: TMatrialCateogrymst) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.put('api/pf/gm/CatMatMaster', values);
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

  editCostmaster = async (values: TCostmaster) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.put('api/pf/gm/costmaster', values);
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
  deleteCostmaster = async (costCodes: string[]) => {
    try {
      console.log(`inside deleteCostmaster: ${costCodes}`);
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/costmaster', costCodes);
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
  //-------------- ProductPfmaster--------------
  addProductPfmaster = async (values: TProduct) => {
    try {
      console.log('inside code add');
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/ProductPfmaster', values);
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

  editProductPfmaster = async (values: TProduct) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.put('api/pf/gm/ProductPfmaster', values);
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

  //-------------- Projectmaster--------------
  addProjectmaster = async (values: TProjectmaster) => {
    try {
      console.log('inside addProjectmaster');
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/projectmaster', values);
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

  editProjectmaster = async (values: TProjectmaster) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.put('api/pf/gm/projectmaster', values);
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
  // deleteProjectmaster = async (projectCodes: string[]) => {
  //   try {
  //     console.log(`inside deleteProjectmaster: ${projectCodes}`);
  //     const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/projectmaster', projectCodes);
  //     if (response.data.success) {
  //       dispatch(
  //         openSnackbar({
  //           open: true,
  //           message: response.data.message,
  //           variant: 'alert',
  //           alert: {
  //             color: 'success'
  //           },
  //           close: true
  //         })
  //       );
  //       return response.data.success;
  //     }
  //   } catch (error: unknown) {
  //     const knownError = error as { message: string };
  //     dispatch(
  //       openSnackbar({
  //         open: true,
  //         message: knownError.message,
  //         variant: 'alert',
  //         alert: {
  //           color: 'error'
  //         },
  //         severity: 'error',
  //         close: true
  //       })
  //     );
  //   }
  // };

  //----------Item Master
  //const type = 'TItemmaster'
  additemmaster = async (values: TItemmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/itemmaster', values);
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

  edititemmaster = async (values: TItemmaster) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/pf/gm/itemmaster', values);
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
  deleteitemmaster = async (item_code: string[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/itemmaster', item_code);
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
  addPurchaserequest = async (values: TPrrequest) => {
    try {
      console.log('inside addPurchaserequest');
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/purchaserequest', values);
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
  // budget  status checking

  CheckBudgetStatus = async (request_number: string, company_code: string): Promise<any> => {
    try {
      // Debug the input parameters
      console.log('Request Number:', request_number);
      console.log('Company Code:', company_code);

      const response = await axiosServices.post('api/pf/gm/checkbudgetstatus', {
        request_number,
        company_code
      });

      // Log the full API response
      console.log('Response from API:', response);
      console.log('Response Data:', response.data);

      // Handle successful response
      if (response.status === 200 && response.data.success) {
        console.log('Budget status checked successfully:', response.data);
        return response.data; // Return API result to the caller
      } else {
        throw new Error(response.data.message || 'Failed to check budget status');
      }
    } catch (error: any) {
      // Debug error response and message
      console.error('Error Response:', error.response?.data);
      console.error('Error Message:', error.message || error);

      // Handle and rethrow the error
      throw new Error(error.response?.data?.message || 'An unexpected error occurred');
    }
  };

  // end budget status checking

  editPurchaserequest = async (values: TPrrequest) => {
    try {
      console.log(values);
      const response: IApiResponse<null> = await axiosServices.put('api/pf/gm/purchaserequest', values);
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
  fetchPRregisterdata = async (
    fromDate: string,
    toDate: string,
    selectedProjectCode: string = '',
    requestStatus: string = '',
    prType: string = '',
    serviceRmFlag: string = '',
    reportType: string = ''
  ): Promise<ReportData[]> => {
    try {
      console.log('Fetching PR register data...');

      // Trim values to remove leading/trailing spaces
      const formattedParams = {
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
        selectedProjectCode: selectedProjectCode.trim(),
        requestStatus: requestStatus.trim(),
        prType: prType.trim(),
        serviceRmFlag: serviceRmFlag.trim(),
        reportType: reportType.trim()
      };

      console.log('API Params (Formatted):', formattedParams);

      const response = await axiosServices.get('api/pf/gm/fetchPRregisterdata', {
        params: formattedParams
      });

      console.log('API Response:', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to fetch PR register data');
      }
    } catch (error) {
      console.error('Error fetching PR register data:', error);
      throw error;
    }
  };

  fetchPOregisterdata = async (
    fromDate: string,
    toDate: string,
    selectedProjectCode: string = '',
    requestStatus: string = '',
    prType: string = '',
    serviceRmFlag: string = '',
    reportType: string = ''
  ): Promise<ReportData[]> => {
    try {
      console.log('Fetching PR register data...');

      // Trim values to remove leading/trailing spaces
      const formattedParams = {
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
        selectedProjectCode: selectedProjectCode.trim(),
        requestStatus: requestStatus.trim(),
        prType: prType.trim(),
        serviceRmFlag: serviceRmFlag.trim(),
        reportType: reportType.trim()
      };

      console.log('API Params (Formatted):', formattedParams);

      const response = await axiosServices.get('api/pf/gm/fetchPOregisterdata', {
        params: formattedParams
      });

      console.log('API Response:', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to fetch PR register data');
      }
    } catch (error) {
      console.error('Error fetching PR register data:', error);
      throw error;
    }
  };

  PRlogreport = async (Request_number: string): Promise<ReportData[]> => {
    try {
      const sanitizedRequestNumber = Request_number.replace(/\//g, '$$');
      console.log('Fetching PR log data...');

      const response = await axiosServices.get(`/api/pf/gm/PRlogreport/${sanitizedRequestNumber}`);

      console.log('API Respons PR log', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to fetch PR log data');
      }
    } catch (error) {
      console.error('Error fetching PR log data:', error);
      throw error;
    }
  };

  fetchPurchaseRecovery = async (type_of_pr: string): Promise<PurchaseRecoveryData[]> => {
    try {
      const response = await axiosServices.get(`/api/pf/gm/fetchPurchaseRecovery/${type_of_pr}`);
      console.log('API Response PR log', response.data);

      if (response.data?.success) {
        return response.data?.data ?? []; // Ensure that it's always an array, even if empty
      } else {
        throw new Error(response.data?.message || 'Failed to fetch PurchaseRecovery data');
      }
    } catch (error) {
      console.error('Error fetching PurchaseRecovery data:', error);
      throw error;
    }
  };

  fetchRequestNoFromGTSession = async () => {
    try {
      console.log('Inside fetchRequestNoFromGTSession');

      const response = await axiosServices.get(`/api/pf/gm/fetchRequestNoFromGTSession`);

      console.log('Response from backend:', response.data);

      if (response.data.success && response.data.data) {
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

  fetchUserlevel = async (userId: string, companyCode: string, flow_code: string) => {
    try {
      if (!userId || !companyCode || !flow_code) {
        console.error('User ID or company code or flowcodeis missing');
        return null;
      }

      console.log('Inside fetchUserlevel');

      const response = await axiosServices.get(`/api/pf/gm/fetchuserlevel`, {
        params: { userId, companyCode, flow_code }
      });

      console.log('Response from backend fetchUserlevel:', response.data);

      if (response.data.success && response.data.data) {
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

cancelFinalApproval = async (
  company_code: string,
  request_number: string,
  user_id: string
): Promise<boolean> => {
  try {
    console.log(request_number)
    const response = await axiosServices.post('api/pf/gm/cancelFinalApproval', {
      company_code,
      request_number,
      user_id,
    });

    console.log('✅ API Response from cancelFinalApproval:', response.data);

    if (response.data?.success) {
      return true;
    } else {
      throw new Error(response.data?.message || '❌ Failed to cancel final approval');
    }
  } catch (error) {
    console.error('❌ Error calling cancelFinalApproval API:', error);
    throw error;
  }
};


  fetchPOlisting = async (request_number: string): Promise<FetchPOListingData[]> => {
    try {
      const response = await axiosServices.get(`api/pf/gm/fetchPOlisting/${request_number}`);

      console.log('API Response PR log', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to fetch fetchPOlisting  data');
      }
    } catch (error) {
      console.error('Error fetching fetchPOlisting  data:', error);
      throw error;
    }
  };

  CheckCostcontroller = async (userId: string, companyCode: string) => {
    try {
      if (!userId || !companyCode) {
        console.error('❌ User ID or company code is missing');
        return null;
      }

      console.log('✅ Inside CheckCostcontroller', { userId, companyCode });

      // Encode companyCode to handle special characters
      const encodedCompanyCode = encodeURIComponent(companyCode);

      // Call API with encoded parameters
      const response = await axiosServices.get('/api/pf/gm/CheckCostcontroller', {
        params: { userId, companyCode: encodedCompanyCode }
      });

      console.log('✅ Response from backend CheckCostcontroller:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error in CheckCostcontroller:', error.message);

      dispatch(
        openSnackbar({
          open: true,
          message: error.message || 'Request failed',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );

      return null;
    }
  };

  Fetchmessagebox = async (userId: string, companyCode: string): Promise<MessageBoxItem[] | null> => {
    try {
      const response = await axiosServices.get('/api/pf/gm/Fetchmessagebox', {
        params: { userId, companyCode }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data as MessageBoxItem[];
      } else {
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching messagebox:', error.message);
      return null;
    }
  };

  FetchGenPOString = async (): Promise<string | null> => {
    try {
      console.log('✅ Calling FetchGenPOString API');

      // Call backend API without parameters
      const response = await axiosServices.get('/api/pf/gm/FetchGenPOString');

      console.log('✅ Response from backend:', response.data);

      if (response.data.success && response.data.data) {
        return response.data.data; // This is the GEN_PO_NUMBER string
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error in FetchGenPOString:', error.message);

      dispatch(
        openSnackbar({
          open: true,
          message: error.message || 'Request failed',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );

      return null;
    }
  };

  fetchProjectwisebudgetAllocation = async (
    fromDate: string,
    toDate: string,
    selectedProjectCode: string = '',
    requestStatus: string = '',
    prType: string = '',
    serviceRmFlag: string = ''
  ): Promise<ProjectwisebudgetAAllocationData[]> => {
    try {
      console.log('Fetching fetchProjectwisebudgetAllocation  data...');

      // Trim values to remove leading/trailing spaces
      const formattedParams = {
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
        selectedProjectCode: selectedProjectCode.trim(),
        requestStatus: requestStatus.trim(),
        prType: prType.trim(),
        serviceRmFlag: serviceRmFlag.trim()
      };

      console.log('API Params (Formatted):', formattedParams);

      const response = await axiosServices.get('api/pf/gm/fetchProjectwisebudgetAllocation', {
        params: formattedParams
      });

      console.log('API Response:', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to fetch fetchProjectwisebudgetAllocation  data');
      }
    } catch (error) {
      console.error('Error fetching PR register data:', error);
      throw error;
    }
  };
  fetchCostwisebudgetAllocation = async (
    fromDate: string,
    toDate: string,
    selectedProjectCode: string = '',
    requestStatus: string = '',
    prType: string = '',
    serviceRmFlag: string = ''
  ): Promise<ReportData[]> => {
    try {
      console.log('Fetching fetchCostwisebudgetAllocation  data...');

      // Trim values to remove leading/trailing spaces
      const formattedParams = {
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
        selectedProjectCode: selectedProjectCode.trim(),
        requestStatus: requestStatus.trim(),
        prType: prType.trim(),
        serviceRmFlag: serviceRmFlag.trim()
      };

      console.log('API Params (Formatted):', formattedParams);

      const response = await axiosServices.get('api/pf/gm/fetchCostwisebudgetAllocation', {
        params: formattedParams
      });

      console.log('API Response:', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to fetchCostwisebudgetAllocation');
      }
    } catch (error) {
      console.error('Error fetching PR register data:', error);
      throw error;
    }
  };

  bugetcurstatusprojectwiseconsolidated = async (
    fromDate: string,

    toDate: string,

    selectedProjectCode: string = '',

    requestStatus: string = '',

    prType: string = '',

    serviceRmFlag: string = ''
  ): Promise<ReportData[]> => {
    try {
      console.log('Fetching bugetcurstatusprojectwiseconsolidated  data...');

      // Trim values to remove leading/trailing spaces

      const formattedParams = {
        fromDate: fromDate.trim(),

        toDate: toDate.trim(),

        selectedProjectCode: selectedProjectCode.trim(),

        requestStatus: requestStatus.trim(),

        prType: prType.trim(),

        serviceRmFlag: serviceRmFlag.trim()
      };

      console.log('API Params (Formatted):', formattedParams);

      const response = await axiosServices.get('api/pf/gm/bugetcurstatusprojectwiseconsolidated', {
        params: formattedParams
      });

      console.log('API Response:', response.data);

      if (response.data?.success) {
        return response.data?.data ?? [];
      } else {
        throw new Error(response.data?.message || 'Failed to bugetcurstatusprojectwiseconsolidated');
      }
    } catch (error) {
      console.error('Error fetching bugetcurstatusprojectwiseconsolidated:', error);

      throw error;
    }
  };

  saveFile = async (request_number: string, files: TFile[]) => {
    try {
      const response: IApiResponse<any> = await axiosServices.post(`api/pf/gm/saveFile`, {
        request_number,
        files
      });
      if (response && response.data) {
        dispatch(
          openSnackbar({
            open: true,
            message: `Files saved successfully`,
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data; // Ensure the API returns the updated files with SR_NO
      }
    } catch (error) {
      dispatch(
        openSnackbar({
          open: true,
          message: `Error saving files.`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: true
        })
      );
      throw error; // Rethrow the error for handling in the caller
    }
  };

  updateReasonForPO = async (REASON_PO_MODIFY: string, REF_DOC_NO: string, COMPANY_CODE: string, loginid: string): Promise<boolean> => {
    try {
      console.log('Inside updateReasonForPO');
      console.log('REF_DOC_NO:', REF_DOC_NO);
      console.log('COMPANY_CODE:', COMPANY_CODE);
      console.log('REASON_PO_MODIFY:', REASON_PO_MODIFY);

      // Input validation
      if (!REASON_PO_MODIFY || REASON_PO_MODIFY.trim() === '') {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Enter Reason for Purchase Order',
            variant: 'alert',
            alert: { color: 'warning' },
            close: true
          })
        );
        return false;
      }

      const response: IApiResponse<null> = await axiosServices.post('/api/pf/gm/updateReasonForPO', {
        reason_po_modify: REASON_PO_MODIFY,
        ref_doc_no: REF_DOC_NO,
        company_code: COMPANY_CODE,
        loginid
      });

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Reason updated successfully',
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
        return true;
      } else {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Failed to update reason',
            variant: 'alert',
            alert: { color: 'error' },
            close: true
          })
        );
        return false;
      }
    } catch (error: any) {
      dispatch(
        openSnackbar({
          open: true,
          message: error?.response?.data?.message || error.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      return false;
    }
  };

  updatecancelrejectsentback = async (
    LAST_ACTION: string,
    REQUEST_NUMBER: string,
    COMPANY_CODE: string,
    loginid: string,
    LEVEL: string,
    REMARKS: string,
    CREATEPR: string
  ) => {
    try {
      console.log('inside updatecancelrejectsentback');
      console.log('LAST_ACTION', LAST_ACTION);
      console.log('REQUEST_NUMBER', REQUEST_NUMBER);
      console.log('COMPANY_CODE', COMPANY_CODE);
      console.log('loginid', loginid);
      console.log('LEVEL', LEVEL);
      console.log('REMARKS', REMARKS);

      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/updatecancelrejectsentback', {
        LAST_ACTION,
        REQUEST_NUMBER,
        COMPANY_CODE,
        loginid,
        LEVEL,
        REMARKS,
        CREATEPR
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
      return false;
    }
  };
  UpdPurchaseRecoveryData = async (values: PurchaseRecoveryData) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/UpdPurchaseRecoveryData', values);
      console.log('inside updatepurchaserequest1');
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
    } catch (error) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'An unexpected error occurred',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      return false;
    }
  };

  getDashboardData = async (level: number, user: string): Promise<TDashboardData | null> => {
    try {
      if (!level || !user) {
        console.warn('Missing level or user input.');
        return null;
      }
      console.log('inside before calling backend getDashboardData');
      const params = new URLSearchParams({ level: String(level), user });
      const url = `/api/pf/gm/getDashboardData?${params.toString()}`; // ✅ Corrected here

      console.log('Fetching dashboard data from:', url);

      const response = await axiosServices.get(url);
      console.log('inside before calling backend getDashboardData');
      if (response.data?.success && response.data?.data) {
        console.log('data', response.data);
        return response.data.data as TDashboardData;
      } else {
        console.error('Dashboard data fetch failed:', response.data?.message);
        return null;
      }
    } catch (error: unknown) {
      console.error('Error in getDashboardData:', (error as { message: string }).message);
      return null;
    }
  };
}
const GmPfServiceInstance = new GMpf();

export default GmPfServiceInstance;
