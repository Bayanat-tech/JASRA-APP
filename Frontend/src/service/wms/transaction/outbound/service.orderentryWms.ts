import { ISearch } from 'components/filters/SearchFilter';
import { IToOrderEntry } from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';
//import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { ToOrder } from 'pages/WMS/Transaction/outbound/types/OrderEntry_wms.types';
import { dispatch } from 'store';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class OrderEntry {
  getOrderentry = async (job_no: string) => {
    try {
      dispatch(openBackdrop());
      if (!job_no) {
        throw new Error('job_no parameter is required');
      }
      const response: IApiResponse<IToOrderEntry[]> = await axiosServices.get(`api/wms/outbound/order_entry`, {
        params: {
          job_no: job_no
        }
      });

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
    } finally {
      dispatch(closeBackdrop());
    }
  };

  getSingleOrderEntry = async (id: number) => {
    try {
      dispatch(openBackdrop());
      if (!id) {
        throw new Error('id parameter is required');
      }
      const response: IApiResponse<IToOrderEntry> = await axiosServices.get(`api/wms/outbound/single_order`, {
        params: {
          id: id
        }
      });

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
    } finally {
      dispatch(closeBackdrop());
    }
  };

  updateSingleOrderEntry = async (id: number, updateData: Partial<IToOrderEntry>) => {
    try {
      dispatch(openBackdrop());
      const response = await axiosServices.put(`api/wms/outbound/update_order`, {
        id,
        ...updateData
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      throw error;
    } finally {
      dispatch(closeBackdrop());
    }
  };

  createOrderEntry = async (values: IToOrderEntry) => {
    try {
      dispatch(openBackdrop());
      const response: IApiResponse<IToOrderEntry> = await axiosServices.post('api/wms/outbound/orders', values);
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
      dispatch(closeBackdrop());
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
    } finally {
      dispatch(closeBackdrop());
    }
  };

  updateOrderEntry = async (values: ToOrder, order_no: string, prin_code: string, job_no: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/outbound/order_entry/${order_no}?prin_code=${prin_code}&job_no=${job_no}`,
        values
      );
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

  deleteSingleOrderEntry = async (id: Number) => {
    try {
      dispatch(openBackdrop());

      if (!id) {
        throw new Error('id parameter is required');
      }

      const response: IApiResponse<null> = await axiosServices.delete(`api/wms/outbound/delete_order/${id}`);

      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: 'Order entry deleted successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            severity: 'success',
            close: true
          })
        );
        return true;
      }

      throw new Error(response.data.message || 'Failed to delete order entry');
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
    } finally {
      dispatch(closeBackdrop());
    }
  };
  addBulkData = async (values: ToOrder[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/outbound/order_entry/bulk', values);
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
  exportData = async (searchData: ISearch) => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/wms/order_entry/order_entry/export`, {
          params: {
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `order_entry.csv`);
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
}

const OrderEntryServiceInstance = new OrderEntry();
export default OrderEntryServiceInstance;
