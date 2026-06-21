import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TVessel } from 'pages/WMS/types/vessel-wms.types';
import { useEffect } from 'react';
import vesselServiceInstance from 'service/GM/service.vessel_wms';
import * as yup from 'yup';

const AddVesselWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TVessel;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TVessel>({
    initialValues: {
      vessel_name: '',
      vessel_code: '',
      contact_person: '',
      address: '',
      company_code: user?.company_code
    },
    validationSchema: yup.object().shape({
      vessel_code: yup.string().required('This field is required'),
      vessel_name: yup.string().required('This field is required'),
      contact_person: yup.string().required('This field is required'),
      address: yup.string().required('This field is required')
      // tel_no: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await vesselServiceInstance.editVessel(values);
      } else {
        response = await vesselServiceInstance.addVessel(values);
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
      const { updated_at, updated_by, created_at, created_by, ...VesselData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(VesselData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Vessel Code*</InputLabel>
        <TextField
          value={formik.values.vessel_code}
          name="vessel_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'vessel_code') && getIn(formik.errors, 'vessel_code'))}
        />
        {getIn(formik.touched, 'vessel_code') && getIn(formik.errors, 'vessel_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'vessel_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>vessel Name*</InputLabel>
        <TextField
          value={formik.values.vessel_name}
          name="vessel_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'vessel_name') && getIn(formik.errors, 'vessel_name'))}
        />
        {getIn(formik.touched, 'vessel_name') && getIn(formik.errors, 'vessel_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'vessel_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={3}>
        <InputLabel>Contact Person*</InputLabel>
        <TextField
          value={formik.values.contact_person}
          name="contact_person"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'contact_person') && getIn(formik.errors, 'contact_person'))}
        />
        {getIn(formik.touched, 'contact_person') && getIn(formik.errors, 'contact_person') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'contact_person')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={9}>
        <InputLabel>Address*</InputLabel>
        <TextField
          value={formik.values.address}
          name="address"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'address') && getIn(formik.errors, 'address'))}
        />
        {getIn(formik.touched, 'address') && getIn(formik.errors, 'address') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'address')}
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

export default AddVesselWmsForm;
