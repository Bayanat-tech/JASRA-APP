import { EyeOutlined } from '@ant-design/icons';
import { Autocomplete, Button, FormHelperText, Grid, InputLabel, Paper, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TDivision } from 'pages/WMS/types/employee-hr.types';
import { FormattedMessage } from 'react-intl';
import AccountsSerivceInstance from 'service/accounts/service.AccountReportService';
import WmsSerivceInstance from 'service/service.wms';
import { TAccountDetailsAccounts, TGroupDetailAccounts, TPeriodwiseAccount, TPeriodWiseReport } from './types/PeriodWiseAccounts.types';
import AgiengPeriodWiseReport from 'components/reports/accounts/ageing/periodwise/AgeingPeriodWiseReport';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as yup from 'yup';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';

// Define the PeriodWiseAccountsPage component
const PeriodWiseAccountsPage = () => {
  //--------constants----------
  // Create a ref for the content to be printed
  const contentRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;
  // State for print data popup
  const [printDataPopup, setPrintDataPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Print Report" />,
    data: {}
  });

  //----------formik-----------
  // Formik hook for form management
  const formik = useFormik<TPeriodwiseAccount>({
    initialValues: {
      as_on: null as unknown as Date,
      age_1: null as unknown as number,
      age_2: null as unknown as number,
      age_3: null as unknown as number,
      age_4: null as unknown as number,
      age_5: null as unknown as number,
      age_6: null as unknown as number,
      div_code: '',
      ac_code: [],
      group_code: []
    },
    validationSchema: yup.object().shape({
      as_on: yup.date().required('This field is required'),
      age_1: yup.number().required('This field is required'),
      age_2: yup.number().required('This field is required'),
      age_3: yup.number().required('This field is required'),
      age_4: yup.number().required('This field is required'),
      age_5: yup.number().required('This field is required'),
      age_6: yup.number().required('This field is required'),
      div_code: yup.string().required('This field is required')
    }),
    onSubmit: () => {
      // Toggle print data popup on form submission
      togglePrintData();
    }
  });

  //------------use Query----------
  // Fetch report data using useQuery
  const { data: reportData } = useQuery({
    queryKey: ['report_Data', printDataPopup.action.open],
    queryFn: () =>
      AccountsSerivceInstance.getPeriodWiseReport({
        age_1: formik.values.age_1,
        age_2: formik.values.age_2,
        age_3: formik.values.age_3,
        age_4: formik.values.age_4,
        age_5: formik.values.age_5,
        age_6: formik.values.age_6,
        ac_code: formik.values.ac_code as string[],
        l4_code: formik.values.group_code as string[],
        div_code: formik.values.div_code,
        date_to: formik.values.as_on
      }),
    enabled: !!printDataPopup.action.open
  });

  // Fetch division data using useQuery
  const { data: divisionData } = useQuery({
    queryKey: ['division_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'division');
      if (response) {
        return {
          tableData: response.tableData as TDivision[]
        };
      }
      return { tableData: [] }; // Handle undefined case
    }
  });

  // Fetch account data using useQuery
  const { data: accountData } = useQuery({
    queryKey: ['account_data'],
    queryFn: async () => await AccountsSerivceInstance.getAccount('accounts', 'account-details')
  });

  // Fetch group data using useQuery
  const { data: groupData } = useQuery({
    queryKey: ['group_data'],
    queryFn: async () => await AccountsSerivceInstance.getGroup('accounts', 'group-account-details')
  });

  //------------handlers----------
  // Function to handle printing using react-to-print
  const handlePrint = useReactToPrint({
    contentRef,
    pageStyle: `
      @media print {
          .page-break {
            display: block;
            page-break-before: always;
          }
        }
          @page {
          @bottom-right {
            content: counter(page) ' of ' counter(pages);
          }
        }
      `,
    onAfterPrint: () => {
      // Reset form and toggle print data popup after printing
      formik.resetForm();
      togglePrintData();
      // setFilterValue({ sort: undefined, search: [] });
    }
  });

  // Function to check validation
  const checkValidation = () => {
    if (
      !formik.values.div_code ||
      !formik.values.as_on ||
      !formik.values.age_1 ||
      !formik.values.age_2 ||
      !formik.values.age_3 ||
      !formik.values.age_4 ||
      !formik.values.age_5 ||
      !formik.values.age_6
    ) {
      return true;
    }
  };

  // Function to toggle print data popup
  const togglePrintData = (refetchData?: boolean) => {
    setPrintDataPopup((prev) => {
      return { ...prev, data: {}, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  //-------------Render Report--------
  // Function to render the report
  const renderReport = () => {
    return (
      <AgiengPeriodWiseReport
        date_to={formik.values.as_on}
        handlePrint={handlePrint}
        contentRef={contentRef}
        data={reportData as TPeriodWiseReport}
      />
    );
  };

  return (
    <Grid container item component={'form'} onSubmit={formik.handleSubmit} spacing={2}>
      <Grid container item component={Paper} xs={12} paddingBottom={2} paddingRight={2} marginLeft={2} marginTop={2}>
        <Grid className="flex justify-end" item xs={12}>
          {/* Button to preview the report */}
          <Button disabled={checkValidation()} startIcon={<EyeOutlined />} variant="contained" type="submit">
            <FormattedMessage id="Preview" />
          </Button>
        </Grid>
        <Grid container item spacing={{ sm: 12, sx: 2 }} xs={12}>
          {/* ------------As On------------- */}
          <Grid item sm={6} xs={12}>
            {/* Input label for As On date */}
            <InputLabel>
              <FormattedMessage id="As on" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* DatePicker component for selecting As On date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.as_on)}
                value={formik.values.as_on ? dayjs(formik.values.as_on) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) {
                    formik.setFieldValue('as_on', newValue.toISOString());
                  }
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="as_on"
                autoFocus
              />
            </LocalizationProvider>
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'as_on') && getIn(formik.errors, 'as_on') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'as_on')}
              </FormHelperText>
            )}
          </Grid>

          {/*-------Division-------------*/}
          <Grid item xs={12} sm={6}>
            {/* Input label for Division */}
            <InputLabel>
              <FormattedMessage id="Division" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* Autocomplete component for selecting Division */}
            <Autocomplete
              id="div_code"
              value={
                !!formik.values.div_code
                  ? divisionData?.tableData.find((eachDivision) => eachDivision.div_code === formik.values.div_code)
                  : ({ div_name: '' } as TDivision)
              }
              onChange={(event, value: TDivision | null) => {
                formik.setFieldValue('div_code', value?.div_code);
              }}
              size="small"
              options={divisionData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.div_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'div_code')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {/* Typography for Age Search */}
          <Typography variant="h5" marginTop={2} marginBottom={1}>
            <FormattedMessage id="Age Search" />
          </Typography>
        </Grid>

        {/* ---------------Ages----------- */}
        <Grid container item spacing={2}>
          <Grid item xs={12} sm={4}>
            {/* Input label for Age 1 */}
            <InputLabel>
              <FormattedMessage id="Age 1" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* TextField for entering Age 1 */}
            <TextField
              name="age_1"
              value={formik.values.age_1 ?? ''}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
              type="number"
              variant="outlined"
              size="small"
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'age_1') && getIn(formik.errors, 'age_1') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'age_1')}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Input label for Age 2 */}
            <InputLabel>
              <FormattedMessage id="Age 2" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* TextField for entering Age 2 */}
            <TextField
              name="age_2"
              value={formik.values.age_2 ?? ''}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
              type="number"
              variant="outlined"
              size="small"
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'age_2') && getIn(formik.errors, 'age_2') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'age_2')}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Input label for Age 3 */}
            <InputLabel>
              <FormattedMessage id="Age 3" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* TextField for entering Age 3 */}
            <TextField
              name="age_3"
              value={formik.values.age_3 ?? ''}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
              type="number"
              variant="outlined"
              size="small"
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'age_3') && getIn(formik.errors, 'age_3') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'age_3')}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Input label for Age 4 */}
            <InputLabel>
              <FormattedMessage id="Age 4" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* TextField for entering Age 4 */}
            <TextField
              name="age_4"
              value={formik.values.age_4 ?? ''}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
              type="number"
              variant="outlined"
              size="small"
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'age_4') && getIn(formik.errors, 'age_4') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'age_4')}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Input label for Age 5 */}
            <InputLabel>
              <FormattedMessage id="Age 5" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* TextField for entering Age 5 */}
            <TextField
              name="age_5"
              value={formik.values.age_5 ?? ''}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
              type="number"
              variant="outlined"
              size="small"
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'age_5') && getIn(formik.errors, 'age_5') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'age_5')}
              </FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Input label for Age 6 */}
            <InputLabel>
              <FormattedMessage id="Age 6" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* TextField for entering Age 6 */}
            <TextField
              name="age_6"
              value={formik.values.age_6 ?? ''}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
              id="outlined-basic"
              type="number"
              variant="outlined"
              size="small"
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'age_6') && getIn(formik.errors, 'age_6') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'age_6')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>

        <Grid container item spacing={{ sm: 12, sx: 2 }} xs={12} paddingTop={2}>
          {/* -----------Account Details--------- */}
          <Grid item xs={12} sm={6}>
            {/* Input label for Account Details */}
            <InputLabel>
              <FormattedMessage id="Account Details" />
            </InputLabel>
            {/* Autocomplete component for selecting Account Details */}
            <Autocomplete
              multiple
              id="ac_code"
              filterSelectedOptions
              onChange={(event, value: TAccountDetailsAccounts[] | null) => {
                formik.setFieldValue(
                  'ac_code',
                  value?.map((each) => each.ac_code)
                );
              }}
              size="small"
              options={accountData ?? []}
              fullWidth
              getOptionLabel={(option) => option?.ac_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'ac_code') && getIn(formik.errors, 'ac_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'ac_code')}
              </FormHelperText>
            )}
          </Grid>

          {/* ------------Group Details--------- */}
          <Grid item xs={12} sm={6}>
            {/* Input label for Group Details */}
            <InputLabel>
              <FormattedMessage id="Group Details" />
            </InputLabel>
            {/* Autocomplete component for selecting Group Details */}
            <Autocomplete
              multiple
              id="group_code"
              filterSelectedOptions
              onChange={(event, value: TGroupDetailAccounts[] | null) => {
                formik.setFieldValue(
                  'group_code',
                  value?.map((each) => each.l4_code)
                );
              }}
              size="small"
              options={groupData ?? []}
              fullWidth
              getOptionLabel={(option) => option?.l4_description}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {/* Display error message if validation fails */}
            {getIn(formik.touched, 'group_code') && getIn(formik.errors, 'group_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'group_code')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* ----------Print Report--------------- */}
      {/* UniversalDialog component for displaying the report */}
      {!!printDataPopup && printDataPopup.action.open && (
        <UniversalDialog
          action={{ ...printDataPopup.action }}
          onClose={togglePrintData}
          title={printDataPopup.title}
          hasPrimaryButton={false}
        >
          {!reportData ? (
            // Display a placeholder while data is loading
            <ProductPlaceholder />
          ) : (
            // Display the AgiengPeriodWiseReport component with the fetched data
            <AgiengPeriodWiseReport
              date_to={formik.values.as_on}
              handlePrint={handlePrint}
              contentRef={contentRef}
              data={reportData as TPeriodWiseReport}
            />
          )}
        </UniversalDialog>
      )}

      {/* ------------Use Render Report */}
      {/* Hidden div to render the report */}
      <div className="hidden">{renderReport()} </div>
    </Grid>
  );
};

export default PeriodWiseAccountsPage;
