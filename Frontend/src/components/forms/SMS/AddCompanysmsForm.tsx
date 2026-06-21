import { Button, FormHelperText, Grid, MenuItem, TextField } from '@mui/material';
import { getIn, useFormik } from 'formik';
import { TSmsCompanymaster } from 'types/SMS/sms.types';
import { useEffect, useState } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import { countries, getCities } from 'data/countryCity';

const AddCompanySmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSmsCompanymaster;
}) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const formik = useFormik<TSmsCompanymaster>({
    initialValues: {
      company_name: '',
      address: '',
      city: '',
      country: ''
    },
    validationSchema: yup.object().shape({
      company_name: yup.string().required('Company name is required'),
      country: yup.string().required('Country is required'),
      city: yup.string().required('City is required'),
      address: yup.string().required('Address is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await SmscompanyServiceInstance.editcompanymaster(values);
        } else {
          response = await SmscompanyServiceInstance.addcompanymaster(values);
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

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // Handle country change
  const handleCountryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCountry = event.target.value;
    formik.setFieldValue('country', selectedCountry);
    formik.setFieldValue('city', '');
    const cities = getCities(selectedCountry);
    setAvailableCities(cities);
  };

  // Load cities when editing existing data
  useEffect(() => {
    if (isEditMode && existingData.country) {
      setAvailableCities(getCities(existingData.country));
    }
  }, [isEditMode, existingData]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <TextField
          label="Lead Name*"
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
      <Grid item xs={12}>
        <TextField
          label="Address*"
          value={formik.values.address}
          name="address"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'address') && getIn(formik.errors, 'address'))}
        />
        {getIn(formik.touched, 'address') && getIn(formik.errors, 'address') && (
          <FormHelperText error id="helper-text-address">
            {getIn(formik.errors, 'address')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Country*"
          name="country"
          value={formik.values.country}
          onChange={handleCountryChange}
          error={formik.touched.country && Boolean(formik.errors.country)}
          helperText={formik.touched.country && formik.errors.country}
        >
          <MenuItem value="">Select Country</MenuItem>
          {countries.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="City*"
          name="city"
          value={formik.values.city}
          onChange={formik.handleChange}
          disabled={!formik.values.country}
          error={formik.touched.city && Boolean(formik.errors.city)}
          helperText={formik.touched.city && formik.errors.city}
        >
          <MenuItem value="">Select City</MenuItem>
          {availableCities.map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>
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

export default AddCompanySmsForm;
