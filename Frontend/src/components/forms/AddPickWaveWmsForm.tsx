import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPickWave } from 'pages/WMS/types/PickWave-wms.types';
import { useEffect } from 'react';
import pickwaveServiceInstance from 'service/GM/service.pickwave_wms';
import * as yup from 'yup';

const AddPickWaveWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TPickWave;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TPickWave>({
    initialValues: { wave_name: '', wave_code: '', indicator: 'A', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      wave_code: yup.string().required('This field is required'),
      wave_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await pickwaveServiceInstance.editPickWave(values);
      } else {
        response = await pickwaveServiceInstance.addPickWave(values);
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
  const handleIndicatorChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    formik.setFieldValue('indicator', checked ? 'D' : 'A');
  };
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...PickwaveData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(PickwaveData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>Wave Code*</InputLabel>
        <TextField
          value={formik.values.wave_code}
          name="Wave Code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'wave_code') && getIn(formik.errors, 'wave_code'))}
        />
        {getIn(formik.touched, 'wave_code') && getIn(formik.errors, 'wave_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'wave_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>Wave Name*</InputLabel>
        <TextField
          value={formik.values.wave_name}
          name="wave_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'wave_name') && getIn(formik.errors, 'wave_name'))}
        />
        {getIn(formik.touched, 'wave_name') && getIn(formik.errors, 'wave_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'wave_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Indicator</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleIndicatorChange} />}
          checked={formik.values.indicator === 'D'}
          name="indicator"
          label={'Yes/No'}
          value={formik.values.indicator}
        />
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

export default AddPickWaveWmsForm;
