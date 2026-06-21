import { EyeOutlined } from '@ant-design/icons';
import { Autocomplete, Button, FormHelperText, Grid, InputLabel, Paper, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import { ISearch, TSearchConditionsObject } from 'components/filters/SearchFilter';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { TProduct } from 'pages/WMS/types/product-wms.types';
import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useReactToPrint } from 'react-to-print';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TAgingFilter, TAgingReport } from '../types/detailStockWms.types';
import StockcriteriaServiceInstance from 'service/wms/reports/stockcritera/service.stockcriteriaDetailsWms';
import { useLocation } from 'react-router';
import { getPathNameList } from 'utils/functions';
import * as yup from 'yup';
import AngiesReport from 'components/reports/wms/stockriteria/summurystock/AngiesReport';
import UniversalDialog from 'components/popup/UniversalDialog';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
const AgingStock = () => {
  //--------constants----------
  // Create a ref for the content to be printed
  const contentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
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
      formik.resetForm();
      setFilterValue({ sort: undefined, search: [] });
      togglePrintData();
    }
  });
  // State for filter values
  const [filterValue, setFilterValue] = useState<ISearch>({ sort: undefined, search: [] });
  // Get the current location using react-router
  const location = useLocation();
  // Extract path names from the location
  const pathNameList = getPathNameList(location.pathname);
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
  //----------------formik-----------------
  // Formik hook for form management
  const formik = useFormik<TAgingFilter>({
    initialValues: {
      age_1: 30,
      age_2: 60,
      age_3: 90,
      age_4: 120,
      age_5: 200,
      prin_code: '',
      prod_code_from: '',
      prod_code_to: '',
      txn_date_from: null as unknown as Date,
      txn_date_to: null as unknown as Date
    },
    validationSchema: yup.object().shape({
      prin_code: yup.string().required('This field is required')
    }),
    onSubmit: () => {
      // Transform the search conditions for submission
      const newSearch = filterValue?.search?.map((filter) => {
        const updatedFilter = filter.map((condition) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { label, ...rest } = condition;
          return rest;
        });
        return updatedFilter;
      });
      // Update the filter value state
      setFilterValue({ ...filterValue, search: newSearch as TSearchConditionsObject[][] });
      // Toggle the print data popup
      togglePrintData();
    }
  });

  //---------use Query---------
  // Fetch principal data using useQuery
  const { data: principalData } = useQuery({
    queryKey: ['principal_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'principal');
      if (response) {
        return {
          tableData: response.tableData as TPrincipalWms[]
        };
      }
      return { tableData: [] }; // Handle undefined case
    }
  });
  // Fetch product data based on principal code using useQuery
  const { data: productData } = useQuery({
    queryKey: ['product_data', formik.values.prin_code],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'product');
      if (response) {
        return {
          tableData: response.tableData as TProduct[]
        };
      }
      return { tableData: [] }; // Handle undefined case
    },
    enabled: !!formik.values.prin_code
  });

  // Fetch aging report data using useQuery
  const { data: reportData } = useQuery({
    queryKey: ['aging_report', printDataPopup.action.open],
    queryFn: () =>
      StockcriteriaServiceInstance.getAgingReport({
        filterValue: filterValue as ISearch,
        date_to: formik.values.txn_date_to,
        reportName: pathNameList[pathNameList.length - 1],
        age_1: formik.values.age_1,
        age_2: formik.values.age_2,
        age_3: formik.values.age_3,
        age_4: formik.values.age_4,
        age_5: formik.values.age_5
      }),
    enabled: !!printDataPopup.action.open && !!formik.values.prin_code
  });

  //-------------handlers-------------
  // Function to handle filter data changes
  const handleFilterData = (label: string, field_name: string, field_value: string | Date[] | undefined, operator: string) => {
    // Map through existing search conditions and update the matching condition
    const newSearch = filterValue?.search?.map((filter) => {
      const updatedFilter = filter.map((condition) => {
        if (condition.label === label) {
          return { ...condition, field_value, operator, label };
        }
        return condition;
      });
      return updatedFilter;
    });

    // Check if a new filter needs to be added
    const hasFieldName = newSearch?.some((filter) => filter.some((condition) => condition.label === label));

    // If the field name does not exist, add a new filter
    if (!hasFieldName) {
      newSearch?.push([{ field_name, field_value, operator, label }]);
    }
    // Update the filter value state
    setFilterValue({ ...filterValue, search: newSearch as TSearchConditionsObject[][] });
  };

  // Function to toggle the print data popup
  const togglePrintData = (refetchData?: boolean) => {
    setPrintDataPopup((prev) => {
      return { ...prev, data: {}, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  //----------render report---------
  // Function to render the report
  const renderReport = () => {
    if (!!formik.values.prin_code) {
      return <AngiesReport handlePrint={handlePrint} contentRef={contentRef} data={reportData as TAgingReport} />;
    }
  };
  //-----------check validation----------
  // Function to check validation
  const checkValidation = () => {
    if (formik.values.prin_code === '') {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit} spacing={2}>
      <Grid container item component={Paper} xs={12} paddingBottom={2} paddingRight={2} marginLeft={2} marginTop={2}>
        <Grid className="flex justify-end" item xs={12}>
          {/* Button to preview the report */}
          <Button disabled={checkValidation()} startIcon={<EyeOutlined />} variant="contained" type="submit">
            <FormattedMessage id="Preview" />
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          {/* Input label for Principal */}
          <InputLabel>
            <FormattedMessage id="Principal" />
            <span className="text-red-500">*</span>
          </InputLabel>
          {/* Autocomplete component for selecting Principal */}
          <Autocomplete
            id="prin_code"
            value={
              !!formik.values.prin_code
                ? principalData?.tableData.find((eachPrincipal) => eachPrincipal.prin_code === formik.values.prin_code)
                : ({ prin_name: '' } as TPrincipalWms)
            }
            onChange={(event, value: TPrincipalWms | null) => {
              formik.setFieldValue('prin_code', value?.prin_code);
              handleFilterData('prin_code', 'prin_code', value?.prin_code as string, 'exactmatch');
            }}
            size="small"
            options={principalData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.prin_name}
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
          {/* Display error message if validation fails */}
          {getIn(formik.touched, 'principal') && getIn(formik.errors, 'principal') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'principal')}
            </FormHelperText>
          )}
        </Grid>
        <Grid container item rowSpacing={1}>
          <Grid item xs={12}>
            {/* Typography for Product Details */}
            <Typography variant="h5" marginTop={2}>
              <FormattedMessage id="Product Details" />
            </Typography>
          </Grid>
          {/* -----------Product Details---------- */}
          <Grid container item spacing={{ sm: 12, xs: 2 }}>
            <Grid item sm={6} xs={12}>
              {/* Input label for Product From */}
              <InputLabel>
                <FormattedMessage id="Product From" />
              </InputLabel>
              {/* Autocomplete component for selecting Product From */}
              <Autocomplete
                id="product_from"
                value={
                  !!formik.values.prod_code_from
                    ? productData?.tableData.find((eachPF) => eachPF.prod_code === formik.values.prod_code_from)
                    : ({ prod_name: '' } as TProduct)
                }
                onChange={(event, value: TProduct | null) => {
                  formik.setFieldValue('prod_code_from', value?.prod_code);
                  handleFilterData('prod_code_from', 'prod_code', value?.prod_code as string, '>=');
                }}
                size="small"
                options={productData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.prod_name}
                // isOptionEqualToValue={(option) => option.label === formik.values.label}
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
              {getIn(formik.touched, 'prod_code_from') && getIn(formik.errors, 'prod_code_from') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'prod_code_from')}
                </FormHelperText>
              )}
            </Grid>
            <Grid item sm={6} xs={12}>
              {/* Input label for Product To */}
              <InputLabel>
                <FormattedMessage id="Product To" />
              </InputLabel>
              {/* Autocomplete component for selecting Product To */}
              <Autocomplete
                id="product_to"
                value={
                  !!formik.values.prod_code_to
                    ? productData?.tableData.find((eachPT) => eachPT.prod_code === formik.values.prod_code_to)
                    : ({ prod_name: '' } as TProduct)
                }
                onChange={(event, value: TProduct | null) => {
                  formik.setFieldValue('prod_code_to', value?.prod_code);
                  handleFilterData('prod_code_to', 'prod_code', value?.prod_code as string, '<=');
                }}
                size="small"
                options={productData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.prod_name}
                // isOptionEqualToValue={(option) => option.label === formik.values.label}
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
              {getIn(formik.touched, 'prod_code_to') && getIn(formik.errors, 'prod_code_to') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'prod_code_to')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>

          {/* -------------Transaction Date---------- */}
          <Grid container item spacing={{ sm: 12, xs: 2 }}>
            <Grid item sm={6} xs={12}>
              {/* Input label for Transaction Date From */}
              <InputLabel>
                <FormattedMessage id="Transaction Date From" />
              </InputLabel>
              {/* DatePicker component for selecting Transaction Date From */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={formik.values.txn_date_from ? dayjs(formik.values.txn_date_from) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (!!newValue && newValue?.isValid()) {
                      formik.setFieldValue('txn_date_from', newValue.toISOString());
                    }
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{
                    width: '100%'
                  }}
                  name="txn_date_from"
                />
              </LocalizationProvider>
              {/* Display error message if validation fails */}
              {getIn(formik.touched, 'txn_date_from') && getIn(formik.errors, 'txn_date_from') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'txn_date_from')}
                </FormHelperText>
              )}
            </Grid>
            <Grid item sm={6} xs={12}>
              {/* Input label for Transaction Date To */}
              <InputLabel>
                <FormattedMessage id="Transaction Date To" />
              </InputLabel>
              {/* DatePicker component for selecting Transaction Date To */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  minDate={dayjs(formik.values.txn_date_to)}
                  value={formik.values.txn_date_to ? dayjs(formik.values.txn_date_to) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (newValue?.isValid()) {
                      formik.setFieldValue('txn_date_to', newValue.toISOString());
                    }
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{
                    width: '100%'
                  }}
                  name="txn_date_to"
                />
              </LocalizationProvider>
              {/* Display error message if validation fails */}
              {getIn(formik.touched, 'txn_date_to') && getIn(formik.errors, 'txn_date_to') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'txn_date_to')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>

          {/* ---------------Age--------------------- */}
          <Grid container item>
            <Grid item xs={12}>
              {/* Typography for Age */}
              <Typography variant="h5" marginTop={2} marginBottom={1}>
                <FormattedMessage id="Age" />
              </Typography>
            </Grid>
            <Grid container item spacing={2}>
              <Grid item xs={12} sm={2.4}>
                {/* Input label for Age 1 */}
                <InputLabel>
                  <FormattedMessage id="Age 1" />
                </InputLabel>
                {/* TextField for entering Age 1 */}
                <TextField
                  name="age_1"
                  value={formik.values.age_1}
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
                {getIn(formik.touched, 'age_1') && getIn(formik.errors, 'age_1') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'age_1')}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} sm={2.4}>
                {/* Input label for Age 2 */}
                <InputLabel>
                  <FormattedMessage id="Age 2" />
                </InputLabel>
                {/* TextField for entering Age 2 */}
                <TextField
                  name="age_2"
                  value={formik.values.age_2}
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
                {getIn(formik.touched, 'age_2') && getIn(formik.errors, 'age_2') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'age_2')}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} sm={2.4}>
                {/* Input label for Age 3 */}
                <InputLabel>
                  <FormattedMessage id="Age 3" />
                </InputLabel>
                {/* TextField for entering Age 3 */}
                <TextField
                  name="age_3"
                  value={formik.values.age_3}
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
                {getIn(formik.touched, 'age_3') && getIn(formik.errors, 'age_3') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'age_3')}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} sm={2.4}>
                {/* Input label for Age 4 */}
                <InputLabel>
                  <FormattedMessage id="Age 4" />
                </InputLabel>
                {/* TextField for entering Age 4 */}
                <TextField
                  name="age_4"
                  value={formik.values.age_4}
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
                {getIn(formik.touched, 'age_4') && getIn(formik.errors, 'age_4') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'age_4')}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} sm={2.4}>
                {/* Input label for Age 5 */}
                <InputLabel>
                  <FormattedMessage id="Age 5" />
                </InputLabel>
                {/* TextField for entering Age 5 */}
                <TextField
                  name="age_5"
                  value={formik.values.age_5}
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
                {getIn(formik.touched, 'age_5') && getIn(formik.errors, 'age_5') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'age_5')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* --------------Print Report------------------- */}
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
            // Display the AngiesReport component with the fetched data
            <AngiesReport handlePrint={handlePrint} contentRef={contentRef} data={reportData as TAgingReport} />
          )}
        </UniversalDialog>
      )}

      {/* ----------Use Render Report---------------- */}
      {/* Hidden div to render the report */}
      <div className="hidden">{renderReport()} </div>
    </Grid>
  );
};

export default AgingStock;
