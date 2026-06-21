//import { ISearch } from 'components/filters/SearchFilter';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class InbConfirmDetails {
  //processInbJobConfirm = async (packdet_no: string[], job_no: string, prin_code: string) => {
  processInbJobConfirm = async (packdet_no: string[], job_no: string, prin_code: string) => {
    try {
      console.log('testttt job', job_no);
      console.log('testttt prin', prin_code);
      //api/wms/inbound/job_confirmation/{job_no}?prin_code={prin_code}
      console.log(`Sending PUT request to: api/wms/inbound/job_confirmation/${job_no}?prin_code=${prin_code}`);

      //const response: IApiResponse<null> = await axiosServices.put('api/wms/inbound/job_confirmation/{job_no}?prin_code={prin_code}')
      const response: IApiResponse<null> = await axiosServices.put(`api/wms/inbound/job_confirmation/${job_no}?prin_code=${prin_code}`, {
        packdet_no
      });

      // const response: IApiResponse<null> = await axiosServices.put(`api/wms/inbound/job_confirmation`, {
      // params: {
      //   ...(prin_code && { prin_code }),
      //   ...(job_no && { job_no })
      // }

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

  // exportData = async (searchData?: ISearch | null) => {
  //   try {
  //     const response = await axiosServices.get(`/api/wms/inbound/putway_details/export`, {
  //       params: {
  //         ...(searchData && { filter: JSON.stringify(searchData) })
  //       }
  //     });

  //     if (response.data.success) {
  //       const url = window.URL.createObjectURL(new Blob([response.data]));
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.setAttribute('download', `putway_details.csv`);
  //       document.body.appendChild(link);
  //       link.click();
  //       link.remove();
  //       return true;
  //     } else {
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
}

const inbjobconfirmServiceInstance = new InbConfirmDetails();
export default inbjobconfirmServiceInstance;
