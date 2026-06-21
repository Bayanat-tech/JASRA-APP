import { ISearch } from 'components/filters/SearchFilter';
import { TChequePayment, TTransactionDetails, TTransactionDocumentFrom } from 'pages/accounts/transaction/types/transaction.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { TMsCompanyInfo } from 'types/common';

import { IApiResponse } from 'types/types.services';
import axiosServices from 'utils/axios';

class Transaction {
  //------------------------Read--------------
  getCompanyInfo = async () => {
    try {
      const response: IApiResponse<TMsCompanyInfo> = await axiosServices.get(`api/finance/transactions/company_info`);

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
  getTransactionDefaultData = async (doc_id: string, isEditMode: boolean = false) => {
    try {
      const response: IApiResponse<
        TTransactionDetails & {
          Account: TAccountChildren;
          Currency: TCurrency;
          Division: TDivision;
          Accountsetup: { tax_perc: number; lcur_decimal_nos: number };
          MS_AC_BANKCODE: { ac_name: string };
        }
      > = await axiosServices.get(`api/finance/transactions/default_details?doc_id=${doc_id}&isEditMode=${isEditMode}`);

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
  getTransactionDocumentReport = async (selectedReport: string, filter: ISearch) => {
    try {
      const response: IApiResponse<unknown> = await axiosServices.get(`api/finance/transactions/${selectedReport}`, {
        params: {
          ...(filter && { filter: JSON.stringify(filter) })
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
  exportData = async () => {
    return new Promise((resolve, reject) => {
      axiosServices
        .get(`/api/finance/transactions/export`)
        .then((response) => {
          if (response.data) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `documents.csv`);
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
  getTransactionExistingHeaderData = async (doc_no: string, doc_type: string) => {
    try {
      const response: IApiResponse<TTransactionDocumentFrom | undefined> = await axiosServices.get(
        `api/finance/transactions/header/${doc_no}?doc_type=${doc_type}`
      );

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
  getTransactionExistingDetailData = async (doc_no: string, div_code: string, doc_type?: string) => {
    try {
      const response: IApiResponse<(TTransactionDetails & { Account: { ac_name: string } })[] | undefined> = await axiosServices.get(
        `api/finance/transactions/detail/${doc_no}?div_code=${div_code}&doc_type=${doc_type}`
      );

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
  getCheque = async (ac_code: string) => {
    try {
      const response: IApiResponse<TChequePayment> = await axiosServices.get(`api/finance/transactions/cheque_detail?ac_code=${ac_code}`);

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
  getChildName = async (ac_code: string) => {
    try {
      const response: IApiResponse<{ table: 'invoice' | 'job' | 'expense'; code?: string } | undefined> = await axiosServices.get(
        `api/finance/transactions/table_name/${ac_code}`
      );

      if (!!response.data.success && response.data.data) {
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

  //------------------------Create----------------
  createTransactionDocument = async (values: any) => {
    try {
      const response = await axiosServices.post(`api/finance/transactions/document`, values);
      if (response.data.success) {
        const responseStore: IApiResponse<string> = await axiosServices.post(`api/finance/transactions/document/storeProcess`, {
          doc_no: response.data.data.doc_no,
          doc_type: response.data.data.doc_type
        });
        return responseStore;
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

  //------------------------Update----------------
  cancelDocument = async ({ doc_no, doc_type }: { doc_no: number; doc_type: string }) => {
    try {
      const response: IApiResponse<null> = await axiosServices.put(
        `api/finance/transactions/cancel_cheque?doc_no=${doc_no}&doc_type=${doc_type}`
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
  updateTransactionDocument = async (values: any) => {
    try {
      const response: IApiResponse<string> = await axiosServices.put(`api/finance/transactions/document`, values);

      if (response.data.success === true && response.data.data) {
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
  //------------------------Delete----------------
  deleteTransactionDetailItem = async (doc_no: number, doc_type: string, serial_no: number, div_code: string, table: string) => {
    try {
      const response: IApiResponse<string> = await axiosServices.delete(`api/finance/transactions/detail_item/delete`, {
        params: {
          ...(doc_no && { doc_no }),
          ...(doc_type && { doc_type }),
          ...(serial_no && { serial_no }),
          ...(div_code && { div_code }),
          ...(table && { table })
        }
      });

      if (response.data.success === true && response.data.data) {
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
  deleteTransactionChildrenItem = async (
    doc_no: number,
    doc_type: string,
    serial_no: number,
    div_code: string,
    table: string,
    dtl_sr_no: number
  ) => {
    try {
      const response: IApiResponse<string> = await axiosServices.delete(`api/finance/transactions/children_item/delete`, {
        params: {
          ...(doc_no && { doc_no }),
          ...(doc_type && { doc_type }),
          ...(serial_no && { serial_no }),
          ...(div_code && { div_code }),
          ...(table && { table }),
          ...(dtl_sr_no && { dtl_sr_no })
        }
      });

      if (response.data.success === true && response.data.data) {
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
  deleteDocument = async (doc_no: string[], doc_type: string) => {
    try {
      const response: IApiResponse<null> = await axiosServices.delete(`api/finance/transactions/document/${doc_type}`, {
        params: {
          doc_no: JSON.stringify(doc_no)
        }
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
}
const transactionsServiceInstance = new Transaction();
export default transactionsServiceInstance;
