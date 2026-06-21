import { Button, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TIsuranceHr } from 'pages/WMS/types/employee-hr.types';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect } from 'react';

export const InsuranceInfo = ({
  handleNext,
  handleBack,
  insuranceInfo,
  setInsuranceInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  insuranceInfo: TIsuranceHr;
  setInsuranceInfo: (value: TIsuranceHr) => void;
}) => {
  //------------formik------------
  // Initialize formik with initial values and submit handler
  const formik = useFormik<TIsuranceHr>({
    initialValues: insuranceInfo,
    onSubmit: async (values) => {
      // Update insurance information and proceed to the next step
      setInsuranceInfo(values);
      handleNext();
    }
  });

  //-----------useEffect----------
  // Effect to set formik values when insuranceInfo changes
  useEffect(() => {
    if (!!insuranceInfo && !!Object.keys(insuranceInfo).length) {
      formik.setValues(insuranceInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insuranceInfo]);

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} marginBottom={2}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Insurance Information" />
        </Typography>
      </Grid>
      <Grid container item xs={12} sm={6} rowGap={2}>
        <Grid container item xs={12} spacing={{ sm: 6, xs: 2 }}>
          {/* ------------Card No.------------ */}
          <Grid item xs={12} sm={8}>
            <InputLabel>
              <FormattedMessage id="Card No." />
            </InputLabel>
            <TextField
              size="small"
              name="ins_card_no"
              value={formik.values.ins_card_no}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                // Prevent input if the first character is a hyphen
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              fullWidth
            />
          </Grid>
          {/* -------------Type---------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Type" />
            </InputLabel>
            <TextField size="small" name="ins_card_type" value={formik.values.ins_card_type} onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={{ sm: 8, xs: 2 }}>
          {/* --------------Valid From--------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid From" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formik.values.ins_card_issue_dt ? dayjs(formik.values.ins_card_issue_dt) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('ins_card_issue_dt', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="ins_card_issue_dt"
              />
            </LocalizationProvider>
          </Grid>
          {/* -------------Valid To------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid To" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                minDate={dayjs(formik.values.ins_card_issue_dt)}
                disabled={!formik.values.ins_card_issue_dt}
                value={formik.values.ins_card_exp_dt ? dayjs(formik.values.ins_card_exp_dt) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('ins_card_exp_dt', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="ins_card_exp_dt"
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Grid>
      {/* -----------Back and Next Button---------- */}
      <Grid item xs={12} marginTop={48.3}>
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
