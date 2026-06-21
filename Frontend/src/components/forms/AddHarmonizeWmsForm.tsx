import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { THarmonize } from 'pages/WMS/types/harmonize-wms.types';
import { useEffect } from 'react';
import GmServiceInstance from 'service/wms/services.gm_wms';
import * as yup from 'yup';

const AddHarmonizeWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: THarmonize;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<THarmonize>({
    initialValues: { harm_desc: '', harm_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      harm_code: yup.string().required('This field is required'),
      harm_desc: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await GmServiceInstance.editHarmonize(values);
      } else {
        response = await GmServiceInstance.addHarmonize(values);
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
  //------------------Handlers------------
  // const handleHarmonizeGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //   formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  // };
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
      <Grid item xs={12} sm={3}>
        <InputLabel>Harmonize Code*</InputLabel>
        <TextField
          value={formik.values.harm_code}
          name="harm_code"
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'harm_code') && getIn(formik.errors, 'harm_code'))}
        />
        {getIn(formik.touched, 'harm_code') && getIn(formik.errors, 'harm_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'harm_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Description*</InputLabel>
        <TextField
          value={formik.values.harm_desc}
          name="harm_desc"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'harm_desc') && getIn(formik.errors, 'harm_desc'))}
        />
        {getIn(formik.touched, 'harm_desc') && getIn(formik.errors, 'harm_desc') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'harm_desc')}
          </FormHelperText>
        )}
      </Grid>
      {/*
      <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Is gcc?</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleHarmonizeGccChange} />}
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
          // variant="contained"
           sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddHarmonizeWmsForm;
