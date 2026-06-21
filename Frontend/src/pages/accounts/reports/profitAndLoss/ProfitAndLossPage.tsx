import { EyeOutlined } from '@ant-design/icons';
import { Autocomplete, Button, FormHelperText, Grid, InputLabel, Paper, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getIn, useFormik } from 'formik';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/service.wms';
import * as yup from 'yup';
import { TProfitAndLoss } from './types/profitAndLossAccounts.types';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ProfitAndLossreport from 'components/reports/accounts/profitAndLoss/profitAndLoss/ProfitAndLossReport';
import { useReactToPrint } from 'react-to-print';
import UniversalDialog from 'components/popup/UniversalDialog';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import AccountsSerivceInstance from 'service/accounts/service.AccountReportService';
import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
import { TProfitAndLossReport } from 'components/reports/accounts/profitAndLoss/profitAndLoss/profitAndLossAccounts.types';

// Define the ProfitAndLossPage component
const ProfitAndLossPage = () => {
  // --------Constants------
  // Create a ref for the content to be printed
  const contentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  // Define the function to handle printing using useReactToPrint
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
      // Reset the form and close the print dialog after printing
      formik.resetForm();
      togglePrintData();
    }
  });

  // Define the state for the print data popup
  const [printDataPopup, setPrintDataPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Print Report" />,
    data: {}
  });

  // -------Formik---------
  // Define the formik configuration for form handling
  const formik = useFormik<TProfitAndLoss>({
    initialValues: {
      div_code: '',
      date_from: null as unknown as Date,
      date_to: null as unknown as Date
    },
    validationSchema: yup.object().shape({
      div_code: yup.string().required('This field is required'),
      date_from: yup.date().required('This field is required'),
      date_to: yup.date().required('This field is required')
    }),
    onSubmit: () => {
      // Open the print data popup when the form is submitted
      togglePrintData();
    }
  });

  // -------use-query----------
  // Fetch the report data using useQuery
  const { data: reportData } = useQuery({
    queryKey: ['report_Data', printDataPopup.action.open],
    queryFn: () =>
      AccountsSerivceInstance.getProfitLossReport({
        div_code: formik.values.div_code as string,
        dt_from: formik.values.date_from,
        dt_to: formik.values.date_to
      }),
    enabled: !!printDataPopup.action.open
  });

  // Fetch the division data using useQuery
  const { data: divisionData } = useQuery({
    queryKey: ['divison_data'],
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

  // --------Handlers--------
  // Check if the form is valid
  const checkValidation = () => {
    if (formik.values.div_code === '' || formik.values.date_from === null || formik.values.date_to === null) {
      return true;
    }
  };

  // Toggle the print data popup
  const togglePrintData = (refetchData?: boolean) => {
    setPrintDataPopup((prev) => {
      return { ...prev, data: {}, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // --------Render Report----------
  // Render the report component
  const renderReport = () => {
    return (
      <ProfitAndLossreport
        startDate={formik.values.date_from}
        endDate={formik.values.date_to}
        handlePrint={handlePrint}
        data={reportData as TProfitAndLossReport}
        contentRef={contentRef}
      />
    );
  };

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid container item component={Paper} xs={12} paddingBottom={2} paddingRight={2} marginLeft={2} marginTop={2} spacing={2}>
        <Grid className="flex justify-end" item xs={12}>
          {/* Preview button */}
          <Button disabled={checkValidation()} startIcon={<EyeOutlined />} variant="contained" type="submit">
            <FormattedMessage id="Preview" />
          </Button>
        </Grid>

        {/* -----------Division-------------- */}
        <Grid item xs={12} sm={4.8}>
          <InputLabel>
            <FormattedMessage id="Division" />
            <span className="text-red-500">*</span>
          </InputLabel>
          {/* Autocomplete for selecting division */}
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
                autoFocus
              />
            )}
          />
          {/* Display validation error message */}
          {getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'div_code')}
            </FormHelperText>
          )}
        </Grid>

        {/* ----------Date------------ */}
        <Grid container item spacing={{ sm: 2, xs: 1 }}>
          <Grid item sm={3.5} xs={12}>
            <InputLabel>
              <FormattedMessage id="Date From" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* Date picker for selecting start date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.date_from)}
                value={formik.values.date_from ? dayjs(formik.values.date_from) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) {
                    formik.setFieldValue('date_from', newValue.toISOString());
                  }
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="date_from"
              />
            </LocalizationProvider>
            {/* Display validation error message */}
            {getIn(formik.touched, 'date_from') && getIn(formik.errors, 'date_from') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'date_from')}
              </FormHelperText>
            )}
          </Grid>
          <Grid item sm={3.5} xs={12}>
            <InputLabel>
              <FormattedMessage id="Date To" />
              <span className="text-red-500">*</span>
            </InputLabel>
            {/* Date picker for selecting end date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.date_to)}
                value={formik.values.date_to ? dayjs(formik.values.date_to) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) {
                    formik.setFieldValue('date_to', newValue.toISOString());
                  }
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="date_to"
              />
            </LocalizationProvider>
            {/* Display validation error message */}
            {getIn(formik.touched, 'date_to') && getIn(formik.errors, 'date_to') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'date_to')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* ------------Print Report------------ */}
      {/* Universal dialog for displaying the report */}
      {!!printDataPopup && printDataPopup.action.open && (
        <UniversalDialog
          action={{ ...printDataPopup.action }}
          onClose={togglePrintData}
          title={printDataPopup.title}
          hasPrimaryButton={false}
        >
          {/* Display a placeholder while the report data is loading */}
          {!reportData ? (
            <ProductPlaceholder />
          ) : (
            // Render the ProfitAndLossreport component with the fetched data
            <ProfitAndLossreport
              startDate={formik.values.date_from}
              endDate={formik.values.date_to}
              handlePrint={handlePrint}
              data={reportData as TProfitAndLossReport}
              contentRef={contentRef}
            />
          )}
        </UniversalDialog>
      )}

      {/* ------------Render Report----------- */}
      {/* Hidden div to render the report */}
      <div className="hidden">{renderReport()} </div>
    </Grid>
  );
};

export default ProfitAndLossPage;
