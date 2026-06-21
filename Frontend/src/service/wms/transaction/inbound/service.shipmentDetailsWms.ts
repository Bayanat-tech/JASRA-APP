// import { TContainerDetails } from 'pages/WMS/Transaction/Inbound/types/shipmentDetails.types';
// import { dispatch } from 'store';
// import { ISearch } from 'components/filters/SearchFilter';
// import { openSnackbar } from 'store/reducers/snackbar';
// import { IApiResponse } from 'types/types.services';
// import axiosServices from 'utils/axios';

// class Shipment {
//   //--------------ShipmentDetails--------------
//   addShipmentDetails = async (values: TContainerDetails) => {
//     try {
//       const response: IApiResponse<null> = await axiosServices.post('api/wms/gm/shipment', values);
//       if (response.data.success) {
//         dispatch(
//           openSnackbar({
//             open: true,
//             message: response.data.message,
//             variant: 'alert',
//             alert: {
//               color: 'success'
//             },
//             close: true
//           })
//         );
//         return response.data.success;
//       }
//     } catch (error: unknown) {
//       const knownError = error as { message: string };
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: knownError.message,
//           variant: 'alert',
//           alert: {
//             color: 'error'
//           },
//           severity: 'error',
//           close: true
//         })
//       );
//     }
//   };
//   editShipmentDetails = async (values: TContainerDetails) => {
//     try {
//       const response: IApiResponse<null> = await axiosServices.put('api/wms/gm/shipment', values);
//       if (response.data.success) {
//         dispatch(
//           openSnackbar({
//             open: true,
//             message: response.data.message,
//             variant: 'alert',
//             alert: {
//               color: 'success'
//             },
//             close: true
//           })
//         );
//         return response.data.success;
//       }
//     } catch (error: unknown) {
//       const knownError = error as { message: string };
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: knownError.message,
//           variant: 'alert',
//           alert: {
//             color: 'error'
//           },
//           severity: 'error',
//           close: true
//         })
//       );
//     }
//   };
//   deleteShipmentDetails = async (values: { prin_code: string; job_no: string }[]) => {
//     try {
//       const response: IApiResponse<null> = await axiosServices.post(`api/wms/inbound/shipment_details/delete`, {
//         shipment_details: values
//       });
//       if (response.data.success) {
//         dispatch(
//           openSnackbar({
//             open: true,
//             message: response.data.message,
//             variant: 'alert',
//             alert: {
//               color: 'success'
//             },
//             close: true
//           })
//         );
//         return response.data.success;
//       }
//     } catch (error: unknown) {
//       const knownError = error as { message: string };
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: knownError.message,
//           variant: 'alert',
//           alert: {
//             color: 'error'
//           },
//           severity: 'error',
//           close: true
//         })
//       );
//     }
//   };
//   addBulkData = async (values: TContainerDetails[]) => {
//     try {
//       const response: IApiResponse<null> = await axiosServices.post('api/wms/gm/shipment/bulk', values);
//       if (response.data.success) {
//         dispatch(
//           openSnackbar({
//             open: true,
//             message: response.data.message,
//             variant: 'alert',
//             alert: {
//               color: 'success'
//             },
//             close: true
//           })
//         );
//         return response.data.success;
//       }
//     } catch (error: unknown) {
//       const knownError = error as { message: string };
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: knownError.message,
//           variant: 'alert',
//           alert: {
//             color: 'error'
//           },
//           severity: 'error',
//           close: true
//         })
//       );
//     }
//   };
//   exportData = async (searchData: ISearch) => {
//     return new Promise((resolve, reject) => {
//       axiosServices
//         .get(`/api/wms/inbound/shipment_details/export`, {
//           params: {
//             ...(searchData && { filter: JSON.stringify(searchData) })
//           }
//         })
//         .then((response) => {
//           if (response.data) {
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', `shipment_detail.csv`);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             resolve(true);
//           } else {
//             reject(response);
//           }
//         })
//         .catch((error) => {
//           reject(error);
//         });
//     });
//   };
// }
// const shipmentServiceInstance = new Shipment();
// export default shipmentServiceInstance;

import { ISearch } from 'components/filters/SearchFilter';
//import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { TContainerDetails } from 'pages/WMS/Transaction/Inbound/types/shipmentDetails.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class ShipmentDetails {
  getShipment = async (prin_code: string, job_no: string) => {
    try {
      console.log('getShipment', prin_code);

      const response: IApiResponse<TContainerDetails> = await axiosServices.get(`api/wms/inbound/shipment_details`, {
        params: {
          ...(prin_code && { prin_code }),
          ...(job_no && { job_no })
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
    }
  };
  createShipmentDetail = async (values: TContainerDetails) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/shipment_details', values);
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
  updateShipmentDetail = async (values: TContainerDetails, container_no: string, prin_code: string, job_no: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/wms/inbound/shipment_details?container_no=${container_no}&prin_code=${prin_code}&job_no=${job_no}`,
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
  deleteShipmentDetails = async (values: { prin_code: string; job_no: string; container_no: string }[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post(`api/wms/inbound/shipment_details/delete`, {
        shipment_details: values
      });
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
  addBulkData = async (values: TContainerDetails[]) => {
    try {
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/shipment_details/bulk', values);
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
        .get(`/api/wms/inbound/shipment_details/export`, {
          params: {
            ...(searchData && { filter: JSON.stringify(searchData) })
          }
        })
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `shipment_detail.csv`);
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

const shipmentServiceInstance = new ShipmentDetails();
export default shipmentServiceInstance;
