import dayjs from 'dayjs';
import { transactionDocumentType } from '../constants';
import { TTransactionChildren } from 'pages/accounts/transaction/types/transaction.types';

const getTransactionDocument = (field: unknown) => ({
  TRANSACTION: {
    TRANSACTION_DOCUMENT: {
      doc_no: 0,
      doc_type: field, // Dynamically set doc_type
      ...(transactionDocumentType.CASH_RECEIPT !== field && {
        bank_ac_code: '',
        cheque_no: '',
        cheque_date: dayjs(new Date()).toISOString()
      }),
      ac_code: '',
      doc_date: dayjs(new Date()).toISOString(),
      remarks: '',
      curr_code: '',
      curr_name: '',

      ex_rate: 1,
      ...(field === transactionDocumentType.CHEQUE_RECEIPT && { cheque_bank: '' }),

      ...(field === transactionDocumentType.CHEQUE_PAYMENT && { ac_payee: '', files: [] }),
      div_code: '',
      detail: [],
      children: {} as { [key: string]: TTransactionChildren<''>[] }
    }
  }
});

export default getTransactionDocument;
