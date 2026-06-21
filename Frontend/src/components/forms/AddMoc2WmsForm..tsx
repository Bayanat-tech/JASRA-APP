import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
//import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel } from '@mui/material';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { Tmoc2 } from 'pages/WMS/types/moc2-wms.types';
import { useEffect } from 'react';
import GmServiceInstance from 'service/wms/services.gm_wms';
import * as yup from 'yup';

const AddMoc2WmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: Tmoc2;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<Tmoc2>({
    initialValues: { description: '', charge_code: '', charge_type: '', activity_group_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      charge_code: yup.string().required('This field is required'),
      description: yup.string().required('This field is required'),
      charge_type: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await GmServiceInstance.editMoc(values);
      } else {
        response = await GmServiceInstance.addMoc(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  useEffect(() => {
    console.log(formik.errors);
  }, [formik.errors]);
  //   //------------------Handlers------------
  //   const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //     formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  //   };
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>Charge Code*</InputLabel>
        <TextField
          value={formik.values.charge_code}
          name="charge_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'charge_code') && getIn(formik.errors, 'charge_code'))}
        />
        {getIn(formik.touched, 'charge_code') && getIn(formik.errors, 'charge_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'charge_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Description*</InputLabel>
        <TextField
          value={formik.values.description}
          name="description"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'description') && getIn(formik.errors, 'description'))}
        />
        {getIn(formik.touched, 'description') && getIn(formik.errors, 'description') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'description')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Activity Group*</InputLabel>
        <TextField
          value={formik.values.activity_group_code}
          name="Activity Group"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'activity group code') && getIn(formik.errors, 'activity group code'))}
        />
        {getIn(formik.touched, 'activity group code') && getIn(formik.errors, 'activity group code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'activity group code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Charge Type*</InputLabel>
        <TextField
          value={formik.values.charge_type}
          name="Charge Type"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'charge type') && getIn(formik.errors, 'charge type'))}
        />
        {getIn(formik.touched, 'charge type') && getIn(formik.errors, 'charge type') && (
          <FormHelperText error id="helper_text_first_name">
            {getIn(formik.errors, 'charge type')}
          </FormHelperText>
        )}
      </Grid>
      {/* 
      <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Is gcc?</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleCountryGccChange} />}
          checked={formik.values.country_gcc === 'Y'}
          name="country_gcc"
          label={'Yes/No'}
          value={formik.values.country_gcc}
        />
      </Grid>
       */}
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
export default AddMoc2WmsForm;
