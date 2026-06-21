import { Autocomplete, Button, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TBankHr, TPayrollHr } from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import HrServiceInstance from 'service/Service.hr';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import * as yup from 'yup';
export const PayrollForm = ({
  handleNext,
  handleBack,
  payRollInfo,
  setPayRollInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  payRollInfo: TPayrollHr;
  setPayRollInfo: (value: TPayrollHr) => void;
}) => {
  // State to manage the open/close state of the mode of payment dropdown
  const [modePaymentOpen, setModePaymentOpen] = useState(false);
  // Get the app state from the Redux store
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  // Initialize formik with initial values, validation schema, and submit handler
  const formik = useFormik<TPayrollHr>({
    initialValues: payRollInfo,
    validationSchema: yup.object().shape({
      include_in_payroll: yup.string().required('This field is required')
    }),
    onSubmit: async (values) => {
      setPayRollInfo(values);
      handleNext();
    }
  });

  //-----------use Query-----------
  // Fetch bank data using react-query
  const { data: bankData } = useQuery({
    queryKey: ['bank_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters(app, 'hrBank');
      if (response) {
        return {
          tableData: response.tableData as TBankHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch currency data using react-query
  const { data: currencyData } = useQuery({
    queryKey: ['currency_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'currency');
      if (response) {
        return {
          tableData: response.tableData as TCurrency[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Handle closing of the mode of payment dropdown
  const handleModePaymentClose = () => {
    setModePaymentOpen(false);
  };

  // Handle opening of the mode of payment dropdown
  const handleModePaymentOpen = () => {
    setModePaymentOpen(true);
  };

  // Update formik values when payRollInfo changes
  useEffect(() => {
    if (!!payRollInfo && !!Object.keys(payRollInfo).length) {
      formik.setValues(payRollInfo);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payRollInfo]);
  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} marginBottom={3}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Payroll Information" />
        </Typography>
      </Grid>
      <Grid item container xs={12} sm={6} rowGap={2}>
        <Grid item container xs={12} spacing={{ xs: 2, sm: 8 }}>
          {/* ---------Include In Payment--------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Include In Payment" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <Select
              size="small"
              fullWidth
              labelId="demo-controlled-open-select-label"
              id="include_in_payroll"
              value={formik.values.include_in_payroll}
              onChange={formik.handleChange}
              name="include_in_payroll"
              error={getIn(formik.touched, 'include_in_payroll') && getIn(formik.errors, 'include_in_payroll')}
            >
              <MenuItem value={'Y'}>YES</MenuItem>
              <MenuItem value={'N'}>NO</MenuItem>
            </Select>
            {getIn(formik.touched, 'include_in_payroll') && getIn(formik.errors, 'include_in_payroll') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'include_in_payroll')}
              </FormHelperText>
            )}
          </Grid>
          {/* ----------Payroll Start Date------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Payroll Start Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formik.values.payroll_start_date ? dayjs(formik.values.payroll_start_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('payroll_start_date', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="payroll_start_date"
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Grid item container xs={12} spacing={{ sm: 8, xs: 2 }}>
          {/* ----------Mode Of Payment------ */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Mode Of Payment" />
            </InputLabel>
            <Select
              size="small"
              fullWidth
              labelId="demo-controlled-open-select-label"
              id="modeOfPayment"
              open={modePaymentOpen}
              onClose={handleModePaymentClose}
              onOpen={handleModePaymentOpen}
              value={formik.values.payment_mode}
              onChange={formik.handleChange}
              name="payment_mode"
            >
              <MenuItem value={'A'}>
                <FormattedMessage id="Cash" />
              </MenuItem>
              <MenuItem value={'I'}>
                <FormattedMessage id="Cheque" />
              </MenuItem>
              <MenuItem value={'O'}>
                <FormattedMessage id="Bank" />
              </MenuItem>
            </Select>
          </Grid>
          {/* -----------Paying Bank---------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Paying Bank" />
            </InputLabel>
            <Autocomplete
              id="category"
              value={
                !!formik.values.company_bank_code
                  ? bankData?.tableData.find((eachUoc) => eachUoc.bank_code === formik.values.company_bank_code)
                  : ({ bank_name: '' } as TBankHr)
              }
              onChange={(event, value: TBankHr | null) => {
                formik.setFieldValue('company_bank_code', value?.bank_code);
              }}
              size="small"
              options={bankData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.bank_name}
              // isOptionEqualToValue={(option) => option.charge_code === formik.values.moc1}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
        {/* -------------Bank Account No.-------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Bank Account No." />
          </InputLabel>
          <TextField
            type="text"
            value={formik.values.salary_acct_no}
            onChange={formik.handleChange}
            size="small"
            name="salary_acct_no"
            fullWidth
          />
        </Grid>
        {/* ---------Bank IBAN No.--------------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Bank IBAN No." />
          </InputLabel>
          <TextField
            type="text"
            size="small"
            value={formik.values.emp_iban_no}
            onChange={formik.handleChange}
            name="emp_iban_no"
            fullWidth
          />
        </Grid>

        {/* --------Employee Bank---------------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Employee Bank" />
          </InputLabel>
          <Autocomplete
            id="employeeBank"
            value={
              !!formik.values.salary_bank_code
                ? bankData?.tableData.find((eachUoc) => eachUoc.bank_code === formik.values.salary_bank_code)
                : ({ bank_name: '' } as TBankHr)
            }
            onChange={(event, value: TBankHr | null) => {
              formik.setFieldValue('salary_bank_code', value?.bank_code);
            }}
            size="small"
            options={bankData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.bank_name}
            // isOptionEqualToValue={(option) => option.charge_code === formik.values.moc1}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
        </Grid>

        {/* ------------Salary A/C Ref.----------- */}
        <Grid item xs={12} sm={12}>
          <InputLabel>
            <FormattedMessage id="Salary A/C Ref." />
          </InputLabel>
          <TextField size="small" value={'123'} name="salaryAcRef" disabled fullWidth />
        </Grid>

        <Grid item container xs={12} spacing={6}>
          {/* -------------Currency--------------- */}
          <Grid item xs={7}>
            <InputLabel>
              <FormattedMessage id="Currency" />
            </InputLabel>
            <Autocomplete
              id="currency"
              value={
                !!formik.values.currency_id
                  ? currencyData?.tableData.find((eachCurrency) => eachCurrency.curr_code === formik.values.currency_id)
                  : ({ curr_name: '' } as TCurrency)
              }
              onChange={(event, value: TCurrency | null) => {
                formik.setFieldValue('currency_id', value?.curr_code);
              }}
              size="small"
              options={currencyData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.curr_name}
              // isOptionEqualToValue={(option) => option.charge_code === formik.values.moc1}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
          </Grid>
          {/* -----------Exch Rate----------------- */}
          <Grid item xs={5}>
            <InputLabel>
              <FormattedMessage id="Exch. Rate" />
            </InputLabel>
            <TextField
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
              value={formik.values.exch_rate}
              size="small"
              name="exch_rate"
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>

      {/* -------------Back and Next---------- */}
      <Grid item xs={12} marginTop={4}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Back" />
          </Button>
          <Button variant="contained" sx={{ my: 1, ml: 1 }} type="submit">
            <FormattedMessage id="Next" />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};
