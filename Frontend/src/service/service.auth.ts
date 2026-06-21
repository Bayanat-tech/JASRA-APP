import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { TRequestWMe } from 'types/auth';
import { IResponse, TResponseWithPermissions } from 'types/types.services';
import axiosServices from 'utils/axios';

class AuthService {
  getMe = async () => {
    try {
      const response = await axiosServices.get('/api/auth/me');

      return response.data as TRequestWMe;
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

  logout = async () => {
    try {
      await axiosServices.post('/api/auth/logout');
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

  getPermissions = async () => {
    try {
      const permissionsResponse = await axiosServices.get('/api/user/permissions');

      return permissionsResponse.data as TResponseWithPermissions;
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

  companyRegister = async (data: any) => {
    try {
      const response: IResponse = await axiosServices.post('api/company/sign-up', data);
      if (response && response.data.success) {
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

  forgotPassword = async (email: string) => {
    try {
      await axiosServices.post('/api/auth/forget-password-request', { email });
      return true;
    } catch (error) {
      const knownError = error as { success: boolean; message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: `${knownError.message}`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
      return false;
    }
  };

  resetPassword = async (email: string, password: string) => {
    try {
      const response = await axiosServices.post('/api/auth/resetPassword', {
        email,
        password
      });

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Password reset successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return { success: true, data: response.data };
      }
      return { success: false, data: null };
    } catch (error: unknown) {
      const knownError = error as { response?: { data?: { message?: string } }; message: string };
      const errorMessage = knownError.response?.data?.message || knownError.message || 'Failed to reset password. Please try again.';
      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      throw error;
    }
  };

  resetPasswordByLoginId = async (loginId: string, newPassword: string) => {
    try {
      const response = await axiosServices.post('/api/auth/reset-password-loginid', {
        loginId,
        newPassword
      });

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Password reset successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return { success: true, data: response.data };
      }
      return { success: false, data: null };
    } catch (error: unknown) {
      const knownError = error as { response?: { data?: { message?: string } }; message: string };
      const errorMessage = knownError.response?.data?.message || knownError.message || 'Failed to reset password. Please try again.';
      dispatch(
        openSnackbar({
          open: true,
          message: errorMessage,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          severity: 'error',
          close: true
        })
      );
      throw error;
    }
  };
}
const AuthServicesInstance = new AuthService();
export default AuthServicesInstance;
