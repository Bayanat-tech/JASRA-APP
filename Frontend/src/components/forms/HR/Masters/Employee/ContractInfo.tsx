import { Autocomplete, Button, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TContractHr, TContractTableHr } from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import HrServiceInstance from 'service/Service.hr';
import { useSelector } from 'store';
import * as yup from 'yup';

export const ContractInfo = ({
  handleNext,
  handleBack,
  contractInfo,
  setContractInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  contractInfo: TContractHr;
  setContractInfo: (value: TContractHr) => void;
}) => {
  //-----------Constants----------
  // State to manage the open status of a modal
  const [open, setOpen] = useState(false);
  // Get the app state from the Redux store
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  //------------formik------------
  // Initialize formik with initial values, validation schema, and submit handler
  const formik = useFormik<TContractHr>({
    initialValues: contractInfo,
    validationSchema: yup.object().shape({
      contract_type: yup.string().required('This field is required'),
      contract_renewable: yup.string().required('This field is required'),
      contract_start_date: yup.string().required('This field is required'),
      contract_end_date: yup.string().required('This field is required')
    }),
    onSubmit: async (values) => {
      // Update contract information and proceed to the next step
      setContractInfo(values);
      handleNext();
    }
  });

  //-----------useQuery----------
  // Fetch contract data using a custom query hook
  const { data: contractData } = useQuery({
    queryKey: ['contract_data'],
    queryFn: async () => {
      // Fetch contract data from the HR service
      const response = await HrServiceInstance.getMasters(app, 'hrContract');
      if (response) {
        return {
          tableData: response.tableData as TContractTableHr[],
          count: response.count
        };
      }
      // Handle undefined case by returning empty data
      return { tableData: [], count: 0 };
    }
  });

  //-----------handlers----------
  // Handler to close the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Handler to open the modal
  const handleOpen = () => {
    setOpen(true);
  };

  //-----------useEffect----------
  // Effect to set formik values when contractInfo changes
  useEffect(() => {
    if (!!contractInfo && !!Object.keys(contractInfo).length) {
      formik.setValues(contractInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInfo]);

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Contract Information" />
        </Typography>
      </Grid>
      <Grid container item xs={12} sm={6} rowGap={2}>
        {/* -------------Contract Type--------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Contract Type" />
            <span className="text-red-500">*</span>
          </InputLabel>
          <Autocomplete
            id="contractType"
            value={
              !!formik.values.contract_type
                ? contractData?.tableData.find((eachContract) => eachContract.contract_type === formik.values.contract_type)
                : ({ contract_type_desc: '' } as TContractTableHr)
            }
            onChange={(event, value: TContractTableHr | null) => {
              formik.setFieldValue('contract_type', value?.contract_type);
            }}
            size="small"
            options={contractData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.contract_type_desc}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
          {getIn(formik.touched, 'contract_type') && getIn(formik.errors, 'contract_type') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'contract_type')}
            </FormHelperText>
          )}
        </Grid>

        <Grid container item xs={12} spacing={{ sm: 8, xs: 2 }}>
          {/* -----------Start Date---------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Start Date" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formik.values.contract_start_date ? dayjs(formik.values.contract_start_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('contract_start_date', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="contract_start_date"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'contract_start_date') && getIn(formik.errors, 'contract_start_date') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'contract_start_date')}
              </FormHelperText>
            )}
          </Grid>

          {/* ------------End Date----------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="End Date" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.contract_start_date)}
                disabled={!formik.values.contract_start_date}
                value={formik.values.contract_end_date ? dayjs(formik.values.contract_end_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('contract_end_date', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="contract_end_date"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'contract_end_date') && getIn(formik.errors, 'contract_end_date') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'contract_end_date')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>

        {/* ---------------Renewable------------------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Renewable" />
            <span className="text-red-500">*</span>
          </InputLabel>
          <Select
            size="small"
            fullWidth
            labelId="demo-controlled-open-select-label"
            id="passInHand"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={formik.values.contract_renewable}
            onChange={formik.handleChange}
            name="contract_renewable"
            error={getIn(formik.touched, 'contract_renewable') && getIn(formik.errors, 'contract_renewable')}
          >
            <MenuItem value={'Y'}>
              <FormattedMessage id="YES" />
            </MenuItem>
            <MenuItem value={'N'}>
              <FormattedMessage id="NO" />
            </MenuItem>
          </Select>
          {getIn(formik.touched, 'contract_renewable') && getIn(formik.errors, 'contract_renewable') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'contract_renewable')}
            </FormHelperText>
          )}
        </Grid>
      </Grid>

      {/* -------------Back and Next Button-------------- */}
      <Grid item xs={12} marginTop={{ sm: 39.5, xs: 42.5 }}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Back" />
          </Button>
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Next" />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};
