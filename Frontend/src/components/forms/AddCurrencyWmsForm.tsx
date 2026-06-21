import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { useEffect } from 'react';
//import GmServiceInstance from 'service/wms/services.gm_wms';
import currencyServiceInstance from 'service/GM/service.currency_wms';
import * as yup from 'yup';

const AddCurrencyWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TCurrency;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TCurrency>({
    initialValues: {
      curr_code: '',
      curr_name: '',
      ex_rate: 0,
      company_code: user?.company_code,
      division: '',
      curr_sign: '',
      subdivision: 0
    },
    validationSchema: yup.object().shape({
      curr_code: yup.string().required('This field is required'),
      curr_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await currencyServiceInstance.editCurrency(values);
      } else {
        response = await currencyServiceInstance.addCurrency(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //   useEffect(() => {
  //     console.log(formik.errors);
  //   }, [formik.errors]);
  //   //------------------Handlers------------
  //   const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //     formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  //   };
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...currencyData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(currencyData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Currency Code*</InputLabel>
        <TextField
          value={formik.values.curr_code}
          name="curr_code"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'curr_code') && getIn(formik.errors, 'curr_code'))}
        />
        {getIn(formik.touched, 'curr_code') && getIn(formik.errors, 'curr_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'curr_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Currency Name*</InputLabel>
        <TextField
          value={formik.values.curr_name}
          name="curr_name"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'curr_name') && getIn(formik.errors, 'curr_name'))}
        />
        {getIn(formik.touched, 'curr_name') && getIn(formik.errors, 'curr_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'curr_name')}
          </FormHelperText>
        )}
      </Grid>
      {/* <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Is gcc?</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleCountryGccChange} />}
          checked={formik.values.country_gcc === 'Y'}
          name="country_gcc"
          label={'Yes/No'}
          value={formik.values.country_gcc}
        />
      </Grid> */}

      <Grid item xs={12} sm={3}>
        <InputLabel>Exchange Rate*</InputLabel>
        <TextField
          value={formik.values.ex_rate}
          name="ex_rate"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'ex_rate') && getIn(formik.errors, 'ex_rate'))}
        />
        {getIn(formik.touched, 'ex_rate') && getIn(formik.errors, 'ex_rate') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'ex_rate')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Division*</InputLabel>
        <TextField
          value={formik.values.division}
          name="division"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'division') && getIn(formik.errors, 'division'))}
        />
        {getIn(formik.touched, 'division') && getIn(formik.errors, 'division') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'division')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddCurrencyWmsForm;
