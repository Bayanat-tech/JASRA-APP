import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

interface QRValidationResponse {
  isValid: boolean;
  message: string;
  invoiceAmount?: string | number;
}

class QRService {
  validate = async (encryptedKey: string): Promise<QRValidationResponse | null> => {
    try {
      const response: IApiResponse<QRValidationResponse> = await axiosServices.get(`api/qr/validate`, {
        params: { encryptedKey }
      });

      if (response.data && (response.data as any).success) {
        return (response.data as any).data as QRValidationResponse;
      }

      if ((response as any).data && !(response.data as any).success) {
        const raw = (response as any).data as unknown as QRValidationResponse;
        if (raw && typeof raw.isValid !== 'undefined') return raw;
      }

      dispatch(
        openSnackbar({
          open: true,
          message: (response.data as any)?.message || 'QR validation failed',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );

      return null;
    } catch (error: unknown) {
      const knownError = error as { message?: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Failed to validate QR code',
          variant: 'alert',
          alert: { color: 'error' },
          close: true
        })
      );
      return null;
    }
  };

  validateWithKey = async (encryptedKey: string): Promise<QRValidationResponse | null> => {
    return this.validate(encryptedKey);
  };

  checkStatus = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response: IApiResponse<{ success: boolean; message: string }> = await axiosServices.get(`api/qr/status`);
      if (response.data && (response.data as any).success) {
        return (response.data as any).data;
      }

      return { success: false, message: (response.data as any)?.message || 'Unknown' };
    } catch (error: unknown) {
      const knownError = error as { message?: string };
      return { success: false, message: knownError.message || 'Unable to connect to QR service' };
    }
  };
}

const QRServiceInstance = new QRService();
export default QRServiceInstance;
