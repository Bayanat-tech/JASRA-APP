import { useEffect } from 'react';
import { useFormik } from 'formik';
import { Typography, Grid, InputLabel, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import VendorRequestService from './services/VendorRequestService';
import useAuth from 'hooks/useAuth';
import { openBackdrop, closeBackdrop } from 'store/reducers/backdropSlice';
import { dispatch } from 'store';

export interface IAccount {
  AC_CODE: string;
  AC_NAME: string;
  COMPANY_CODE: string;
  CURR_CODE: string;
  ADDRESS: string;
  FAX: string;
  PHONE: string;
  SALESMAN_CODE: string;
  SECTOR_CODE: string;
  INVOICE_NUMBER: string;
  INVOICE_DATE: string;
  EMAIL: string;
  MOBILE: string;
  DEPT_CODE: string;
  TAX_COUNTRY_CODE: string;
  CONTACT_PERSON: string;
  TERRITORY_CODE: string;
  COUNTRY_CODE: string;
}


const VendorProfile = () => {
  const { user } = useAuth();

  // 1. Call API with react-query
  const {
    data: accounts = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery<IAccount[], Error>({
    queryKey: ['accounts', user?.loginid],
    queryFn: async () => {
      const res = await VendorRequestService.getAccountsList('BSG', user?.loginid ?? '');
      return res ?? []; // always return array
    },
    enabled: !!user?.loginid
  });

  // 🔹 Show/hide backdrop based on query status
  useEffect(() => {
    if (isFetching || isLoading) {
      dispatch(openBackdrop());
    } else {
      dispatch(closeBackdrop());
    }
  }, [isFetching, isLoading]);

  // 🔹 Handle API error
  useEffect(() => {
    if (isError && error) {
      console.error('Failed to fetch accounts:', error.message);
      dispatch(closeBackdrop());
    }
  }, [isError, error]);

  // 2. Setup Formik with empty defaults
  const formik = useFormik({
    initialValues: {
      AC_NAME: '',
      ADDRESS: '',
      PHONE: '',
      FAX: '',
      EMAIL: '',
      MOBILE: '',
      DEPARTMENT: '',
      TAX_COUNTRY: '',
      CONTACT_PERSON: '',
      CITY: '',
      TERRITORY: '',
      COUNTRY: ''
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    }
  });

  // 3. Update form values when API data arrives
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const account = accounts[0];
      formik.setValues({
        AC_NAME: account.AC_NAME || '',
        ADDRESS: account.ADDRESS || '',
        PHONE: account.PHONE || '',
        FAX: typeof account.FAX === 'string' ? account.FAX : '',
        EMAIL: account.EMAIL || '',
        MOBILE: account.MOBILE || '',
        DEPARTMENT: account.DEPT_CODE || '',
        TAX_COUNTRY: account.TAX_COUNTRY_CODE || '',
        CONTACT_PERSON: account.CONTACT_PERSON || '',
        CITY: '', // API doesn't provide city separately
        TERRITORY: account.TERRITORY_CODE || '',
        COUNTRY: account.COUNTRY_CODE || ''
      });
    }
  }, [accounts]);

  if (isLoading) return null;

  return (
    <form>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black py-2 font-semibold">
            <FormattedMessage id="Personal Information" />
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Account Name" />
          </InputLabel>
          <TextField size="small" name="AC_NAME" fullWidth value={formik.values.AC_NAME} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Address" />
          </InputLabel>
          <TextField size="small" name="ADDRESS" fullWidth value={formik.values.ADDRESS} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="City" />
          </InputLabel>
          <TextField size="small" name="CITY" fullWidth value={formik.values.CITY} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Territory" />
          </InputLabel>
          <TextField size="small" name="TERRITORY" fullWidth value={formik.values.TERRITORY} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Country" />
          </InputLabel>
          <TextField size="small" name="COUNTRY" fullWidth value={formik.values.COUNTRY} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Department" />
          </InputLabel>
          <TextField size="small" name="DEPARTMENT" fullWidth value={formik.values.DEPARTMENT} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Tax Country" />
          </InputLabel>
          <TextField size="small" name="TAX_COUNTRY" fullWidth value={formik.values.TAX_COUNTRY} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Phone" />
          </InputLabel>
          <TextField size="small" name="PHONE" fullWidth value={formik.values.PHONE} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Fax" />
          </InputLabel>
          <TextField size="small" name="FAX" fullWidth value={formik.values.FAX} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Email" />
          </InputLabel>
          <TextField size="small" name="EMAIL" fullWidth value={formik.values.EMAIL} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Mobile" />
          </InputLabel>
          <TextField size="small" name="MOBILE" fullWidth value={formik.values.MOBILE} InputProps={{ readOnly: true }} />
        </Grid>

        <Grid item xs={6}>
          <InputLabel>
            <FormattedMessage id="Contact Person" />
          </InputLabel>
          <TextField size="small" name="CONTACT_PERSON" fullWidth value={formik.values.CONTACT_PERSON} InputProps={{ readOnly: true }} />
        </Grid>
      </Grid>
    </form>
  );
};

export default VendorProfile;
