import { FileOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Watermark } from 'antd';
import TransactionChildrenTable from 'components/tables/Accounts/Transaction/TransactionChildrenTable';
import TransactionDetailTable from 'components/tables/Accounts/Transaction/TransactionDetailTable';
import { useFormik } from 'formik';
import {
  TDetailRowSelection,
  TTransactionChildren,
  TTransactionDetails,
  TTransactionDocumentFrom,
  TTransactionDocumentHeader
} from 'pages/accounts/transaction/types/transaction.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TTransactionExpenseDetail } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import transactionsServiceInstance from 'service/Finance/Accounts/service.transaction';
import { transactionDocumentType } from 'utils/constants';
import getTransactionDocument from 'utils/formInitialValues/accountsFormInitialValues';
import { v4 as UIDV4 } from 'uuid';
import * as yup from 'yup';
import TransactionHeaderForm from './TransactionHeaderForm';

// Define the props for the component
type TProps = {
  canceled: string;
  onClose: (refetchData?: boolean) => void;
  isEdit: boolean;
  doc_no: string;
  div_code: string;
  doc_type: string;
};

// Define the form props
type TFormProps = TTransactionDocumentHeader & {
  detail: (TTransactionDetails & { id: string; isEditMode: boolean; ac_name: string })[];
  children: { [key: string]: TTransactionChildren<''>[] };
};

// Define the default formik data type
type TDefaultFormikData =
  | {
      Account: TAccountChildren;
      Currency: TCurrency;
      Division: TDivision;
      Accountsetup: { tax_perc: number; lcur_decimal_nos: number };
      MS_AC_BANKCODE: { ac_name: string };
    }
  | undefined;

// Define the details table type
type TDetailsTable = (TTransactionDetails & { Account: { ac_name: string } })[] | undefined;

