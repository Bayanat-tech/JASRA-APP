// Import necessary components and hooks from various libraries
import { SearchOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, IconButton, InputLabel, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import Files from 'components/Files';
import DataSelection from 'components/popup/DataSelection';
import UniversalDialog from 'components/popup/UniversalDialog';
import dayjs, { Dayjs } from 'dayjs';
import { getIn } from 'formik';
import { TChequePayment } from 'pages/accounts/transaction/types/transaction.types';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import transactionsServiceInstance from 'service/Finance/Accounts/service.transaction';
import FileUploadServiceInstance from 'service/services.files';
import { TDataSelection, TPair } from 'types/common';
import { TFile } from 'types/types.file';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { filter, transactionDocumentType } from 'utils/constants';
import { formateAmount, handleDateChange } from 'utils/functions';

// Define the props for the component
type TProps = {
  disabled: boolean; // Flag to disable the form
  formik: any; // Formik instance
  isEdit: boolean; // Flag to indicate if it's in edit mode
  defaultHeaderData:
    | {
        Account: TAccountChildren;
        Currency: TCurrency;
        Division: TDivision;
        MS_AC_BANKCODE: { ac_name: string };
        Accountsetup: {
          tax_perc: number;
          lcur_decimal_nos: number;
        };
      }
    | undefined; // Default header data
  initialValues: { ac_name: string; ac_payee: string; bank_ac_name: string; curr_name: string; div_name: string }; // Initial values for the form
};
const TransactionHeaderForm = ({ formik, isEdit, defaultHeaderData, initialValues, disabled }: TProps) => {
  //-------------constants------------
  const [filesData, setFilesData] = useState<TFile[]>([]); // State to manage files data
  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Upload Files'
  }); // State to manage upload files popup
  const [toggleDataSelectionPopup, setToggleDataSelectionPopup] = useState<TDataSelection>({
    is_mounted: false,
    selected: { label: '', value: '' },
    data: initialValues
  }); // State to manage data selection popup

  //-----------------useQuery----------
  const { data: files } = useQuery({
    queryKey: ['files_data'],
    queryFn: () => FileUploadServiceInstance.getFile(transactionDocumentType.CHEQUE_PAYMENT + formik.values.doc_no),
    enabled: !!isEdit && !!formik.values.doc_no && formik.values.doc_type === transactionDocumentType.CHEQUE_PAYMENT
  });

  const { data: chequeDetail } = useQuery<TChequePayment | undefined>({
    queryKey: ['cheque_details', formik.values.ac_code],
    queryFn: () => transactionsServiceInstance.getCheque(formik.values.ac_code),
    enabled: !!formik.values.ac_code && formik.values.doc_type !== transactionDocumentType.CASH_RECEIPT
  }); // Query to fetch cheque details

  //----------------handlers------------
  const handleUploadPopup = () => {
    if (uploadFilesPopup.action.open === true) {
      formik.setFieldValue('files', filesData); // Set files data in formik
    }
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } }; // Toggle upload files popup
    });
  };

  const handleSelected = (selectedItem: TPair<'ex_rate'>) => {
    switch (toggleDataSelectionPopup.selected.value) {
      case 'account': {
        formik.setFieldValue('ac_code', selectedItem.value); // Set account code in formik
        setToggleDataSelectionPopup((prev) => ({
          data: { ...prev.data, ac_name: selectedItem.label },
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'division': {
        formik.setFieldValue('div_code', selectedItem.value); // Set division code in formik
        setToggleDataSelectionPopup((prev) => ({
          data: { ...prev.data, div_name: selectedItem.label },
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'ac_payee': {
        formik.setFieldValue('ac_payee', selectedItem.value); // Set account payee in formik
        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'currency': {
        formik.setFieldValue('curr_code', selectedItem.value); // Set currency code in formik
        formik.setFieldValue('curr_name', selectedItem.label); // Set currency name in formik
        formik.setFieldValue('ex_rate', selectedItem.ex_rate ?? 1); // Set exchange rate in formik
        setToggleDataSelectionPopup((prev) => ({
          ...prev,
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
      case 'bank': {
        formik.setFieldValue('bank_ac_code', selectedItem.value); // Set bank account code in formik
        setToggleDataSelectionPopup((prev) => ({
          data: { ...prev.data, bank_ac_name: selectedItem.label },
          selected: { label: '', value: '' },
          is_mounted: !prev.is_mounted
        }));
        break;
      }
    }
  };

  const handleToggleDataSelectionPopup = (selectedItem: TPair<''>) => {
    setToggleDataSelectionPopup((prev) => ({
      ...prev,
      selected: { label: !prev.is_mounted ? selectedItem.label : '', value: !prev.is_mounted ? selectedItem.value : '' },
      is_mounted: !prev.is_mounted
    })); // Toggle data selection popup
  };

  const handleDefaultHeaderData = () => {
    if (defaultHeaderData && !isEdit) {
      setToggleDataSelectionPopup((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          bank_ac_name: defaultHeaderData?.MS_AC_BANKCODE?.ac_name ?? ' ',
          ac_name: defaultHeaderData?.Account?.ac_name ?? '',
          div_name: defaultHeaderData?.Division?.div_name,
          ac_payee: ''
        }
      }));
      formik.setFieldValue('curr_name', defaultHeaderData?.Currency?.curr_name ?? ''); // Set currency name in formik
      formik.setFieldValue('ac_code', defaultHeaderData?.Account?.ac_code ?? ''); // Set account code in formik
      formik.setFieldValue('div_code', defaultHeaderData?.Division?.div_code ?? ''); // Set division code in formik
      formik.setFieldValue('curr_code', defaultHeaderData?.Currency?.curr_code ?? ''); // Set currency code in formik
      formik.setFieldValue('ex_rate', defaultHeaderData?.Currency?.ex_rate ?? 1); // Set exchange rate in formik
    }
  };

  //----------------useEffect-----------------
  useEffect(() => {
    handleDefaultHeaderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultHeaderData]);

  useEffect(() => {
    if (!!files) {
      formik.setFieldValue('files', files); // Set files data in formik
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    if (chequeDetail) formik.setFieldValue('cheque_no', chequeDetail.last_cheque_no); // Set cheque number in formik
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chequeDetail]);

  useEffect(() => {
    if (!!isEdit && !formik.values.ac_code) {
      setToggleDataSelectionPopup((prev) => ({ ...prev, data: initialValues })); // Set initial values in data selection popup
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useEffect(() => {
    if (!!toggleDataSelectionPopup.data.curr_name) {
      formik.setFieldValue('curr_name', toggleDataSelectionPopup.data.curr_name); // Set currency name in formik
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleDataSelectionPopup.data.curr_name]);

  return (
    <Grid container item xs={12} spacing={2}>
      {/*----------------------Doc Code-------------------------- */}
      <Grid item xs={12} sm={6} md={2} hidden={!isEdit}>
        {/* TextField for Document Code */}
        <TextField label={<FormattedMessage id="Doc Code" />} disabled size="small" name="doc_no" fullWidth value={formik.values.doc_no} />
      </Grid>
      {/*----------------------Date-------------------------- */}
      <Grid item xs={12} sm={6} md={2}>
        {/* DatePicker for Document Date */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={
              <>
                <FormattedMessage id="Date" />
                <span className="text-red-500">*</span>
              </>
            }
            disabled={disabled}
            format="DD/MM/YYYY"
            name="doc_date"
            slotProps={{ textField: { size: 'small' } }}
            className="w-full"
            value={formik.values.doc_date ? dayjs(formik.values.doc_date) : null}
            onChange={(newValue: Dayjs | null) => handleDateChange(newValue, formik, 'doc_date')}
          />
          {getIn(formik.touched, 'doc_date') && getIn(formik.errors, 'doc_date') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'doc_date')}
            </FormHelperText>
          )}
        </LocalizationProvider>
      </Grid>
      {/*----------------------A/c code-------------------------- */}
      <Grid item xs={12} sm={6} md={2}>
        {/* TextField for Account Code */}
        <TextField
          label={
            <>
              <FormattedMessage id="A/c Code" />
              <span className="text-red-500">*</span>
            </>
          }
          disabled
          size="small"
          id="ac_name"
          fullWidth
          value={toggleDataSelectionPopup?.data?.ac_name ?? ''}
          error={getIn(formik.errors, 'ac_code')}
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled}
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Account', value: 'account' })}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
        {getIn(formik.touched, 'ac_code') && getIn(formik.errors, 'ac_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'ac_code')}
          </FormHelperText>
        )}
      </Grid>
      {/*----------------------Bank A/c-------------------------- */}
      <Grid item xs={12} sm={6} md={2} hidden={formik.values.doc_type === transactionDocumentType.CASH_RECEIPT}>
        {/* TextField for Bank Account Code */}
        <TextField
          label={<FormattedMessage id="Bank A/c" />}
          disabled
          size="small"
          id="bank_ac_code"
          fullWidth
          value={toggleDataSelectionPopup?.data.bank_ac_name}
          InputProps={{
            endAdornment: (
              <IconButton disabled={disabled} size="small" onClick={() => handleToggleDataSelectionPopup({ label: 'Bank', value: 'bank' })}>
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </Grid>
      {/*----------------------Cheque No-------------------------- */}
      <Grid item xs={12} sm={6} md={2} hidden={formik.values.doc_type === transactionDocumentType.CASH_RECEIPT}>
        {/* TextField for Cheque Number */}
        <TextField
          label={
            <>
              <FormattedMessage id="Cheque No" />
              <span className="text-red-500">*</span>
            </>
          }
          size="small"
          name="cheque_no"
          fullWidth
          value={formik.values.cheque_no}
          onChange={formik.handleChange}
          error={getIn(formik.touched, 'cheque_no') && getIn(formik.errors, 'cheque_no')}
        />
        {getIn(formik.touched, 'cheque_no') && getIn(formik.errors, 'cheque_no') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'cheque_no')}
          </FormHelperText>
        )}
      </Grid>
      {/*----------------------Cheque Date-------------------------- */}
      <Grid item xs={12} sm={6} md={2} hidden={formik.values.doc_type === transactionDocumentType.CASH_RECEIPT}>
        {/* DatePicker for Cheque Date */}
        <InputLabel></InputLabel>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={
              <>
                <FormattedMessage id="Cheque Date" />
                <span className="text-red-500">*</span>
              </>
            }
            disabled={disabled}
            format="DD/MM/YYYY"
            slotProps={{ textField: { size: 'small' } }}
            className="w-full"
            name="cheque_date"
            value={formik.values.cheque_date ? dayjs(formik.values.cheque_date) : null}
            onChange={(newValue: Dayjs | null) => {
              if (newValue?.isValid()) formik.setFieldValue('cheque_date', newValue.toISOString());
            }}
          />
          {getIn(formik.touched, 'cheque_date') && getIn(formik.errors, 'cheque_date') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'cheque_date')}
            </FormHelperText>
          )}
        </LocalizationProvider>
      </Grid>
      {/*----------------------Cheque Bank-------------------------- */}
      <Grid item xs={12} sm={6} md={2} hidden={formik.values.doc_type !== transactionDocumentType.CHEQUE_RECEIPT}>
        {/* TextField for Cheque Bank */}
        <TextField
          label={<FormattedMessage id="Cheque Bank" />}
          disabled={disabled}
          size="small"
          name="cheque_bank"
          fullWidth
          value={formik.values.cheque_bank}
          onChange={formik.handleChange}
        />
      </Grid>
      {/*----------------------Remarks-------------------------- */}
      <Grid item xs={12} sm={6} md={2}>
        {/* TextField for Remarks */}
        <TextField
          label={<FormattedMessage id="Remarks" />}
          disabled={disabled}
          size="small"
          name="remarks"
          fullWidth
          value={formik.values.remarks}
          onChange={formik.handleChange}
        />
      </Grid>
      {/*----------------------A/c Payee-------------------------- */}
      <Grid item xs={12} sm={6} md={2} hidden={formik.values.doc_type !== transactionDocumentType.CHEQUE_PAYMENT}>
        {/* TextField for Account Payee */}
        <TextField
          label={<FormattedMessage id="A/c Payee" />}
          // disabled={isEdit}
          size="small"
          id="ac_payee"
          fullWidth
          value={formik.values.ac_payee}
          onChange={formik.handleChange}
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled}
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Account Payee', value: 'ac_payee' })}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </Grid>
      {/*----------------------Curr Code-------------------------- */}
      <Grid item xs={12} sm={6} md={2}>
        {/* TextField for Currency Code */}
        <TextField
          label={
            <>
              <FormattedMessage id="Curr Code" />
              <span className="text-red-500">*</span>
            </>
          }
          disabled
          size="small"
          id="curr_code"
          fullWidth
          value={formik.values.curr_name ?? ' '}
          error={getIn(formik.errors, 'curr_code')}
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={disabled}
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Currency', value: 'currency' })}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
      </Grid>
      {/*----------------------Exchange-------------------------- */}
      <Grid item xs={12} sm={6} md={2}>
        {/* TextField for Exchange Rate */}
        <TextField
          label={
            <>
              <FormattedMessage id="Exchange" />
              <span className="text-red-500">*</span>
            </>
          }
          disabled={disabled}
          size="small"
          type="number"
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
            const inputValue = event.target.value;
            if (inputValue.charAt(0) !== '-') {
              formik.handleChange(event);
            }
          }}
          name="ex_rate"
          fullWidth
          value={formateAmount(formik.values.ex_rate, defaultHeaderData?.Accountsetup.lcur_decimal_nos) ?? ' '}
          error={getIn(formik.touched, 'ex_rate') && getIn(formik.errors, 'ex_rate')}
          InputProps={{
            inputProps: {
              style: { textAlign: 'right' }
            }
          }}
          variant="outlined"
        />
        {getIn(formik.touched, 'ex_rate') && getIn(formik.errors, 'ex_rate') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'ex_rate')}
          </FormHelperText>
        )}
      </Grid>
      {/*----------------------Division-------------------------- */}
      <Grid item xs={12} sm={6} md={2}>
        {/* TextField for Division Code */}
        <TextField
          label={
            <>
              <FormattedMessage id="Division" />
              <span className="text-red-500">*</span>
            </>
          }
          disabled
          size="small"
          id="div_code"
          name="div_code"
          fullWidth
          value={toggleDataSelectionPopup.data.div_name ?? ''}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={() => handleToggleDataSelectionPopup({ label: 'Division', value: 'division' })}
                disabled={isEdit}
              >
                <SearchOutlined />
              </IconButton>
            )
          }}
        />
        {getIn(formik.errors, 'div_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_code')}
          </FormHelperText>
        )}
      </Grid>
      {/* -----------------------Attach & View------------------ */}
      <Grid item xs={12} sm={6} md={2} hidden={formik.values.doc_type !== transactionDocumentType.CHEQUE_PAYMENT}>
        <div className="flex flex-col sm:flex-row space-x-4">
          {/* Button to Attach and View Files */}
          <Button disabled={disabled} variant="contained" onClick={() => handleUploadPopup()} size="small">
            <FormattedMessage id="Attach & View" />
          </Button>
        </div>
      </Grid>
      {/* --------------------Upload Files------------ */}
      {!!uploadFilesPopup && uploadFilesPopup.action.open && (
        <UniversalDialog
          action={{ ...uploadFilesPopup.action }}
          onClose={handleUploadPopup}
          title={uploadFilesPopup.title}
          hasPrimaryButton={false}
        >
          <Files
            level={2}
            handleUploadPopup={handleUploadPopup}
            existingFilesData={formik.values.files ?? []}
            filesData={filesData}
            setFilesData={setFilesData}
            module={formik.values.doc_type}
          />
        </UniversalDialog>
      )}

      {/* Check if the data selection popup is mounted and the selected value is one of the specified types */}
      {toggleDataSelectionPopup.is_mounted &&
        ['account', 'division', 'ac_payee', 'currency', 'bank'].includes(toggleDataSelectionPopup.selected.value) && (
          // Render the DataSelection component
          <DataSelection
            selectedItem={toggleDataSelectionPopup.selected} // Pass the selected item to the DataSelection component
            handleSelection={handleSelected} // Pass the handleSelected function to handle the selection
            filter={filter} // Pass the filter to the DataSelection component
          />
        )}
    </Grid>
  );
};

export default TransactionHeaderForm;
