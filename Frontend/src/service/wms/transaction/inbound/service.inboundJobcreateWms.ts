import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class InboundJob {
  addInboundjob = async (values: TJobInboundWms) => {
    try {
      // Remove prin_name and id from payload if present and ensure prin_code is present
      const { prin_code, ...payloadRest } = values as any;
      // Explicitly remove id if present
      if ('id' in payloadRest) delete payloadRest.id;
      // Explicitly remove prin_name if present
      if ('prin_name' in payloadRest) delete payloadRest.prin_name;
      const payload = { ...payloadRest, prin_code };
      const response: IApiResponse<null> = await axiosServices.post('api/wms/inbound/inboundjob', payload);
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
    cancelInboundJob = async (job_no: string, prin_code: string) => {
    try {
      const payload = { 
        job_no, 
        prin_code 
      };
      
      const response: IApiResponse<any> = await axiosServices.patch('api/wms/inbound/canceljob', payload);
      
      if (response.data.success) {
        dispatch(
          openSnackbar({
            open: true,
            message: response.data.message || 'Job cancelled successfully',
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: true
          })
        );
        return response.data;
      }
      return null;
    } catch (error: unknown) {
      const knownError = error as { message: string };
      dispatch(
        openSnackbar({
          open: true,
          message: knownError.message || 'Failed to cancel job',
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

  editInboundjob = async (values: TJobInboundWms) => {
    try {
      // Remove prin_name and id from payload if present and ensure prin_code is present
      const { prin_code, job_no, ...payloadRest } = values as any;
      // Explicitly remove id if present
      if ('id' in payloadRest) delete payloadRest.id;
      // Explicitly remove prin_name if present
      if ('prin_name' in payloadRest) delete payloadRest.prin_name;
      if ('inb_cnt_cancel' in payloadRest) delete payloadRest.inb_cnt_cancel;

      const payload = { ...payloadRest, prin_code, job_no };
      const query = `?prin_code=${encodeURIComponent(prin_code)}&job_no=${encodeURIComponent(job_no)}`;
      const response: IApiResponse<null> = await axiosServices.put(`api/wms/inbound/inboundjob${query}`, payload);
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
  upsertTIJobHandler =
    (payload: {
      COMPANY_CODE: string;
      PRIN_CODE?: string;
      JOB_NO: string;
      JOB_DATE?: string;
      JOB_TYPE: string;
      JOB_CLASS?: string;
      DEPT_CODE?: string;
      TRANSPORT_MODE?: string;
      DOC_REF?: string;
      PORT_CODE?: string;
      DESCRIPTION1?: string;
      DESCRIPTION2?: string;
      PRIN_REF1?: string;
      PRIN_REF2?: string;
      REMARKS?: string;
      ETA?: string;
      ATA?: string;
      ETD?: string;
      SCHEDULE_DATE?: string;
      PAYMENT_TERMS?: string;
      CURR_CODE?: string;
      EX_RATE?: number;
      FRIEGHT_VALUE?: number;
      INSURANCE_VALUE?: number;
      CUST_CODE?: string;
      CONTAINER_FLAG?: string;
      CONTAINER?: string;
      CONTAINER_DATE?: string;
      PACKDET?: string;
      PACKDET_DATE?: string;
      ALLOCATED?: string;
      ALLOCATE_DATE?: string;
      CANCELED?: string;
      CANCEL_DATE?: string;
      CONFIRMED?: string;
      CONFIRM_DATE?: string;
      GRN_NO?: string;
      GRN_DATE?: string;
      INVOICED?: string;
      INVOICE_DATE?: string;
      COMPLETED?: string;
      COMPLETE_DATE?: string;
      USER_ID?: string;
      EXP_JOBNO?: string;
      PICKED?: string;
      PICKED_DATE?: string;
      ORDER_DATE?: string;
      ORDERED?: string;
      DESTINATION_PORT?: string;
      VESSEL_NAME?: string;
      VOYAGE_NO?: string;
      PAYABLEAT?: string;
      PLACE_RECEIPT?: string;
      PLACE_DELIVERY?: string;
      NO_OF_ORIGINAL_BL?: number;
      BROKER_CODE?: string;
      QUOTATION_REF?: string;
      BE_NO?: string;
      BE_DATE?: string;
      BE_DEP_AMOUNT?: number;
      DEPOSIT_COLLECTED?: string;
      DEPOSIT_COLLECTED_DT?: string;
      DEPOSIT_COLLECTED_NO?: string;
      BE_DEPOSITS?: number;
      IND_FREIGHT?: string;
      COUNTRY_ORIGIN?: string;
      COUNTRY_DESTINATION?: string;
      TASK_ORDER?: string;
      CUSTOM_RECNO?: string;
      DOC_REF2?: string;
      HAWB?: string;
      REEXPORT?: string;
      REF_JOBNO?: string;
      COMBINED_JOBNO?: string;
      CARRIER?: string;
      JOB_LOCK?: string;
      COURIER_CODE?: string;
      DELIVERY_POINT?: string;
      DEP_BATCHDATE?: string;
      DEP_BATCHENTRY?: string;
      DEP_DOC_TYPE?: string;
      DEP_PERMIT_NO?: string;
      DEP_REMARKS?: string;
      DEP_REMIT_NO?: string;
      DOC_DEP_RCVD_DATE?: string;
      DOC_DEPOSIT_AMT?: number;
      DOC_DEPOSIT_CURRENCY?: string;
      DOC_DEPOSIT_DATE?: string;
      DOC_DEPOSIT_RECEIVED?: string;
      DOC_DEPOSITD?: string;
      DOC_REF_DATE?: string;
      EXITBILL1?: string;
      EXITBILL2?: string;
      JOB_INTEGRATION_CLASS?: string;
      TOT_IMPORT_VALUE?: number;
      REF_CUSTOMS?: string;
      REF_CUSTOMS_DATE?: string;
      DRIVER_REF?: string;
      DRIVER_REMARKS?: string;
      DIV_CODE?: string;
      DOC_DEPOSIT_EXPIRY?: string;
      SALESMAN_CODE?: string;
      HEALTH_STATUS?: string;
      LETTER_UNDERTAKING?: string;
      TRANSIT_TIME?: string;
      DOCCUMENT_CHECK?: string;
      DELIVERY_REMARKS?: string;
      DELIVERED_ON?: string;
      CARGO_RECEIVED?: string;
      DELIVERED_BY?: string;
      RECEIVED_DATE?: string;
      CHECKLIST_NO?: string;
      BACKORDER_PICK?: string;
      CANCELED_BY?: string;
      CANCEL_REMARKS?: string;
      SEND_MAIL?: string;
      BACKLOG_MAIL?: string;
      DPLAN_FLAG?: string;
      TRANS_BATCH_ID?: string;
      SEND_MAIL_DN?: string;
      KPI_INC?: string;
      KPI_EXC_REMARK?: string;
      JOB_CATEGORY?: string;
      EDIT_USER?: string;
      TX_CAT_CODE?: string;
      BCF_CODE?: string;
      DN_PRINT_DATE?: string;
      DEC_TYPE?: string;
      LAB_CODE?: string;
      TEST_CODE?: string;
      DEC_DATE?: string;
      DEC_NO?: string;
      TALLY_TYPE?: string;
      ORDER_SRNO?: string;
      MEMBER_TYPE?: string;
      SALE_TYPE?: string;
      FORWARDER_CODE?: string;
      CONTR_DEPOSIT?: string;
      CONTR_DEPOSIT_AMT?: number;
      TEMP_EXP?: string;
      JOB_START_DATE?: string;
      FEEDER_VESSEL_NAME?: string;
      JOB_FLAG?: string;
      HOUSE_APPRTN?: string;
      WALKIN_PRIN_CODE?: string;

      CREATED_BY: string;
      UPDATED_BY: string;
    }) =>
    async (dispatch: any): Promise<boolean> => {
      try {
        const response = await axiosServices.put<IApiResponse<any>>(
          '/api/wms/inbound/upsertTIJobHandler',
          payload
        );

        if (response.data?.success) {
          dispatch(
            openSnackbar({
              open: true,
              message: response.data.message || 'TI Job saved successfully.',
              variant: 'alert',
              alert: { color: 'success' },
              close: true
            })
          );
          return true;
        }

        throw new Error(response.data?.message || 'Save failed');
      } catch (error: any) {
        dispatch(
          openSnackbar({
            open: true,
            message:
              error?.response?.data?.message ||
              error.message ||
              'Something went wrong',
            variant: 'alert',
            alert: { color: 'error' },
            severity: 'error',
            close: true
          })
        );
        return false;
      }
    };
}

const CreateInboundJobServiceInstance = new InboundJob();
export default CreateInboundJobServiceInstance;
