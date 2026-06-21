import { Autocomplete, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { TPassportHr } from 'pages/WMS/types/employee-hr.types';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useQuery } from '@tanstack/react-query';
import { TCountry } from 'pages/WMS/types/country-wms.types';
export const PassportInfo = ({
  handleNext,
  handleBack,
  passportInfo,
  setPassportInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  passportInfo: TPassportHr;
  setPassportInfo: (value: TPassportHr) => void;
}) => {
  //-----------Constants----------
  // State to manage the open status of a modal
  const [open, setOpen] = useState(false);
  // State to manage the open status of a status modal
  const [statusOpen, setStatusOpen] = useState(false);

  //------------formik------------
  // Initialize formik with initial values and submit handler
  const formik = useFormik<TPassportHr>({
    initialValues: passportInfo,
    onSubmit: async (values) => {
      // Update passport information and proceed to the next step
      setPassportInfo(values);
      handleNext();
    }
  });

  //----------useQuery--------------
  // Fetch country data using a custom query hook
  const { data: countryData } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      // Fetch country data from the WMS service
      const response = await WmsSerivceInstance.getMasters('wms', 'country');
      if (response) {
        return {
          tableData: response.tableData as TCountry[],
          count: response.count
        };
      }
      // Handle undefined case by returning empty data
      return { tableData: [], count: 0 };
    }
  });

  //----------handlers---------
  // Handler to close the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Handler to open the modal
  const handleOpen = () => {
    setOpen(true);
  };

  // Handler to close the status modal
  const handleStatusClose = () => {
    setStatusOpen(false);
  };

  // Handler to open the status modal
  const handleStatusOpen = () => {
    setStatusOpen(true);
  };

  //-----------useEffect----------
  // Effect to set formik values when passportInfo changes
  useEffect(() => {
    if (!!passportInfo && !!Object.keys(passportInfo).length) {
      formik.setValues(passportInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passportInfo]);

  return (
    <Grid container xs={12} component={'form'} onSubmit={formik.handleSubmit}>
      {/* Title */}
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Passport Information" />
        </Typography>
      </Grid>
      <Grid container item xs={12} sm={6} rowGap={2}>
        {/* Passport No. */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Passport No." />
          </InputLabel>
          <TextField type="text" value={formik.values.ppt_no} onChange={formik.handleChange} size="small" name="ppt_no" fullWidth />
        </Grid>
        {/* Passport Name */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Passport Name" />
          </InputLabel>
          <TextField size="small" value={formik.values.ppt_name} onChange={formik.handleChange} name="ppt_name" fullWidth />
        </Grid>
        {/* Issued Country */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Issued Country" />
          </InputLabel>
          <Autocomplete
            id="issuedCountry"
            value={
              !!formik.values.ppt_country
                ? countryData?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.ppt_country)
                : ({ country_name: '' } as TCountry)
            }
            onChange={(event, value: TCountry | null) => {
              formik.setFieldValue('ppt_country', value?.country_code);
            }}
            size="small"
            options={countryData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.country_name}
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
        <Grid container item xs={12} spacing={{ xs: 2, sm: 8 }}>
          {/* Valid From */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid From" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formik.values.ppt_valid_from ? dayjs(formik.values.ppt_valid_from) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('ppt_valid_from', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="ppt_valid_from"
              />
            </LocalizationProvider>
          </Grid>
          {/* Valid To */}
          <Grid item xs={12} sm={6}>
            <InputLabel sx={!formik.values.ppt_valid_from ? { color: 'lightgrey' } : { color: 'black' }}>
              <FormattedMessage id="Valid To" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.ppt_valid_from)}
                disabled={!formik.values.ppt_valid_from}
                value={formik.values.ppt_valid_to ? dayjs(formik.values.ppt_valid_to) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('ppt_valid_to', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="ppt_valid_to"
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        {/* Passport In Hand */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Passport In Hand" />
          </InputLabel>
          <Select
            name="passport_with"
            size="small"
            fullWidth
            labelId="demo-controlled-open-select-label"
            id="passInHand"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={formik.values.passport_with}
            onChange={formik.handleChange}
          >
            <MenuItem value={'A'}>
              <FormattedMessage id="Company" />
            </MenuItem>
            <MenuItem value={'I'}>
              <FormattedMessage id="Employee" />
            </MenuItem>
          </Select>
        </Grid>
        {/* Status */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Status" />
          </InputLabel>
          <Select
            name="ppt_status"
            size="small"
            fullWidth
            labelId="demo-controlled-open-select-label"
            id="modeOfPayment"
            open={statusOpen}
            onClose={handleStatusClose}
            onOpen={handleStatusOpen}
            value={formik.values.ppt_status}
            onChange={formik.handleChange}
          >
            <MenuItem value={'A'}>
              <FormattedMessage id="Valid" />
            </MenuItem>
            <MenuItem value={'I'}>
              <FormattedMessage id="Renewable" />
            </MenuItem>
          </Select>
        </Grid>
      </Grid>
      {/* Back and Next Button */}
      <Grid item xs={12} marginTop={{ xs: 18, sm: 14 }}>
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
