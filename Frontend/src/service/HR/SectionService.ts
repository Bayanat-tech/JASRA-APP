import { TSection } from 'pages/HR/type/AddHR_types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class Section {
  //--------------Section--------------

  // Add Section
  addSection = async (values: TSection) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/HR/gm/section', values);
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

  // Edit Section
  editSection = async (values: TSection) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put('api/HR/gm/section', values);
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

  // Add Bulk Sections
  addBulkSections = async (values: TSection[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/HR/gm/section/bulk', values);
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

  // Export Sections Data
  exportSectionsData = async () => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/HR/gm/section/export`, { responseType: 'blob' })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `section.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            resolve(true);
          } else {
            reject('Export failed: No data received.');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
}

const sectionServiceInstance = new Section();
export default sectionServiceInstance;
