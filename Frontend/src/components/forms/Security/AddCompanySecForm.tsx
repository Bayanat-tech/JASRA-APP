// import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { TCompanymaster } from 'pages/Security/type/flowmaster-sec-types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import GmSecServiceInstance from 'service/security/services.gm_security';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';

const AddCompanySecForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TCompanymaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TCompanymaster>({
    initialValues: { company_code: '', company_name: '', address1: '', address2: '', address3: '', city: '', country: '' },
    validationSchema: yup.object().shape({
      // Add validation rules here if needed
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await GmSecServiceInstance.editcompanymaster(values);
        } else {
          response = await GmSecServiceInstance.addcompanymaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Company updated successfully!' : 'Company added successfully!',
              severity: 'success'
            })
          );
          onClose(true);
        } else {
          dispatch(
            showAlert({
              open: true,
              message: 'Operation failed. Please try again.',
              severity: 'error'
            })
          );
        }
      } catch (error) {
        console.error('Error in company master operation:', error);
        dispatch(
          showAlert({
            open: true,
            message: 'An unexpected error occurred!',
            severity: 'error'
          })
        );
      } finally {
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
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
        <TextField
          label="Company ID"
          value={formik.values.company_code}
          name="company_code"
          disabled={isEditMode === true}
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'company_code') && getIn(formik.errors, 'company_code'))}
        />
        {getIn(formik.touched, 'company_code') && getIn(formik.errors, 'company_code') && (
          <FormHelperText error id="helper-text-company_code">
            {getIn(formik.errors, 'company_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Company Name*"
          value={formik.values.company_name}
          name="company_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'company_name') && getIn(formik.errors, 'company_name'))}
        />
        {getIn(formik.touched, 'company_name') && getIn(formik.errors, 'company_name') && (
          <FormHelperText error id="helper-text-company_name">
            {getIn(formik.errors, 'company_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Address1"
          value={formik.values.address1}
          name="address1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'address1') && getIn(formik.errors, 'address1'))}
        />
        {getIn(formik.touched, 'address1') && getIn(formik.errors, 'address1') && (
          <FormHelperText error id="helper-text-address1">
            {getIn(formik.errors, 'address1')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Address2"
          value={formik.values.address2}
          name="address2"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'address2') && getIn(formik.errors, 'address2'))}
        />
        {getIn(formik.touched, 'address2') && getIn(formik.errors, 'address2') && (
          <FormHelperText error id="helper-text-address2">
            {getIn(formik.errors, 'address2')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Address3"
          value={formik.values.address3}
          name="address3"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'address3') && getIn(formik.errors, 'address3'))}
        />
        {getIn(formik.touched, 'address3') && getIn(formik.errors, 'address3') && (
          <FormHelperText error id="helper-text-address3">
            {getIn(formik.errors, 'address3')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="City"
          value={formik.values.city}
          name="city"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'city') && getIn(formik.errors, 'city'))}
        />
        {getIn(formik.touched, 'city') && getIn(formik.errors, 'city') && (
          <FormHelperText error id="helper-text-city">
            {getIn(formik.errors, 'city')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Country"
          value={formik.values.country}
          name="country"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'country') && getIn(formik.errors, 'country'))}
        />
        {getIn(formik.touched, 'country') && getIn(formik.errors, 'country') && (
          <FormHelperText error id="helper-text-country">
            {getIn(formik.errors, 'country')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} className="flex justify-start">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<IoSendSharp />}
          type="submit"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddCompanySecForm;
