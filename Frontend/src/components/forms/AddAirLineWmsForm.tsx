import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TAirLine } from 'pages/WMS/types/airline-wms.types';
import { useEffect } from 'react';
import airlineServiceInstance from 'service/GM/service.airline_wms';
import * as yup from 'yup';

const AddAirLineWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TAirLine;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TAirLine>({
    initialValues: { airline_name: '', airline_code: '', airline_no: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      airline_code: yup.string().required('This field is required'),
      airline_name: yup.string().required('This field is required'),
      airline_no: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await airlineServiceInstance.editAirLine(values);
      } else {
        response = await airlineServiceInstance.addAirLine(values);
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
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...AirLineData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(AirLineData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={6}>
        <InputLabel>AirLine Code*</InputLabel>
        <TextField
          value={formik.values.airline_code}
          name="airline_code"
          onChange={formik.handleChange}
          // className="w-28"
          fullWidth
          error={Boolean(getIn(formik.touched, 'airline_code') && getIn(formik.errors, 'airline_code'))}
        />
        {getIn(formik.touched, 'airline_code') && getIn(formik.errors, 'airline_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'airline_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>AirLine No*</InputLabel>
        <TextField
          value={formik.values.airline_no}
          name="airline_no"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'airline_no') && getIn(formik.errors, 'airline_no'))}
        />
        {getIn(formik.touched, 'airline_no') && getIn(formik.errors, 'airline_no') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'airline_no')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={12}>
        <InputLabel>AirLine Name*</InputLabel>
        <TextField
          value={formik.values.airline_name}
          name="airline_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'airline_name') && getIn(formik.errors, 'airline_name'))}
        />
        {getIn(formik.touched, 'airline_name') && getIn(formik.errors, 'airline_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'airline_name')}
          </FormHelperText>
        )}
      </Grid>
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

export default AddAirLineWmsForm;
