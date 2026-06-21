import { Autocomplete, Button, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TSponsorData, TSponsorHr } from 'pages/WMS/types/employee-hr.types';
import { getIn, useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import * as yup from 'yup';
import HrServiceInstance from 'service/Service.hr';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

export const SponsorInfo = ({
  handleNext,
  handleBack,
  sponsorInfo,
  setSponsorInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  sponsorInfo: TSponsorHr;
  setSponsorInfo: (value: TSponsorHr) => void;
}) => {
  //--------------constants----------
  // State to manage the open status of a modal
  const [open, setOpen] = useState(false);
  // Get the app state from the Redux store
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  //------------formik------------
  // Initialize formik with initial values, validation schema, and submit handler
  const formik = useFormik<TSponsorHr>({
    initialValues: sponsorInfo,
    validationSchema: yup.object().shape({
      sponsor_id: yup.string().required('This field is required'),
      visa_type: yup.string().required('This field is required'),
      visa_valid_from: yup.date().required('This field is required'),
      visa_valid_to: yup.date().required('This field is required')
    }),
    onSubmit: async (values) => {
      // Update sponsor information and proceed to the next step
      setSponsorInfo(values);
      handleNext();
    }
  });

  //---------useQuery------------
  // Fetch sponsor data using a custom query hook
  const { data: sponsorData } = useQuery({
    queryKey: ['sponsor_data'],
    queryFn: async () => {
      // Fetch sponsor data from the HR service
      const response = await HrServiceInstance.getMasters(app, 'hrSponsor');
      if (response) {
        return {
          tableData: response.tableData as TSponsorData[],
          count: response.count
        };
      }
      // Handle undefined case by returning empty data
      return { tableData: [], count: 0 };
    }
  });

  //------------handlers---------
  // Handler to close the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Handler to open the modal
  const handleOpen = () => {
    setOpen(true);
  };

  //-----------useEffect----------
  // Effect to set formik values when sponsorInfo changes
  useEffect(() => {
    if (!!sponsorInfo && !!Object.keys(sponsorInfo).length) {
      formik.setValues(sponsorInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsorInfo]);

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Sponsor Information" />
        </Typography>
      </Grid>
      <Grid item container xs={12} sm={6} rowGap={2}>
        {/* ------------Sponsor Name------------ */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Sponsor Name" />
            <span className="text-red-500">*</span>
          </InputLabel>
          <Autocomplete
            id="sponsorName"
            value={
              !!formik.values.sponsor_id
                ? sponsorData?.tableData.find((eachSponsor) => eachSponsor.sponsor_code === formik.values.sponsor_id)
                : ({ sponsor_name: '' } as TSponsorData)
            }
            onChange={(event, value: TSponsorData | null) => {
              formik.setFieldValue('sponsor_id', value?.sponsor_code);
            }}
            size="small"
            options={sponsorData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.sponsor_name}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
          {getIn(formik.touched, 'sponsor_id') && getIn(formik.errors, 'sponsor_id') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'sponsor_id')}
            </FormHelperText>
          )}
        </Grid>

        {/* ------------Visa Type----------------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Visa Type" />
            <span className="text-red-500">*</span>
          </InputLabel>
          <Select
            size="small"
            fullWidth
            labelId="demo-controlled-open-select-label"
            id="visaType"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={formik.values.visa_type}
            onChange={formik.handleChange}
            name="visa_type"
            error={getIn(formik.touched, 'visa_type') && getIn(formik.errors, 'visa_type')}
          >
            <MenuItem value={'A'}>
              <FormattedMessage id="Residential" />
            </MenuItem>
            <MenuItem value={'I'}>
              <FormattedMessage id="Visit" />
            </MenuItem>
          </Select>
          {getIn(formik.touched, 'visa_type') && getIn(formik.errors, 'visa_type') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'visa_type')}
            </FormHelperText>
          )}
        </Grid>
        <Grid container item xs={12} spacing={{ sm: 8, xs: 2 }}>
          {/* -------------------Valid From------------ */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid From" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formik.values.visa_valid_from ? dayjs(formik.values.visa_valid_from) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('visa_valid_from', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="visa_valid_from"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'visa_valid_from') && getIn(formik.errors, 'visa_valid_from') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'visa_valid_from')}
              </FormHelperText>
            )}
          </Grid>
          {/* ----------Valid To----------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid To" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.visa_valid_from)}
                disabled={!formik.values.visa_valid_from}
                value={formik.values.visa_valid_to ? dayjs(formik.values.visa_valid_to) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('visa_valid_to', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="visa_valid_to"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'visa_valid_to') && getIn(formik.errors, 'visa_valid_to') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'visa_valid_to')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* -----------Back and Next Button----------- */}
      <Grid item xs={12} marginTop={39.5}>
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
