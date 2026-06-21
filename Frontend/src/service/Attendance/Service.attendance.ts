import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';
import { IAttendanceRecord, IAttendanceStats } from 'types/attendance.types';

class AttendanceService {
  getDailyStats = async () => {
    try {
      const response = await axiosServices.get('api/attendance/dashboard/daily');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch daily stats');
    } catch (error: any) {
      throw error;
    }
  };

  getDepartmentStats = async (startDate?: string, endDate?: string) => {
    try {
      const response = await axiosServices.get('api/attendance/dashboard/departments', {
        params: { startDate, endDate }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch department stats');
    } catch (error: any) {
      throw error;
    }
  };

  getMonthlyStats = async () => {
    try {
      const response = await axiosServices.get('api/attendance/dashboard/monthly');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch monthly stats');
    } catch (error: any) {
      throw error;
    }
  };

  getLateArrivalTrends = async (days = 30) => {
    try {
      const response = await axiosServices.get('api/attendance/dashboard/trends/late', {
        params: { days }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch late arrival trends');
    } catch (error: any) {
      throw error;
    }
  };

  getEmployeeHistory = async (employeeId: string, days = 30) => {
    try {
      const response = await axiosServices.get(`api/attendance/dashboard/employee/${employeeId}/history`, {
        params: { days }
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch employee history');
    } catch (error: any) {
      throw error;
    }
  };
  getAttendanceRecords = async (
    paginationData?: { page: number; rowsPerPage: number },
    dateRange?: [string, string]
  ): Promise<{ data: IAttendanceRecord[]; total: number; page: number; limit: number }> => {
    try {
      const response = await axiosServices.get('api/attendance/report', {
        params: {
          ...(paginationData?.page !== undefined && { page: paginationData.page + 1 }),
          ...(paginationData?.rowsPerPage && { limit: paginationData.rowsPerPage }),
          ...(dateRange && {
            from_date: dateRange[0],
            to_date: dateRange[1]
          })
        }
      });

      // Directly return the response data if it matches the expected structure
      if (response.status === 200 && response.data && response.data.data) {
        return response.data; // Return the entire response data
      }
      throw new Error('Unexpected response structure');
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Failed to fetch attendance records',
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      throw error;
    }
  };

  markAttendance = async (data: FormData) => {
    try {
      const response = await axiosServices.post('api/attendance/mark', data);

      // Handle success based on your actual API response
      if (response.data && response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: `${data.get('action') === 'check-in' ? 'Check In' : 'Check Out'} successful`, // Custom message
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
        return true; // Return true for success
      } else {
        // Handle cases where success is false but no error thrown
        const errorMessage = response.data?.error || 'Attendance marking failed';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      // Proper error extraction
      const axiosError = error as any;
      const errorMessage =
        axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || 'Failed to mark attendance';

      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage, // Show actual error from API
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );
      return false; // Return false for failure
    }
  };
  getAttendanceStats = async (): Promise<IAttendanceStats> => {
    try {
      const response: IApiResponse<IAttendanceStats> = await axiosServices.get('api/attendance/stats');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch attendance stats');
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

  registerEmployee = async (formData: FormData) => {
    try {
      console.log('🟡 Starting employee registration...');
      const response = await axiosServices.post('api/attendance/employees', formData);

      dispatch(
        openSnackbar({
          open: true,
          message: 'Employee registered successfully',
          variant: 'alert',
          alert: { color: 'success' },
          close: true
        })
      );
      return response.data;
    } catch (error: any) {
      console.log('=== COMPREHENSIVE ERROR DEBUGGING ===');

      // Log the complete error structure
      console.log('1. Complete error object:', error);
      console.log('2. Error keys:', Object.keys(error));

      // Check if it's an Axios error
      console.log('3. Is Axios error?', error.isAxiosError);
      console.log('4. Error config:', error.config);

      // Check the response property
      console.log('5. Error response exists?', !!error.response);
      console.log('6. Error response:', error.response);

      if (error.response) {
        console.log('7. Response status:', error.response.status);
        console.log('8. Response status text:', error.response.statusText);
        console.log('9. Response headers:', error.response.headers);
        console.log('10. Response data exists?', !!error.response.data);
        console.log('11. Response data:', error.response.data);
        console.log('12. Response data type:', typeof error.response.data);

        if (error.response.data) {
          console.log('13. Response data keys:', Object.keys(error.response.data));
          console.log('14. Response data.error:', error.response.data.error);
          console.log('15. Response data.message:', error.response.data.message);
          console.log('16. Response data.success:', error.response.data.success);
        }
      }

      // Check request property
      console.log('17. Error request exists?', !!error.request);
      console.log('18. Error request:', error.request);

      // Check other error properties
      console.log('19. Error message:', error.message);
      console.log('20. Error code:', error.code);

      // Extract message using different methods
      let displayMessage = 'Unknown error';

      // Method 1: Direct access
      if (error.response?.data?.error) {
        displayMessage = error.response.data.error;
        console.log('✅ Method 1 - Direct access:', displayMessage);
      }
      // Method 2: Try message field
      else if (error.response?.data?.message) {
        displayMessage = error.response.data.message;
        console.log('✅ Method 2 - Message field:', displayMessage);
      }
      // Method 3: Stringify the entire data
      else if (error.response?.data) {
        displayMessage = JSON.stringify(error.response.data);
        console.log('✅ Method 3 - Stringify data:', displayMessage);
      }
      // Method 4: Use status text
      else if (error.response?.statusText) {
        displayMessage = error.response.statusText;
        console.log('✅ Method 4 - Status text:', displayMessage);
      }
      // Method 5: Use basic error message
      else if (error.message) {
        displayMessage = error.message;
        console.log('✅ Method 5 - Error message:', displayMessage);
      }

      console.log('🎯 FINAL DISPLAY MESSAGE:', displayMessage);
      console.log('=== END DEBUGGING ===');

      dispatch(
        openSnackbar({
          open: true,
          message: displayMessage,
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );

      throw error;
    }
  };
  getEmployees = async () => {
    try {
      const response = await axiosServices.get('api/attendance/employees');
      // Directly return the response if it is already an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error('Unexpected API response format');
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

  // New: fetch single employee info by employee_code or name
  getEmployeeInfo = async (employee_code?: string, name?: string) => {
    try {
      if (!employee_code && !name) {
        throw new Error('Either employee_code or name parameter is required');
      }

      const response = await axiosServices.get('api/attendance/employeeinfo', {
        params: { employee_code, name }
      });

      // If backend follows { success, data } pattern
      if (response.data && typeof response.data === 'object') {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        // backend might return raw employee object directly
        return response.data;
      }

      if (response.status === 200) {
        return response.data;
      }

      throw new Error(response.data?.message || 'Failed to fetch employee info');
    } catch (error: unknown) {
      const knownError = error as { message?: string; response?: any };
      const errorMessage =
        knownError.response?.data?.error || knownError.response?.data?.message || knownError.message || 'Failed to fetch employee info';

      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage,
          variant: 'alert',
          alert: { color: 'error' },
          severity: 'error',
          close: true
        })
      );

      throw error;
    }
  };

  modifyEmployee = async (employeeId: string, formData: FormData) => {
    try {
      const response: IApiResponse<{ employeeId: string }> = await axiosServices.put(`api/attendance/employees/${employeeId}`, formData);
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Employee updated successfully',
            variant: 'alert',
            alert: { color: 'success' },
            close: true
          })
        );
        return response.data;
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
      throw error;
    }
  };
}

const attendanceServiceInstance = new AttendanceService();
export default attendanceServiceInstance;
