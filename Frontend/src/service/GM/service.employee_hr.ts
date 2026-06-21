import { ISearch } from 'components/filters/SearchFilter';
import { TEmployeeHr } from 'pages/WMS/types/employee-hr.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class Employee {
  addBulkData = async (values: TEmployeeHr[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/HR/employee/employeemaster/bulk', values);
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
  exportData = async (searchData?: ISearch | null) => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/HR/employee/employeemaster/export`, {
          params: {
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        })
        .then((response) => {
          if (response.data.message === 'Empty Data') {
            dispatch(
              openSnackbar({
                open: true,
                message: 'Empty Data',
                variant: 'alert',
                alert: {
                  color: 'error'
                },
                severity: 'error',
                close: true
              })
            );
            return;
          } else if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `employee.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            resolve(true);
          } else {
            reject(response);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  addEmployee = async (values: TEmployeeHr) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/HR/employee/employeemaster', values);
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
  editEmployee = async (values: TEmployeeHr, company_code: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(`api/HR/employee/${company_code}`, values);
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
  getEmployee = async (employee_code: string) => {
    try {
      const response: IApiResponse<TEmployeeHr> = await axiosServices.get(`api/HR/employee/${employee_code}`);

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
}
const employeeServiceInstance = new Employee();
export default employeeServiceInstance;
