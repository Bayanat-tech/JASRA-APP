import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { TPrrequest } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
// import { getAccessToken } from 'utils/functions';

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
class Pf {
  getPfglobalsearch = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null,
    code?: string // New optional parameter
  ) => {
    try {
      console.log('inside getPfglobalsearch', master);
      console.log('inside getPfglobalsearch', searchData);
      const page = paginationData ? paginationData.page + 1 : undefined;
      const limit = paginationData ? paginationData.rowsPerPage : undefined;
      console.log('inside getPfglobalsearch333', master);
      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(
        `api/pf/gm/getPfglobalsearch/${master}`, // ✅ backticks used for template literal
        {
          params: {
            ...(page && { page }),
            ...(limit && { limit }),
            ...(searchData && { filter: JSON.stringify(searchData) }),
            ...(code && { code }) // Optional code parameter
          }
        }
      );
      console.log('success1333sandeep3');
      if (response.data.success) {
        console.log(master);
        console.log('success13333');
        if (master === 'ddsupplier') {
          console.log('master', master);
          console.log('checkkkk', response.data.data);
        }
        console.log('check', response.data.data);
        console.log('con');
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

  getMasters = async (
    app_code: string,
    master: string,
    paginationData?: { page: number; rowsPerPage: number },
    searchData?: ISearch | null,
    code?: string // New optional parameter
   
  ) => {
    try {
      
      console.log('master and app..........', master, app_code);
      
      const page = paginationData ? paginationData.page + 1 : undefined;
      const limit = paginationData ? paginationData.rowsPerPage : undefined;

      const response: IApiResponse<{ tableData: unknown[]; count: number }> = await axiosServices.get(
        `api/${app_code}/${master}`.replace(/\/+/g, '/'),
        {
          params: {
            ...(page && { page }),
            ...(limit && { limit }),
            ...(searchData && { filter: JSON.stringify(searchData) }),
            ...(code && { code }) // Passing the optional code parameter
          }
        }
      );

      if (response.data.success) {
        console.log(master);
        console.log('success1');
        if (master === 'ddsupplier') {
          console.log('master', master);
          console.log('check', response.data.data);
        }
        console.log('check', response.data.data);
        console.log('con');
        return response.data.data; // original line
        // return response.data?.data?.tableData; //temporary change
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

      console.log("Inside getMasters catch block...");
      
    }
  };

  deleteMasters = async (app_code: string, master: string, listOfId: string[]) => {
    try {
      const response: IApiResponse<{}> = await axiosServices.post(`api/${app_code}/${master}`, { ids: listOfId });
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
        return response.data.data;
      } else {
        throw new Error('Failed to delete data');
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
  // Function to retrieve a purchase request by ID using only the request_number
  getPurchaseRequestById = async (request_number: string): Promise<TPrrequest | null> => {
    try {
      // Check if request_number is provided
      if (!request_number) {
        console.error('Request number is missing');
        return null; // Handle the case where request_number is not provided
      }

      // Initialize purchaseRequest with header containing request_number
      const purchaseRequest: TPrrequest = {
        header: {
          request_number: request_number // Assign request_number to header.request_number
        },
        details: [] // Initialize details as an empty array or with appropriate data if available
      };
      console.log('Request Number');
      console.log(purchaseRequest.header.request_number);
      // Make the API call to retrieve the purchase request
      const response: IApiResponse<TPrrequest> = await axiosServices.get(`pf/purchaserequest/get}`);

      // Log the response to understand its structure
      console.log('Response from API:', response);

      // Check if response data is defined and contains the expected structure
      if (response.data && response.data.success && response.data.data) {
        // Combine the fetched data with the purchaseRequest
        return {
          ...purchaseRequest,
          ...response.data.data
        }; // Merge the request_number with fetched data
      } else {
        console.error('Error fetching purchase request:', response.data.message);
        return null; // Handle the case where success is false or data is undefined
      }
    } catch (error: unknown) {
      console.error('Error fetching purchase request by ID:', error);
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
      return null; // Return null in case of error
    }
  };

  getSentbackrolls = async (app_code: string) => {
    try {
      console.log('Fetching Sentbackrolls data for app code:', app_code);

      // Fetch the role data directly from the backend
      const response = await axiosServices.get(`api/${app_code}/sentbackrollselection`);

      // Log the full response data to inspect its structure
      console.log('Full response data:', response.data);

      // Check if the response contains the success field and it's true
      if (response.data.success) {
        console.log('Received role data:', response.data.data);
        return response.data.data; // Return the role data for the dropdown
      } else {
        console.error('No role data found or request failed:', response.data.message);
        return []; // Return an empty array if no data is found or failure
      }
    } catch (error) {
      console.error('Error occurred while fetching Sentbackrolls data:', error);
      return []; // Return an empty array in case of error
    }
  };

  getSentbackrolls_Mat = async (app_code: string) => {
    try {
      console.log('Fetching Sentbackrolls data for app code:', app_code);

      // Fetch the role data directly from the backend
      const response = await axiosServices.get(`api/${app_code}/sentbackrollselection_mat`);

      // Log the full response data to inspect its structure
      console.log('Full response data:', response.data);

      // Check if the response contains the success field and it's true
      if (response.data.success) {
        console.log('Received role data:', response.data.data);
        return response.data.data; // Return the role data for the dropdown
      } else {
        console.error('No role data found or request failed:', response.data.message);
        return []; // Return an empty array if no data is found or failure
      }
    } catch (error) {
      console.error('Error occurred while fetching Sentbackrolls data:', error);
      return []; // Return an empty array in case of error
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
  fetchPOregisterdata = async (
    fromDate: string,
    toDate: string,
    selectedProjectCode: string = '',
    requestStatus: string = '',
    prType: string = '',
    serviceRmFlag: string = ''
    // reportType: string = ''
  ): Promise<ReportData[]> => {
    try {
      console.log('Fetching PO register data...');

      // Trim values to remove leading/trailing spaces
      const formattedParams = {
        fromDate: fromDate.trim(),
        toDate: toDate.trim(),
        selectedProjectCode: selectedProjectCode.trim(),
        requestStatus: requestStatus.trim(),
        prType: prType.trim(),
        serviceRmFlag: serviceRmFlag.trim()
        // reportType: reportType.trim()
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
        throw new Error(response.data?.message || 'Failed to fetch bugetcurstatusprojectwiseconsolidated  data');
      }
    } catch (error) {
      console.error('Error fetching PR register data:', error);
      throw error;
    }
  };
  getDashboardData = async (params: { level: number; user: string; from_date: string; to_date: string }) => {
    try {
      const response = await axiosServices.get('api/pf/gm/getDashboardData'.replace(/\/+/g, '/'), {
        params
        // headers: {
        //   Authorization: `Bearer ${getAccessToken()}`
        // }
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard data');
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
      throw error;
    }
  };
  proc_build_dynamic_sql = async (
  params: {
    parameter: string;
  loginid: string;
    code1?: string;
    code2?: string;
    code3?: string;
    code4?: string;
    number1?: number;
    number2?: number;
    number3?: number;
    number4?: number;
    date1?: string | null;
    date2?: string | null;
    date3?: string | null;
    date4?: string | null;
  }
): Promise<any[] | null> => {
  try {
    if (!params?.parameter) {
      console.warn("Missing required 'parameter' value.");
      return null;
    }

    console.log("Sending parameters to backend:", params);

    const response = await axiosServices.post(
      "api/pf/gm/proc_build_dynamic_sql",
      params
    );

    if (response.data?.success && response.data?.data) {
      console.log("SQL execution results:", response.data.data);
      console.log(response.data.data)
      return response.data.data;
    } else {
      console.error("Execution failed:", response.data?.error);
      return null;
    }
  } catch (error: unknown) {
    console.error("Error in proc_build_dynamic_sql:", (error as { message: string }).message);
    return null;
  }
};
}

const PfSerivceInstance = new Pf();
export default PfSerivceInstance;
