import { Button, Checkbox, FormControlLabel, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import { TSettingsPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

const AddSettingsPrincipalWmsForm = ({
  handleNext,
  handleBack,
  settings,
  setSettings
}: {
  handleNext: () => void;
  handleBack: () => void;

  settings: TSettingsPrincipalWms;
  setSettings: (value: TSettingsPrincipalWms) => void;
}) => {
  //----------------formik-----------------
  // Initialize formik with initial values and submit handler
  const formik = useFormik<TSettingsPrincipalWms>({
    initialValues: settings, // Set initial values from settings prop

    // Handle form submission
    onSubmit: async (values) => {
      setSettings(values); // Update settings with form values
      handleNext(); // Proceed to the next step
    }
  });

  //------------------------useEffects-----------------
  // Sync formik values with settings prop when settings change
  useEffect(() => {
    if (!!settings && !!Object.keys(settings).length) {
      formik.setValues(settings); // Update formik values with settings
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);
  return (
    <Grid container spacing={4} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" className="text-black py-2 font-semibold">
              <FormattedMessage id="Genral Settings" />
            </Typography>
          </Grid>
          {/*----------------------Allow Undervalue--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Allow Undervalue" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('under_value', checked ? 'Y' : 'N')} />}
              checked={formik.values.under_value === 'Y'}
              name="under_value"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.under_value}
            />
          </Grid>
          {/*----------------------Auto Populate Bill Act--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Auto Populate Bill" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('auto_insert_billactivity', checked ? 'Y' : 'N')} />}
              checked={formik.values.auto_insert_billactivity === 'Y'}
              name="auto_insert_billactivity"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.auto_insert_billactivity}
            />
          </Grid>
          {/*----------------------Chatrgable--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Chargable" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('prin_charge', checked ? 'Y' : 'N')} />}
              checked={formik.values.prin_charge === 'Y'}
              name="prin_charge"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.prin_charge}
            />
          </Grid>
          {/*----------------------Export price check--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Export Price Check" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('prin_pricechk', checked ? 'Y' : 'N')} />}
              checked={formik.values.prin_pricechk === 'Y'}
              name="prin_pricechk"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.prin_pricechk}
            />
          </Grid>
          {/*----------------------Compute Landed Cost--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Compute Lamded Cost" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('prin_landedpr', checked ? 'Y' : 'N')} />}
              checked={formik.values.prin_landedpr === 'Y'}
              name="prin_landedpr"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.prin_landedpr}
            />
          </Grid>
          {/*----------------------Auto Jobno Generate--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Auto Job no Generate" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('auto_job', checked ? 'Y' : 'N')} />}
              checked={formik.values.auto_job === 'Y'}
              name="auto_job"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.auto_job}
            />
          </Grid>
          {/*----------------------Validate Lot no.--------------------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Validate Lot no." />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('validate_lotno', checked ? 'Y' : 'N')} />}
              checked={formik.values.validate_lotno === 'Y'}
              name="validate_lotno"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.validate_lotno}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" className="text-black py-2 font-semibold">
              <FormattedMessage id="Product and Shipment Setting" />
            </Typography>
          </Grid>
          {/*----------------------Product Wise Storage--------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Product Wise Storage" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('storage_productwise', checked ? 'Y' : 'N')} />}
              checked={formik.values.storage_productwise === 'Y'}
              name="storage_productwise"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.storage_productwise}
            />
          </Grid>
          {/*----------------------Direct Shipment--------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Direct Shipment" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('dir_shpmnt', checked ? 'Y' : 'N')} />}
              checked={formik.values.dir_shpmnt === 'Y'}
              name="dir_shpmnt"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.dir_shpmnt}
            />
          </Grid>
          {/*----------------------Outbound Validate Exp Date--------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Outbound Validate Ext Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full"
                value={formik.values.validate_expdate ? dayjs(formik.values.validate_expdate) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('validate_expdate', newValue.toISOString());
                }}
              />
            </LocalizationProvider>
          </Grid>
          {/*----------------------Outbound Minimum Exp Period--------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Outbound Minimum Exp Period" />
            </InputLabel>
            <TextField
              size="small"
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              type="number"
              id="minperiod_exppick"
              name="minperiod_exppick"
              fullWidth
              value={formik.values.minperiod_exppick}
            />
          </Grid>
          {/*----------------------Inbound Exp Limit (days)--------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Inbound Exp Limit (days)" />
            </InputLabel>
            <TextField
              size="small"
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              type="number"
              id="rcpt_exp_limit"
              name="rcpt_exp_limit"
              fullWidth
              value={formik.values.rcpt_exp_limit}
            />
          </Grid>
          {/*----------------------Prepactual confirm Allow--------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Prepactual confirm Allow" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => formik.setFieldValue('perpectual_confirm_allow', checked ? 'Y' : 'N')} />}
              checked={formik.values.perpectual_confirm_allow === 'Y'}
              name="perpectual_confirm_allow"
              label={<FormattedMessage id="Yes/No" />}
              value={formik.values.perpectual_confirm_allow}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} marginTop={33.3}>
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

export default AddSettingsPrincipalWmsForm;
