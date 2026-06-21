import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPartner } from 'pages/WMS/types/partner-wms.types';
import { useEffect } from 'react';
import PartnerServiceInstance from 'service/GM/service.partner_wms';
import * as yup from 'yup';

const AddPartnerWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TPartner;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TPartner>({
    initialValues: {
      broker_code: '',
      broker_name: '',
      broker_addr1: '',
      broker_city: '',
      broker_contact1: '',
      broker_telno1: '',
      broker_email1: '',
      //broker_stat: '',
      company_code: user?.company_code
    },

    validationSchema: yup.object().shape({
      broker_code: yup.string().required('This field is required'),
      broker_name: yup.string().required('This field is required'),
      broker_addr1: yup.string().required('This field is required'),
      broker_city: yup.string().required('This field is required'),
      broker_contact1: yup.string().required('This field is required'),
      broker_telno1: yup.string().required('This field is required'),
      broker_email1: yup.string().required('This field is required')
      //  broker_stat: yup.string().required('This field is required')
    }),

    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await PartnerServiceInstance.editPartner(values);
      } else {
        response = await PartnerServiceInstance.addPartner(values);
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
      const { updated_at, updated_by, created_at, created_by, ...partnerData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(partnerData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={6}>
        <InputLabel>Partner Code*</InputLabel>
        <TextField
          value={formik.values.broker_code}
          name="broker_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'broker_code') && getIn(formik.errors, 'broker_code'))}
        />
        {getIn(formik.touched, 'broker_code') && getIn(formik.errors, 'broker_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_code')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={12}>
        <InputLabel>Partner Name*</InputLabel>
        <TextField
          value={formik.values.broker_name}
          name="broker_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'broker_name') && getIn(formik.errors, 'broker_name'))}
        />
        {getIn(formik.touched, 'broker_name') && getIn(formik.errors, 'broker_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_name')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={12}>
        <InputLabel>Address*</InputLabel>
        <TextField
          value={formik.values.broker_addr1}
          name="broker_addr1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'broker_addr1') && getIn(formik.errors, 'broker_addr1'))}
        />
        {getIn(formik.touched, 'broker_addr1') && getIn(formik.errors, 'broker_addr1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_addr1')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>City*</InputLabel>
        <TextField
          value={formik.values.broker_city}
          name="broker_city"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'broker_city') && getIn(formik.errors, 'broker_city'))}
        />
        {getIn(formik.touched, 'broker_city') && getIn(formik.errors, 'broker_city') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_city')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={12} md={6}>
        <InputLabel>Contact Person*</InputLabel>
        <TextField
          value={formik.values.broker_contact1}
          name="broker_contact1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'broker_contact1') && getIn(formik.errors, 'broker_contact1'))}
        />
        {getIn(formik.touched, 'broker_contact1') && getIn(formik.errors, 'broker_contact1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_contact1')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={12} md={6}>
        <InputLabel>Telephone*</InputLabel>
        <TextField
          value={formik.values.broker_telno1}
          name="broker_telno1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'broker_telno1') && getIn(formik.errors, 'broker_telno1'))}
        />
        {getIn(formik.touched, 'broker_telno1') && getIn(formik.errors, 'broker_telno1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_telno1')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={12} md={6}>
        <InputLabel>Email*</InputLabel>
        <TextField
          value={formik.values.broker_email1}
          name="broker_email1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'broker_email1') && getIn(formik.errors, 'broker_email1'))}
        />
        {getIn(formik.touched, 'broker_email1') && getIn(formik.errors, 'broker_email1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'broker_email1')}
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

export default AddPartnerWmsForm;
