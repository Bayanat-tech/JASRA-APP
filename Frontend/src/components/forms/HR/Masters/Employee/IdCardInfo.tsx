import { Button, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useEffect, useState } from 'react';
import { TILPHr } from 'pages/WMS/types/employee-hr.types';
import { getIn, useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import * as yup from 'yup';

export const IdCardInfo = ({
  handleNext,
  handleBack,
  idCardInfo,
  setIdCardInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  idCardInfo: TILPHr;
  setIdCardInfo: (value: TILPHr) => void;
}) => {
  //------------constants--------
  // State to manage the open status of a modal
  const [open, setOpen] = useState(false);

  //------------formik------------
  // Initialize formik with initial values, validation schema, and submit handler
  const formik = useFormik<TILPHr>({
    initialValues: idCardInfo,
    validationSchema: yup.object().shape({
      labourcard_status: yup.string().required('This field is required'),
      labourcard_no: yup.string().required('This field is required'),
      labourcard_valid_from: yup.date().required('This field is required'),
      labourcard_valid_to: yup.date().required('This field is required')
    }),
    onSubmit: async (values) => {
      // Update ID card information and proceed to the next step
      setIdCardInfo(values);
      handleNext();
    }
  });

  //----------------handlers--------
  // Handler to close the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Handler to open the modal
  const handleOpen = () => {
    setOpen(true);
  };

  //-----------useEffect----------
  // Effect to set formik values when idCardInfo changes
  useEffect(() => {
    if (!!idCardInfo && !!Object.keys(idCardInfo).length) {
      formik.setValues(idCardInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCardInfo]);

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Id/Labour Card/PASI No." />
        </Typography>
        <Grid container item xs={12} sm={6} rowGap={2}>
          <Grid container item xs={12} spacing={{ sm: 9, xs: 2 }}>
            {/* -----------Id Labourcard No.--------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="ID/Labourcard No." />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField
                type="text"
                inputProps={{ min: 0 }}
                value={formik.values.labourcard_no}
                onChange={formik.handleChange}
                size="small"
                name="labourcard_no"
                error={getIn(formik.touched, 'labourcard_no') && getIn(formik.errors, 'labourcard_no')}
                fullWidth
              />
              {getIn(formik.touched, 'labourcard_no') && getIn(formik.errors, 'labourcard_no') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'labourcard_no')}
                </FormHelperText>
              )}
            </Grid>
            {/* ------------PASI No.---------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="PASI No." />
              </InputLabel>
              <TextField
                type="text"
                inputProps={{ min: 0 }}
                value={formik.values.pasi_no}
                onChange={formik.handleChange}
                size="small"
                name="pasi_no"
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container item xs={12} spacing={{ sm: 6, xs: 2 }}>
            {/* ------------Valid From----------------- */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="valid From" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={formik.values.labourcard_valid_from ? dayjs(formik.values.labourcard_valid_from) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (newValue?.isValid()) formik.setFieldValue('labourcard_valid_from', newValue.toISOString());
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{
                    width: '100%'
                  }}
                  name="labourcard_valid_from"
                />
              </LocalizationProvider>
              {getIn(formik.touched, 'labourcard_valid_from') && getIn(formik.errors, 'labourcard_valid_from') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'labourcard_valid_from')}
                </FormHelperText>
              )}
            </Grid>
            {/* -------------Valid To------------------ */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Valid To" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  minDate={dayjs(formik.values.labourcard_valid_from)}
                  disabled={!formik.values.labourcard_valid_from}
                  value={formik.values.labourcard_valid_to ? dayjs(formik.values.labourcard_valid_to) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (newValue?.isValid()) formik.setFieldValue('labourcard_valid_to', newValue.toISOString());
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                  sx={{
                    width: '100%'
                  }}
                  name="labourcard_valid_to"
                />
              </LocalizationProvider>
              {getIn(formik.touched, 'labourcard_valid_to') && getIn(formik.errors, 'labourcard_valid_to') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'labourcard_valid_to')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>
          {/* ----------------Status----------------- */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Status" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <Select
              name="labourcard_status"
              size="small"
              fullWidth
              labelId="demo-controlled-open-select-label"
              id="visaType"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              value={formik.values.labourcard_status}
              onChange={formik.handleChange}
              error={getIn(formik.touched, 'labourcard_status') && getIn(formik.errors, 'labourcard_status')}
            >
              <MenuItem value={'A'}>
                <FormattedMessage id="Valid" />
              </MenuItem>
              <MenuItem value={'I'}>
                <FormattedMessage id="Expired" />
              </MenuItem>
            </Select>
            {getIn(formik.touched, 'labourcard_status') && getIn(formik.errors, 'labourcard_status') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'labourcard_status')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Grid>
      {/* --------------Back and Next Button---------- */}
      <Grid item xs={12} marginTop={39.8}>
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
