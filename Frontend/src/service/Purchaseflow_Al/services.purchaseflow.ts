import { TCostmaster } from 'pages/Purchasefolder/type/costmaster-pf-types';
//import { Dispatch } from 'redux';  // Import from redux if not using useDispatch
import { TProjectmaster } from 'pages/Purchasefolder/type/projectmaster-pf-types';
import { TItemmaster } from 'pages/Purchasefolder/type/itemmaster-pf-types';
import { TPrrequest } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import { TPurchaserequestPf_Al } from 'pages/Purchasefolder_Al/purchaserequestheader_pf-types_Al';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

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

class GMpf_Al {
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
      console.log('values', values);

      // Call API with the array of values (which will be the multiple records)
      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/budgetrequest/cost', values);

      console.log('After API call');

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

  getPONumber = async (request_number: string) => {
    try {
      console.log('inside getPONumber check');

      request_number = request_number.replace(/\//g, '$$');
      const response: IApiResponse<TPurchaseOrder> = await axiosServices.get(`api/pf/gm/purchaserequest/${request_number}`);
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
      console.log('Inside getBudgetRequestNumber');

      // Sanitize the request_number by replacing '/' with '$$'
      const sanitizedRequestNumber = request_number.replace(/\//g, '$$');
      console.log('Sanitized request number:', sanitizedRequestNumber);
      console.log('Cost code:', cost_code);

      // Build the API endpoint URL, both request_number and cost_code are compulsory
      const url = `api/pf/gm/budgetrequest/${sanitizedRequestNumber}/${cost_code}`;

      // Make the API call to fetch the budget request data
      const response = await axiosServices.get(url);
      console.log('API response2:', response.data);

      // Validate the response and return the appropriate data
      if (response.data?.success && response.data.data?.costBudgetData?.length > 0) {
        // Return the entire array of costBudgetData
        return response.data.data.costBudgetData as TCostbudget[];
      }

      console.error('API response not successful or data missing.');
      return null;
    } catch (error: unknown) {
      const knownError = error as { message: string };

      // Log the error for debugging purposes
      console.error('Error in getBudgetRequestNumber:', knownError.message);

      // Return null in case of an error
      return null;
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
      console.log('inside getrequstnumbr check');

      request_number = request_number.replace(/\//g, '$$');
      //const response: IApiResponse<TPurchaserequestPf_Al> = await axiosServices.get(`api/pf/gm/purchaserequest/${request_number}`);
      const response: IApiResponse<TPurchaserequestPf_Al> = await axiosServices.get(
        `api/BT-WF-AL/Transactions/purchaserequest/${request_number}`
      );
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
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
    }
  };

  // Save temp_load to actual monthly budget table

  saveexcelbudgetdata = async (rows: Tbudgetupdatedata[], request_number: string) => {
    try {
      const payload = {
        request_number,
        data: rows
      };

      // Replace with your backend API endpoint
      console.log('data', payload.data);

      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/saveexcelbudgetdata', payload);

      if (response.data.success) {
        console.log('Data saved successfully:', response.data.message);
        alert('Data saved successfully!');
      } else {
        console.error('Failed to save data:', response.data.message);
        alert('Failed to save data. Please try again.');
      }
    } catch (error) {
      console.error('Error while saving data:', error);
      alert('An error occurred while saving data.');
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
            message: response.data.message,
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

  updatepurchaserequest = async (values: TPurchaserequestPf_Al) => {
    try {
      console.log('inside updatepurchaserequest');
      // console.log('checking values', values);

      const response: IApiResponse<null> = await axiosServices.post('api/pf/gm/purchaserequest', values);
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
    serviceRmFlag: string = ''
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
        serviceRmFlag: serviceRmFlag.trim()
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
}

const GmPfServiceInstance_Al = new GMpf_Al();

export default GmPfServiceInstance_Al;