// Main component
const AddTransactionDocumentForm = ({ canceled, onClose, isEdit, doc_no, div_code, doc_type }: TProps) => {
  //-----------------constants-----------
  const [isPresentChild, setIsPresentChild] = useState<{ [key: string]: boolean }>(); // State for validation
  const [childAmountData, setChildAmountData] = useState<number>(0); // State for child amount data

  // Validation schema for formik
  const validationSchema = yup.object().shape({
    ac_code: yup.string().required('This field is required'),
    doc_type: yup
      .string()
      .oneOf([transactionDocumentType.CHEQUE_PAYMENT, transactionDocumentType.CHEQUE_RECEIPT, transactionDocumentType.CASH_RECEIPT]),
    cheque_no: yup.string().when('doc_type', {
      is: [transactionDocumentType.CHEQUE_RECEIPT, transactionDocumentType.CHEQUE_PAYMENT],
      then: (schema) => schema.required('This field is required'),
      otherwise: (schema) => schema
    }),
    cheque_date: yup.date().when('doc_type', {
      is: [transactionDocumentType.CHEQUE_RECEIPT, transactionDocumentType.CHEQUE_PAYMENT],
      then: (schema) => schema.required('This field is required'),
      otherwise: (schema) => schema
    }),
    curr_code: yup.string().required('This field is required'),
    ex_rate: yup.number().required('This field is required'),
    div_code: yup.number().required('This field is required'),
    detail: yup.array().of(
      yup.object().shape({
        ac_code: yup.string().min(1).required('required'),
        amount: yup
          .number()
          .required('required')
          .max(Infinity, 'Amount exceeds available sum in children')
          .test('max-amount', 'Amount exceeds available sum in children', function (value) {
            const childSum =
              this.options.context?.children?.[this?.parent?.id]?.reduce(
                (sum: number, child: any) => sum + parseFloat(child?.amount ?? 0),
                0
              ) || 0;

            return isPresentChild?.[this.parent?.id] ? value === childSum : true;
          })
      })
    )
  });

  const [selectedRow, setSelectedRow] = useState<{ [key: string]: string }>(); // State for selected row
  const [rowTableData, setRowTableData] = useState<TDetailRowSelection>(); // State for row table data
  let random = useMemo(() => Math.random(), []); // Random value for query key

  //--------------------handler---------------------
  const handleSubmit = async (
    values: TTransactionDocumentHeader & {
      detail: (TTransactionDetails & {
        id: string;
        isEditMode: boolean;
        ac_name: string;
        IsDeletable?: boolean;
        dept_name?: string;
        curr_name?: string;
      })[];
      children: { [key: string]: TTransactionChildren<''>[] };
    }
  ) => {
    /*
     * Complete flow for invoice children
     * This function compares fetched and existing invoice data, assigns a unique `dtl_sr_no` to new records, marks unmatched invoices as deletable, and combines all into a final dataset.
     * On the frontend, when a new item is added, it checks the last item's `dtl_sr_no` and increments it by 1. Before submitting, it filters out rows with amount = 0 and non-deletable new records,
     * then assigns a `dtl_sr_no` to the newly added rows (where `dtl_sr_no = -1`), ensuring all records have unique identifiers and are ready for submission.
     */
    formik.setSubmitting(true);
    const tempChildrenData: { [key in 'invoice' | 'job' | 'expense']: any[] } = Object.entries(values.children).reduce(
      (acc, [eachKey, eachDetailedRowData]) => {
        const tableName = rowTableData?.[eachKey]?.table.name as 'invoice' | 'job' | 'expense';

        if (tableName) {
          // Step 1: Initialize maxDtlSrNo and process the rows
          let maxDtlSrNo = 0; // Initialize maxDtlSrNo for this table

          const detailedRows = eachDetailedRowData
            .map((eachChildren) => {
              const { isEditMode, ...childrenData } = eachChildren;

              // Exclude invoices with amount = 0 if they are newly added or default
              if (tableName === 'invoice' && eachChildren.amount === 0 && (!isEditMode || (isEditMode && !eachChildren.IsDeletable))) {
                return null;
              }

              // For expense, remove unwanted fields
              if (tableName === 'expense') {
                delete (eachChildren as TTransactionExpenseDetail).exp_description;
                delete (eachChildren as TTransactionExpenseDetail).exp_subtype_description;
              }

              let payloadData = childrenData;

              // If table is invoice and item is in edit mode, remove IsDeletable field
              if (tableName === 'invoice') {
                if (isEdit) {
                  const { IsDeletable, ...data } = childrenData;
                  payloadData = data;
                  console.log(IsDeletable);
                } else {
                  // Flag newly added rows with dtl_sr_no = -1
                  payloadData.dtl_sr_no = -1;
                }

                delete payloadData.curr_name;
                delete payloadData.c_curr_name_orgin;
              }

              // Step 2: Calculate maxDtlSrNo for rows with isEditMode === true
              if (isEditMode && eachChildren.dtl_sr_no) {
                maxDtlSrNo = Math.max(maxDtlSrNo, eachChildren.dtl_sr_no);
              }

              return payloadData;
            })
            .filter(Boolean); // Filter out any null or undefined items

          // Step 3: Assign dtl_sr_no only to newly added rows (where dtl_sr_no = -1)
          detailedRows.forEach((row) => {
            if (row?.dtl_sr_no === -1) {
              // This is a newly added row (not in edit mode), assign it a new dtl_sr_no
              row.dtl_sr_no = ++maxDtlSrNo;
            }
          });

          // Step 4: Accumulate the processed rows in the final structure
          if (!acc[tableName]) {
            acc[tableName] = [];
          }
          acc[tableName] = [...acc[tableName], ...detailedRows];
        }

        return acc;
      },
      {} as { [key in 'invoice' | 'job' | 'expense']: any[] }
    );
    const { curr_name, ...header } = values;
    console.log(curr_name);

    const tempData = {
      ...header,
      files: values.files?.filter((eachFile) => eachFile.sr_no === undefined),
      detail: values.detail.map((eachDetail) => {
        const { isEditMode, id, ac_name, dept_name, curr_name, ...detail } = eachDetail;
        console.log(isEditMode, id, ac_name, dept_name, curr_name);

        return detail;
      }),
      children: tempChildrenData
    };
    if (doc_type !== transactionDocumentType.CHEQUE_PAYMENT) {
      delete tempData.ac_payee;
      delete tempData.files;
    }
    if (doc_type !== transactionDocumentType.CHEQUE_RECEIPT) {
      delete tempData.cheque_bank;
    }
    if (doc_type === transactionDocumentType.CASH_RECEIPT) {
      delete tempData.bank_ac_code;
      delete tempData.cheque_no;
      delete tempData.cheque_date;
    }
    let response;
    if (isEdit) {
      response = await transactionsServiceInstance.updateTransactionDocument(tempData);
    } else {
      response = await transactionsServiceInstance.createTransactionDocument(tempData);
    }
    formik.setSubmitting(false);
    if (response) onClose(true);
  };

  // Initialize form with values if editing
  const initializeFormWithValues = () => {
    if (!!isEdit && !!transactionHeaderData && !!transactionDetailData && Object.keys(transactionHeaderData).length > 0) {
      const {
        doc_no,
        doc_type,
        ac_code,
        bank_ac_code,
        doc_date,
        remarks,
        curr_code,
        ex_rate,
        cheque_no,
        cheque_date,
        ac_payee,
        div_code,
        cheque_bank
      } = transactionHeaderData;

      const tempData = {
        ac_code,
        doc_no,
        doc_type,
        doc_date,
        remarks,
        curr_code,
        ex_rate,
        div_code,
        ...(transactionDocumentType.CASH_RECEIPT !== doc_type && { bank_ac_code, cheque_no, cheque_date }),
        ...(doc_type === transactionDocumentType.CHEQUE_RECEIPT && { cheque_bank }),
        ...(transactionDocumentType.CHEQUE_PAYMENT === doc_type && { ac_payee }),
        detail: transactionDetailData.map((eachDetail) => ({
          lcur_amount: eachDetail.lcur_amount,
          serial_no: eachDetail?.serial_no,
          doc_no: eachDetail.doc_no,
          doc_type,
          div_code: eachDetail.div_code,
          doc_date: eachDetail.doc_date,
          company_code: eachDetail?.company_code,
          isEditMode: true,
          //------remaining
          id: UIDV4(),
          ac_code: eachDetail.ac_code,
          ac_name: eachDetail.Account.ac_name,
          remarks: eachDetail.remarks,
          curr_code: eachDetail.curr_code,
          curr_name: eachDetail?.Currency?.curr_name ?? '',
          amount: eachDetail.amount,
          sign_ind: eachDetail.sign_ind,
          tx_compntcat_code_1: eachDetail.tx_compntcat_code_1,
          tx_cat_code: eachDetail.tx_cat_code,
          tx_compnt_1_expmt: eachDetail.tx_compnt_1_expmt,
          tx_compnt_lcuramt_1: eachDetail.tx_compnt_lcuramt_1,
          tx_compnt_perc_1: eachDetail.tx_compnt_perc_1,
          tx_compnt_amt_1: eachDetail.tx_compnt_amt_1,
          job_no: eachDetail.job_no,
          dept_code: eachDetail.dept_code,
          dept_name: eachDetail.Department?.dept_name,
          ex_rate: eachDetail.ex_rate ?? 1
        })),
        children: {} as { [key: string]: TTransactionChildren<''>[] }
      };

      formik.setValues(tempData);
    }
  };

  // Reset table data when division code changes
  const resetTableOnDivChange = () => {
    if (!isEdit && formik.values.detail.length > 0) {
      formik.setFieldValue('detail', []);
      formik.setFieldValue('children', []);
    }
  };

  // Update table document date
  const updateTableDocDate = () => {
    if (!!formik.values.detail) {
      let tempChildrenData: any = {};
      const tempDetailData = formik.values.detail?.map((eachDetail: any) => {
        tempChildrenData[eachDetail.id] = formik.values?.children[eachDetail.id]?.map((eachChildren: any) => ({
          ...eachChildren,
          doc_date: formik.values.doc_date
        }));
        return { ...eachDetail, doc_date: formik.values.doc_date };
      });

      formik.setFieldValue('detail', tempDetailData);
      formik.setFieldValue('children', tempChildrenData);
    }
  };

  //--------------------formik---------------------
  const formik = useFormik<TFormProps>({
    initialValues: getTransactionDocument(doc_type).TRANSACTION.TRANSACTION_DOCUMENT as TFormProps, // Initial values for formik
    validationSchema, // Validation schema
    onSubmit: handleSubmit // Submit handler
  });

  //----------------useQuery-----------------
  const { data: transactionDefaultData } = useQuery<TDefaultFormikData>({
    queryKey: [`transaction_default_data`],
    queryFn: () => transactionsServiceInstance.getTransactionDefaultData(doc_type, isEdit),
    enabled: !isEdit
  });
  const { data: transactionDetailData } = useQuery<TDetailsTable>({
    queryKey: [`transaction_detail_data` + random],
    queryFn: () => transactionsServiceInstance.getTransactionExistingDetailData(doc_no, div_code, doc_type),
    enabled: isEdit === true
  });
  const { data: transactionHeaderData } = useQuery<TTransactionDocumentFrom | undefined>({
    queryKey: [`transaction_header_data` + random],
    queryFn: () => transactionsServiceInstance.getTransactionExistingHeaderData(doc_no, formik.values.doc_type),
    enabled: isEdit === true
  });

  //----------------useEffect-----------------
  useEffect(() => {
    initializeFormWithValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionHeaderData, transactionDetailData]);

  useEffect(() => {
    resetTableOnDivChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.div_code]);

  useEffect(() => {
    updateTableDocDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.doc_date]);

  useEffect(() => {
    console.log('formik.values', formik.values);
  }, [formik.values]);

  useEffect(() => {
    if (!!selectedRow && Object.keys(selectedRow)[0].length > 0) {
      setChildAmountData((prev) => prev + 1);
    }
  }, [selectedRow]);

  return (
    <Watermark content={canceled === 'Y' ? 'Cancelled' : ''} font={{ color: 'red' }}>
      <Grid container spacing={2} paddingTop={1} component={'form'} onSubmit={formik.handleSubmit} className="h-full">
        {/*--------------------Header-------------- */}
        <TransactionHeaderForm
          disabled={canceled === 'Y' ? true : false} // Disable form if canceled
          formik={formik} // Formik instance
          isEdit={isEdit} // Edit mode flag
          defaultHeaderData={transactionDefaultData} // Default header data
          initialValues={{
            ac_name: transactionHeaderData?.Account?.ac_name ?? '',
            ac_payee: transactionHeaderData?.ac_payee ?? '',
            bank_ac_name: transactionHeaderData?.MS_AC_BANKCODE?.Account?.ac_name ?? '',
            curr_name: transactionHeaderData?.Currency?.curr_name ?? '',
            div_name: transactionHeaderData?.Division?.div_name ?? ''
          }}
        />

        {/*--------------------Detail-------------- */}
        <TransactionDetailTable
          setChildAmountData={setChildAmountData} // Setter for child amount data
          isEdit={isEdit} // Edit mode flag
          formik={formik} // Formik instance
          disabled={canceled === 'Y' ? true : false} // Disable form if canceled
          selectedRow={selectedRow} // Selected row state
          rowTableData={rowTableData} // Row table data state
          setSelectedRow={setSelectedRow} // Setter for selected row state
          setRowTableData={setRowTableData} // Setter for row table data state
          documentData={transactionDefaultData} // Default document data
          setIsPresentChild={setIsPresentChild} // Setter for validation state
        />

        {/*--------------------Children-------------- */}
        {!!selectedRow && !!rowTableData && (
          <TransactionChildrenTable
            childAmountData={childAmountData} // Child amount data state
            setChildAmountData={setChildAmountData} // Setter for child amount data state
            disabled={canceled === 'Y' ? true : false} // Disable form if canceled
            formik={formik} // Formik instance
            selectedRow={selectedRow} // Selected row state
            rowTableData={rowTableData} // Row table data state
            documentData={transactionDefaultData} // Default document data
            isEdit={isEdit} // Edit mode flag
          />
        )}
        {/* --------------------Submit Form---------------- */}
        <Grid item xs={12} className="flex justify-end">
          <Button
            size="small"
            type="submit"
            startIcon={formik.isSubmitting ? <LoadingOutlined /> : <FileOutlined />}
            disabled={canceled === 'Y' || formik.isSubmitting} // Disable button if canceled or submitting
            variant="contained"
          >
            <FormattedMessage id="Submit" />
          </Button>
        </Grid>
      </Grid>
    </Watermark>
  );
};

export default AddTransactionDocumentForm;
