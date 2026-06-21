import { Button, FormHelperText, Grid, TextField, Autocomplete } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TVendor } from './vendorTypes/TVendor';
import useAuth from 'hooks/useAuth';
import VendorRequestService from './services/VendorRequestService';
import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

const validationSchema = Yup.object({
  // VENDOR_CODE: Yup.string(),
  VENDOR_NAME: Yup.string().required('Vendor Name is required'),
  VENDOR_ADDR1: Yup.string().required('Vendor Address 1 is required'),
  VENDOR_CONTACT1: Yup.string().required('Vendor Contact 1 is required'),
  VENDOR_EMAIL1: Yup.string().email('Invalid email format').required('Email is required'),
  VENDOR_CITY: Yup.string().required('City is required')
});

const VendorRegistrationForm = () => {
  const { user } = useAuth();
  const intl = useIntl();


  const initialValues: TVendor = {
    COMPANY_CODE: user?.company_code ?? '',
    // VENDOR_CODE: 'VENDOR001',
    AC_CODE: '',
    CURR_CODE: '',
    COUNTRY_CODE: '',
    VENDOR_NAME: '',
    VENDOR_CODE: 'VENDOR001',
    VENDOR_ADDR1: '',
    VENDOR_ADDR2: '',
    VENDOR_ADDR3: '',
    VENDOR_ADDR4: '',
    VENDOR_CITY: '',
    VENDOR_CONTACT1: '',
    VENDOR_TELNO1: '',
    VENDOR_FAXNO1: '',
    VENDOR_EMAIL1: '',
    VENDOR_CONTACT2: '',
    VENDOR_TELNO2: '',
    VENDOR_FAXNO2: '',
    VENDOR_EMAIL2: '',
    VENDOR_CONTACT3: '',
    VENDOR_TELNO3: '',
    VENDOR_FAXNO3: '',
    VENDOR_REF1: '',
    VENDOR_REF2: '',
    VENDOR_REF3: '',
    SERVICE_DATE: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log('Form submitted with values:', values); // Debug log
      try {
        const payload = {
          ...values,
          COMPANY_CODE: user?.company_code ?? ''
        };

        console.log('Calling API with payload:', payload); // Debug log
        const response = await VendorRequestService.addVendorSystem(payload);
        console.log('API Response:', response); // Debug log

        if (response) {
          console.log('Success:', response);
          // Add success notification if needed
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        // Add error notification if needed
      }
    }
  });

  const { data: vendorAccountData } = useQuery({
    queryKey: ['accounts', formik.values.AC_CODE],
    queryFn: () => VendorRequestService.getAccountsList('BSG', formik.values.AC_CODE ?? undefined),
    enabled: !!formik.values.AC_CODE
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>  {intl.formatMessage({ id: 'VendorRegistrationForm' }) || 'Vendor Registration Form'}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted, isValid:', formik.isValid); // Debug log
          console.log('Form errors:', formik.errors); // Debug log
          formik.handleSubmit(e);
        }}
      >
        <Grid container spacing={2}>
          {/* Autocomplete */}
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={Array.isArray(vendorAccountData) ? vendorAccountData : []}
              getOptionLabel={(option) => {
                if (!option) return '';
                if (typeof option === 'string') return option;
                if (typeof option.AC_NAME === 'string') return option.AC_NAME;
                return '';
              }}
              isOptionEqualToValue={(option, value) => option.AC_CODE === value.AC_CODE}
              value={vendorAccountData?.find((acc) => acc.AC_CODE === formik.values.AC_CODE) || null}
              onChange={(event, newValue) => {
                formik.setFieldValue('AC_CODE', newValue?.AC_CODE || '');
              }}
              renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'AccountName' }) || 'Account Name'}
                variant="outlined" fullWidth />}
            />
          </Grid>

          {/* CR Number */}
          <Grid item xs={4}>
            <TextField
              name="CR_NUMBER"
              label={intl.formatMessage({ id: 'CRNumber' }) || 'CR Number'}
              fullWidth
              variant="outlined"
              value={formik.values.CR_NUMBER}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.CR_NUMBER && Boolean(formik.errors.CR_NUMBER)}
              helperText={formik.touched.CR_NUMBER && formik.errors.CR_NUMBER}
            />
          </Grid>
          {/* Vendor Code */}
          <Grid item xs={4}>
            <TextField
              name="AC_CODE"
              label={intl.formatMessage({ id: 'AccountCode' }) || 'Account Code'}
              fullWidth
              variant="outlined"
              value={formik.values.AC_CODE}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.AC_CODE && Boolean(formik.errors.AC_CODE)}
              helperText={formik.touched.AC_CODE && formik.errors.AC_CODE}
            />
          </Grid>

          {/* Vendor Name */}
          <Grid item xs={12}>
            <TextField
              name="VENDOR_NAME"
              label={intl.formatMessage({ id: 'VendorName' }) || 'Vendor Name'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_NAME}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_NAME && Boolean(formik.errors.VENDOR_NAME)}
              helperText={formik.touched.VENDOR_NAME && formik.errors.VENDOR_NAME}
            />
          </Grid>

          {/* Address 1 */}
          <Grid item xs={4}>
            <TextField
              name="VENDOR_ADDR1"
              label={intl.formatMessage({ id: 'Address1' }) || 'Address 1'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_ADDR1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_ADDR1 && Boolean(formik.errors.VENDOR_ADDR1)}
              helperText={formik.touched.VENDOR_ADDR1 && formik.errors.VENDOR_ADDR1}
            />
          </Grid>

          {/* Address 2 */}
          <Grid item xs={4}>
            <TextField
              name="VENDOR_ADDR2"
              label={intl.formatMessage({ id: 'Address2' }) || 'Address 2'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_ADDR2}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_ADDR2 && Boolean(formik.errors.VENDOR_ADDR2)}
              helperText={formik.touched.VENDOR_ADDR2 && formik.errors.VENDOR_ADDR2}
            />
          </Grid>

          {/* Address 3 */}
          <Grid item xs={4}>
            <TextField
              name="VENDOR_ADDR3"
              label={intl.formatMessage({ id: 'Address3' }) || 'Address 3'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_ADDR3}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_ADDR3 && Boolean(formik.errors.VENDOR_ADDR3)}
              helperText={formik.touched.VENDOR_ADDR3 && formik.errors.VENDOR_ADDR3}
            />
          </Grid>

          {/* Contact 1 */}
          <Grid item xs={4}>
            <TextField
              name="VENDOR_CONTACT1"
              label={intl.formatMessage({ id: 'Contact 1' }) || 'Contact 1'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_CONTACT1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_CONTACT1 && Boolean(formik.errors.VENDOR_CONTACT1)}
              helperText={formik.touched.VENDOR_CONTACT1 && formik.errors.VENDOR_CONTACT1}
            />
          </Grid>

          {/* Contact 2 */}
          <Grid item xs={4}>
            <TextField
              name="VENDOR_CONTACT2"
              label={intl.formatMessage({ id: 'Contact 2' }) || 'Contact 2'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_CONTACT2}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_CONTACT2 && Boolean(formik.errors.VENDOR_CONTACT2)}
              helperText={formik.touched.VENDOR_CONTACT2 && formik.errors.VENDOR_CONTACT2}
            />
          </Grid>

          {/* Contact 3 */}
          <Grid item xs={4}>
            <TextField
              name="VENDOR_CONTACT3"
              label={intl.formatMessage({ id: 'Contact 3' }) || 'Contact 3'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_CONTACT3}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_CONTACT3 && Boolean(formik.errors.VENDOR_CONTACT3)}
              helperText={formik.touched.VENDOR_CONTACT3 && formik.errors.VENDOR_CONTACT3}
            />
          </Grid>

          {/* Email 1 */}
          <Grid item xs={6}>
            <TextField
              name="VENDOR_EMAIL1"
              label={intl.formatMessage({ id: 'Email 1' }) || 'Email 1'}
              type="email"
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_EMAIL1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_EMAIL1 && Boolean(formik.errors.VENDOR_EMAIL1)}
              helperText={formik.touched.VENDOR_EMAIL1 && formik.errors.VENDOR_EMAIL1}
              inputProps={{
                style: {}
              }}
            />
          </Grid>

          {/* Email 2 */}
          <Grid item xs={6}>
            <TextField
              name="VENDOR_EMAIL2"
              label={intl.formatMessage({ id: 'Email 2' }) || 'Email 2'}
              type="email"
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_EMAIL2}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_EMAIL2 && Boolean(formik.errors.VENDOR_EMAIL2)}
              helperText={formik.touched.VENDOR_EMAIL2 && formik.errors.VENDOR_EMAIL2}
            />
          </Grid>

          {/* City */}
          <Grid item xs={12}>
            <TextField
              name="VENDOR_CITY"
              label={intl.formatMessage({ id: 'City' }) || 'City'}
              fullWidth
              variant="outlined"
              value={formik.values.VENDOR_CITY}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.VENDOR_CITY && Boolean(formik.errors.VENDOR_CITY)}
              helperText={formik.touched.VENDOR_CITY && formik.errors.VENDOR_CITY}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => console.log('Submit button clicked')} // Debug log
            >
              {intl.formatMessage({ id: 'Submit' }) || 'Submit'}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button type="button" variant="contained" color="secondary" fullWidth onClick={() => formik.resetForm()}>
              {intl.formatMessage({ id: 'Cancel' }) || 'Cancel'}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <FormHelperText>{intl.formatMessage({ id: 'RequiredFieldsNote' }) || 'All required fields are marked'}</FormHelperText>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default VendorRegistrationForm;
