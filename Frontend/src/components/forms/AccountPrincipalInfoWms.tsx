import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import * as yup from 'yup';

import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Files from 'components/Files';
import UniversalDialog from 'components/popup/UniversalDialog';
import { getIn, useFormik } from 'formik';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TAccountPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import FileUploadServiceInstance from 'service/services.files';
import { useSelector } from 'store';
import { TFile } from 'types/types.file';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { FormattedMessage } from 'react-intl';

const AccountPrincipalInfoWms = ({
  prin_code,
  isEditMode,

  handleNext,
  handleBack,
  accountInfo,
  setAccountInfo
}: {
  prin_code: string;
  isEditMode: boolean;
  handleNext: () => void;
  handleBack: () => void;
  accountInfo: TAccountPrincipalWms;
  setAccountInfo: (value: TAccountPrincipalWms) => void;
}) => {
  //----------------constants-----------------
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const [filesData, setFilesData] = useState<TFile[]>([]);

  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Upload Files'
  });

  //----------------formik-----------------
  const formik = useFormik<TAccountPrincipalWms>({
    initialValues: accountInfo,
    validationSchema: yup.object().shape({
      curr_code: yup.string().required('This field is required') // Validation for currency code
    }),
    onSubmit: async (values) => {
      setAccountInfo(values); // Update account info state
      handleNext(); // Proceed to the next step
    }
  });

  //----------------useQuery-----------------
  const { data: currencyList } = useQuery({
    queryKey: ['currency_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'currency', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TCurrency[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  const { data: files } = useQuery({
    queryKey: ['files_data'],
    queryFn: () => FileUploadServiceInstance.getFile(pathNameList[pathNameList.length - 1].slice(0, 3).toUpperCase() + prin_code),
    enabled: isEditMode // Only fetch files in edit mode
  });

  //------------------handlers-----------------
  const handleUploadPopup = () => {
    if (uploadFilesPopup.action.open === true) {
      formik.setFieldValue('files', filesData); // Set formik field value for files
      // set data as per serial number
    }
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } }; // Toggle popup open state
    });
  };

  //-----------useEffects---------
  useEffect(() => {
    if (files) {
      formik.setFieldValue('files', files); // Set formik field value for files
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    if (!!accountInfo && !!Object.keys(accountInfo).length) formik.setValues(accountInfo); // Set formik values if account info is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfo]);

  return (
    <Grid container spacing={8} component={'form'} onSubmit={formik.handleSubmit}>
      {/*----------------------Tax and Registration Information-------------------------- */}
      <Grid item xs={12} sm={6}>
        <Grid container spacing={4}>
          <Grid item container xs={12} spacing={2}>
            <Grid item xs={12}>
              <div className="flex flex-col sm:flex-row space-x-2">
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  <FormattedMessage id="Tax and Registration Information" />
                </Typography>
                <Button
                  size="extraSmall"
                  onClick={() => handleUploadPopup()}
                  // variant="dashed"
                >
                  <FormattedMessage id="Upload Document" />
                </Button>
              </div>
            </Grid>
            {/*----------------------Tax Registered No.-------------------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Tax Registered No." />
              </InputLabel>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="trn_no"
                name="trn_no"
                fullWidth
                value={formik.values.trn_no}
              />
            </Grid>
            {/*----------------------Tax Registration Expiry Date-------------------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Tax Registration Expiry Date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: 'small' } }}
                  className="w-full "
                  value={formik.values.trn_exp_date ? dayjs(formik.values.trn_exp_date) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (newValue?.isValid()) formik.setFieldValue('trn_exp_date', newValue.toISOString());
                  }}
                />
              </LocalizationProvider>
            </Grid>
            {/*----------------------Commercial Registered No.-------------------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Commercial Registered No." />
              </InputLabel>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="comm_reg_no"
                name="comm_reg_no"
                fullWidth
                value={formik.values.comm_reg_no}
              />
            </Grid>
            {/*----------------------Commercial Registration No. Expiry Date-------------------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Commercial Registration No." />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { size: 'small' } }}
                  className="w-full"
                  value={formik.values.comm_reg_exp_date ? dayjs(formik.values.comm_reg_exp_date) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (newValue?.isValid()) formik.setFieldValue('comm_reg_exp_date', newValue.toISOString());
                  }}
                />
              </LocalizationProvider>
            </Grid>
            {/*----------------------License No.-------------------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="License No." />
              </InputLabel>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="prin_lic_no"
                name="prin_lic_no"
                fullWidth
                value={formik.values.prin_lic_no}
              />
            </Grid>
            {/*----------------------License Type-------------------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="License Type" />
              </InputLabel>
              <TextField
                size="small"
                onChange={formik.handleChange}
                id="prin_lic_type"
                name="prin_lic_type"
                fullWidth
                value={formik.values.prin_lic_type}
              />
            </Grid>
          </Grid>

          {/*----------------------Currency and Upload Information-------------------------- */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*----------------------Default Currency-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Default Currency" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <Autocomplete
                  id="curr_code"
                  value={
                    !!formik.values.curr_code
                      ? currencyList?.tableData?.find((eachCurrency) => eachCurrency.curr_code === formik.values.curr_code)
                      : ({ curr_name: '' } as TCurrency)
                  }
                  onChange={(event, value: TCurrency | null) => {
                    formik.setFieldValue('curr_code', value?.curr_code);
                  }}
                  size="small"
                  options={currencyList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.curr_name}
                  isOptionEqualToValue={(option) => option.curr_code === formik.values.curr_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
                {getIn(formik.touched, 'curr_code') && getIn(formik.errors, 'curr_code') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'curr_code')}
                  </FormHelperText>
                )}
              </Grid>
              {/*----------------------In Designated Zone-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="In Designatted Zone" />
                </InputLabel>
                <FormControlLabel
                  control={<Checkbox onChange={(event, checked) => formik.setFieldValue('prin_infze', checked ? 'Y' : 'N')} />}
                  checked={formik.values.prin_infze === 'Y'}
                  name="prin_infze"
                  label={'Yes/No'}
                  value={formik.values.prin_infze}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/*----------------------Account and Credit Information-------------------------- */}
      <Grid item xs={12} sm={6}>
        <Grid container spacing={4}>
          <Grid item container xs={12} spacing={2}>
            {/*----------------------Account and Credit Information: Heading-------------------------- */}
            <Grid item xs={12}>
              <Typography variant="h4" className="text-black py-2 font-semibold">
                <FormattedMessage id="Account and Credit Information" />
              </Typography>
            </Grid>
            {/*----------------------A/C Reference-------------------------- */}
            <Grid item container xs={12}>
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="A/C Regerence" />
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="prin_acref"
                  name="prin_acref"
                  fullWidth
                  value={formik.values.prin_acref}
                />
              </Grid>
            </Grid>

            {/*----------------------Credit Limit-------------------------- */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Credit Limit" />
              </InputLabel>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                InputProps={{
                  inputProps: {
                    style: { textAlign: 'right' }
                  }
                }}
                id="credit_limit"
                name="credit_limit"
                fullWidth
                value={formik.values.credit_limit}
              />
            </Grid>
            {/*----------------------Credit Period (WMS)-------------------------- */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Credit Period (WMS)" />
              </InputLabel>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="creditdays"
                name="creditdays"
                fullWidth
                value={formik.values.creditdays}
              />
            </Grid>
            {/*----------------------Credit Frieght-------------------------- */}

            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="(Frieght)" />
              </InputLabel>
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                InputProps={{
                  inputProps: {
                    style: { textAlign: 'right' }
                  }
                }}
                id="creditdays_freight"
                name="creditdays_freight"
                fullWidth
                value={formik.values.creditdays_freight}
              />
            </Grid>
          </Grid>

          {/*----------------------Invoice and Transaction History-------------------------- */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  <FormattedMessage id="Invoice and Transaction History" />
                </Typography>
              </Grid>

              {/*----------------------Import Code-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Import Code" />
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="prin_imp_code"
                  name="prin_imp_code"
                  fullWidth
                  value={formik.values.prin_imp_code}
                />
              </Grid>
              {/*----------------------Parent Principal Code-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Parent Principal Code" />
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="parent_prin_code"
                  name="parent_prin_code"
                  fullWidth
                  value={formik.values.parent_prin_code}
                />
              </Grid>
              {/*----------------------Last Invoice Date-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Last Invoice Date" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                    className="w-full"
                    value={formik.values.prin_invdate ? dayjs(formik.values.prin_invdate) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) formik.setFieldValue('prin_invdate', newValue.toISOString());
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} marginTop={12}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Back" />
          </Button>
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Next" />
          </Button>
        </Stack>
      </Grid>
      {!!uploadFilesPopup && uploadFilesPopup.action.open && (
        <UniversalDialog
          action={{ ...uploadFilesPopup.action }}
          onClose={handleUploadPopup}
          title={uploadFilesPopup.title}
          hasPrimaryButton={false}
        >
          <Files existingFilesData={formik.values.files ?? []} filesData={filesData} setFilesData={setFilesData} />
        </UniversalDialog>
      )}
    </Grid>
  );
};

export default AccountPrincipalInfoWms;
