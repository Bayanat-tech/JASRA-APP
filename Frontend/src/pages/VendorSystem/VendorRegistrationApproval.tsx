import { useState } from 'react';
import { Button, Grid, TextField, Autocomplete, Typography, Box, Paper, Tooltip } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TVendor } from './vendorTypes/TVendor';
import useAuth from 'hooks/useAuth';
import VendorRequestService from './services/VendorRequestService';
import { useQuery } from '@tanstack/react-query';
import { FormattedMessage, useIntl } from 'react-intl';
import UniversalDialog from 'components/popup/UniversalDialog';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import EnhancedVendorFilesDialog from '../VendorSystem/components/EnhancedVendorFilesDialog';
import { IoIosAttach } from 'react-icons/io';

// ✅ Validation
const validationSchema = Yup.object({
  VENDOR_NAME: Yup.string().required('Vendor Name is required'),
  VENDOR_ADDR1: Yup.string().required('Vendor Address  is required'),
  VENDOR_CONTACT1: Yup.string().required('Vendor Contact  is required'),
  VENDOR_EMAIL1: Yup.string().email('Invalid email format').required('Email is required'),
  VENDOR_CITY: Yup.string().required('City is required'),
  CR_NUMBER: Yup.string().required('CR Number is required')
});

const VendorRegistrationApproval = () => {
  const { user } = useAuth();
  const intl = useIntl();

  const initialValues: TVendor = {
    COMPANY_CODE: user?.company_code ?? '',
    AC_CODE: '',
    // AC_NAME: '',
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
    SERVICE_DATE: '',
    CR_NUMBER: '',
    CREDIT_PERIOD: '',
    CREDIT_AMOUNT: '',
    SALESMAN_CODE: '',
    SECTOR_CODE: '',
    BANK_SWIFT: '',
    BANK_AC_CODE: '',
    BANK_NAME: '',
    BS_CODE: '',
    BI_SUB_GROUP: '',
    BI_MAIN_GROUP: '',
    TERRITORY_CODE: '',
    TAX_COUNTRY: '',
    VAT_NO: '',
    BI_PL_BS_IND: '',
    BI_EXP_TYPE: '',
    BI_DEPT: ''
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          COMPANY_CODE: user?.company_code ?? ''
        };
        const response = await VendorRequestService.addVendorSystem(payload);
        if (response) {
          console.log('Vendor Added:', response);
          resetForm();
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  });

  const { data: vendorAccountData } = useQuery({
    queryKey: ['accounts', formik.values.AC_CODE],
    queryFn: () => VendorRequestService.getAccountsList('BSG', formik.values.AC_CODE ?? undefined),
    enabled: !!user?.company_code
  });

  // 🔹 Dialog state
  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'md' },
    title: intl.formatMessage({ id: 'UploadFiles' }) || 'Upload Files',
  });

  const handleUploadPopup = () => {
    setUploadFilesPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  return (
    <Box
      sx={{
        maxWidth: '1250px',
        mx: 'auto'
        // px: 2,
        // py: 3
      }}
    >
      {/* Page Title */}
      <Typography variant="h4" fontWeight="bold" mb={2}>
        <FormattedMessage id="Vendor Registration Approval" defaultMessage="Vendor Registration Approval" />
      </Typography>

      {/* Form Container */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit(e);
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <Autocomplete
                options={Array.isArray(vendorAccountData) ? vendorAccountData : []}
                getOptionLabel={(option) => (option?.AC_NAME ? `${option.AC_NAME} (${option.AC_CODE})` : '')}
                isOptionEqualToValue={(option, value) => option.AC_CODE === value.AC_CODE}
                value={vendorAccountData?.find((acc) => acc.AC_CODE === formik.values.AC_CODE) || null}
                onChange={(event, newValue) => formik.setFieldValue('AC_CODE', newValue?.AC_CODE || '')}
                renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'AccountName' }) || 'Account Name'}
                  variant="outlined" fullWidth />}
              />
            </Grid>

            <Grid item xs={5}>
              <TextField
                name="VENDOR_NAME"
                label={intl.formatMessage({ id: 'Vendor Name' }) || 'Vendor Name'}
                fullWidth
                value={formik.values.VENDOR_NAME}
                onChange={formik.handleChange}
                error={formik.touched.VENDOR_NAME && Boolean(formik.errors.VENDOR_NAME)}
                helperText={formik.touched.VENDOR_NAME && formik.errors.VENDOR_NAME}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                name="CR_NUMBER"
                label={intl.formatMessage({ id: 'CRNumber' }) || 'CR Number'}
                fullWidth
                value={formik.values.CR_NUMBER}
                onChange={formik.handleChange}
                error={formik.touched.CR_NUMBER && Boolean(formik.errors.CR_NUMBER)}
                helperText={formik.touched.CR_NUMBER && formik.errors.CR_NUMBER}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="VENDOR_ADDR1"
                label={intl.formatMessage({ id: 'Address' }) || 'Address'}
                fullWidth
                value={formik.values.VENDOR_ADDR1}
                onChange={formik.handleChange}
                error={formik.touched.VENDOR_ADDR1 && Boolean(formik.errors.VENDOR_ADDR1)}
                helperText={formik.touched.VENDOR_ADDR1 && formik.errors.VENDOR_ADDR1}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                name="VENDOR_ADDR2"
                label="Address 2"
                fullWidth
                value={formik.values.VENDOR_ADDR2}
                onChange={formik.handleChange}
              />
            </Grid> */}
            <Grid item xs={12} sm={4}>
              <TextField
                name="VENDOR_EMAIL2"
                label={intl.formatMessage({ id: 'Email' }) || 'Email'}
                type="email"
                fullWidth
                value={formik.values.VENDOR_EMAIL2}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                name="VENDOR_EMAIL1"
                label={intl.formatMessage({ id: 'Email' }) || 'Email'}
                type="email"
                fullWidth
                value={formik.values.VENDOR_EMAIL1}
                onChange={formik.handleChange}
                error={formik.touched.VENDOR_EMAIL1 && Boolean(formik.errors.VENDOR_EMAIL1)}
                helperText={formik.touched.VENDOR_EMAIL1 && formik.errors.VENDOR_EMAIL1}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                name="VENDOR_CONTACT1"
                label={intl.formatMessage({ id: 'Contact' }) || 'Contact'}
                fullWidth
                value={formik.values.VENDOR_CONTACT1}
                onChange={formik.handleChange}
                error={formik.touched.VENDOR_CONTACT1 && Boolean(formik.errors.VENDOR_CONTACT1)}
                helperText={formik.touched.VENDOR_CONTACT1 && formik.errors.VENDOR_CONTACT1}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                name="VENDOR_CONTACT2"
                label="Contact 2"
                fullWidth
                value={formik.values.VENDOR_CONTACT2}
                onChange={formik.handleChange}
              />
            </Grid> */}

            {/* <Grid item xs={12} sm={6}>
              <TextField
                name="VENDOR_EMAIL2"
                label="Email 2"
                type="email"
                fullWidth
                value={formik.values.VENDOR_EMAIL2}
                onChange={formik.handleChange}
              />
            </Grid> */}

            {/* <Grid item xs={12} sm={6}>
              <TextField
                name="VENDOR_EMAIL2"
                label="Fax 2"
                type="email"
                fullWidth
                value={formik.values.VENDOR_EMAIL2}
                onChange={formik.handleChange}
              />
            </Grid> */}

            <Grid item xs={12} sm={3}>
              <TextField
                name="VENDOR_CITY"
                label={intl.formatMessage({ id: 'City' }) || 'City'}
                fullWidth
                value={formik.values.VENDOR_CITY}
                onChange={formik.handleChange}
                error={formik.touched.VENDOR_CITY && Boolean(formik.errors.VENDOR_CITY)}
                helperText={formik.touched.VENDOR_CITY && formik.errors.VENDOR_CITY}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="COUNTRY_CODE"
                label={intl.formatMessage({ id: 'Country' }) || 'Country'}
                fullWidth
                value={formik.values.COUNTRY_CODE}
                onChange={formik.handleChange}
                error={formik.touched.COUNTRY_CODE && Boolean(formik.errors.COUNTRY_CODE)}
                helperText={formik.touched.COUNTRY_CODE && formik.errors.COUNTRY_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="VENDOR_CITY"
                label={intl.formatMessage({ id: 'Department' }) || 'Department'}
                fullWidth
                value={formik.values.COUNTRY_CODE}
                onChange={formik.handleChange}
                error={formik.touched.COUNTRY_CODE && Boolean(formik.errors.COUNTRY_CODE)}
                helperText={formik.touched.COUNTRY_CODE && formik.errors.COUNTRY_CODE}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                name="CREDIT_PERIOD"
                label={intl.formatMessage({ id: 'CreditPeriod' }) || 'Credit Period'}
                fullWidth
                value={formik.values.CREDIT_PERIOD}
                onChange={formik.handleChange}
                error={formik.touched.CREDIT_PERIOD && Boolean(formik.errors.CREDIT_PERIOD)}
                helperText={formik.touched.CREDIT_PERIOD && formik.errors.CREDIT_PERIOD}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="CREDIT_AMOUNT"
                label={intl.formatMessage({ id: 'CreditAmount' }) || 'Credit Amount'}
                fullWidth
                value={formik.values.CREDIT_AMOUNT}
                onChange={formik.handleChange}
                error={formik.touched.CREDIT_AMOUNT && Boolean(formik.errors.CREDIT_AMOUNT)}
                helperText={formik.touched.CREDIT_AMOUNT && formik.errors.CREDIT_AMOUNT}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                name="SALESMAN_CODE"
                label={intl.formatMessage({ id: 'Salesman' }) || 'Salesman'}
                fullWidth
                value={formik.values.SALESMAN_CODE}
                onChange={formik.handleChange}
                error={formik.touched.SALESMAN_CODE && Boolean(formik.errors.SALESMAN_CODE)}
                helperText={formik.touched.SALESMAN_CODE && formik.errors.SALESMAN_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="SECTOR_CODE"
                label={intl.formatMessage({ id: 'Sector' }) || 'Sector'}
                fullWidth
                value={formik.values.SECTOR_CODE}
                onChange={formik.handleChange}
                error={formik.touched.SECTOR_CODE && Boolean(formik.errors.SECTOR_CODE)}
                helperText={formik.touched.SECTOR_CODE && formik.errors.SECTOR_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BANK_SWIFT"
                label={intl.formatMessage({ id: 'Swift' }) || 'Swift'}
                fullWidth
                value={formik.values.BANK_SWIFT}
                onChange={formik.handleChange}
                error={formik.touched.BANK_SWIFT && Boolean(formik.errors.BANK_SWIFT)}
                helperText={formik.touched.BANK_SWIFT && formik.errors.BANK_SWIFT}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BANK_AC_CODE"
                label={intl.formatMessage({ id: 'BankA/ccode' }) || 'Bank A/c code'}
                fullWidth
                value={formik.values.BANK_AC_CODE}
                onChange={formik.handleChange}
                error={formik.touched.BANK_AC_CODE && Boolean(formik.errors.BANK_AC_CODE)}
                helperText={formik.touched.BANK_AC_CODE && formik.errors.BANK_AC_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BANK_NAME"
                label={intl.formatMessage({ id: 'BankName' }) || 'Bank Name'}
                fullWidth
                value={formik.values.BANK_NAME}
                onChange={formik.handleChange}
                error={formik.touched.BANK_NAME && Boolean(formik.errors.BANK_NAME)}
                helperText={formik.touched.BANK_NAME && formik.errors.BANK_NAME}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                name="COUNTRY_CODE"
                label={intl.formatMessage({ id: 'BSCode' }) || 'BS Code'}
                fullWidth
                value={formik.values.COUNTRY_CODE}
                onChange={formik.handleChange}
                error={formik.touched.COUNTRY_CODE && Boolean(formik.errors.COUNTRY_CODE)}
                helperText={formik.touched.COUNTRY_CODE && formik.errors.COUNTRY_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BI_SUB_GROUP"
                label={intl.formatMessage({ id: 'BISubGroupCode' }) || 'BI Sub Group Code'}
                fullWidth
                value={formik.values.BI_SUB_GROUP}
                onChange={formik.handleChange}
                error={formik.touched.BI_SUB_GROUP && Boolean(formik.errors.BI_SUB_GROUP)}
                helperText={formik.touched.BI_SUB_GROUP && formik.errors.BI_SUB_GROUP}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BI_MAIN_GROUP"
                label={intl.formatMessage({ id: 'BSMainGroup' }) || 'BS Main Group'}
                fullWidth
                value={formik.values.BI_MAIN_GROUP}
                onChange={formik.handleChange}
                error={formik.touched.BI_MAIN_GROUP && Boolean(formik.errors.BI_MAIN_GROUP)}
                helperText={formik.touched.BI_MAIN_GROUP && formik.errors.BI_MAIN_GROUP}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="TERRITORY_CODE"
                label={intl.formatMessage({ id: 'Territory' }) || 'Territory'}
                fullWidth
                value={formik.values.TERRITORY_CODE}
                onChange={formik.handleChange}
                error={formik.touched.TERRITORY_CODE && Boolean(formik.errors.TERRITORY_CODE)}
                helperText={formik.touched.COUNTRY_CODE && formik.errors.TERRITORY_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="VENDOR_CITY"
                label={intl.formatMessage({ id: 'Taxcountry' }) || 'Tax country'}
                fullWidth
                value={formik.values.COUNTRY_CODE}
                onChange={formik.handleChange}
                error={formik.touched.COUNTRY_CODE && Boolean(formik.errors.COUNTRY_CODE)}
                helperText={formik.touched.COUNTRY_CODE && formik.errors.COUNTRY_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="VENDOR_CITY"
                label={intl.formatMessage({ id: 'VatNo' }) || 'Vat No'}
                fullWidth
                value={formik.values.COUNTRY_CODE}
                onChange={formik.handleChange}
                error={formik.touched.COUNTRY_CODE && Boolean(formik.errors.COUNTRY_CODE)}
                helperText={formik.touched.COUNTRY_CODE && formik.errors.COUNTRY_CODE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BI_PL_BS_IND"
                label={intl.formatMessage({ id: 'BIPLBSIND' }) || 'BI PL BS IND'}
                fullWidth
                value={formik.values.BI_PL_BS_IND}
                onChange={formik.handleChange}
                error={formik.touched.BI_PL_BS_IND && Boolean(formik.errors.BI_PL_BS_IND)}
                helperText={formik.touched.BI_PL_BS_IND && formik.errors.BI_PL_BS_IND}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BI_EXP_TYPE"
                label={intl.formatMessage({ id: 'BIExptype' }) || 'BI Exp type'}
                fullWidth
                value={formik.values.BI_EXP_TYPE}
                onChange={formik.handleChange}
                error={formik.touched.BI_EXP_TYPE && Boolean(formik.errors.BI_EXP_TYPE)}
                helperText={formik.touched.BI_EXP_TYPE && formik.errors.BI_EXP_TYPE}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                name="BI_DEPT"
                label={intl.formatMessage({ id: 'BIDepartment' }) || 'BI Department'}
                fullWidth
                value={formik.values.BI_DEPT}
                onChange={formik.handleChange}
                error={formik.touched.BI_DEPT && Boolean(formik.errors.BI_DEPT)}
                helperText={formik.touched.BI_DEPT && formik.errors.BI_DEPT}
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12} mt={1}>
              {/* <Divider sx={{ mb: 2 }} /> */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button type="button" variant="contained" color="secondary" fullWidth onClick={() => formik.resetForm()}>
                    {intl.formatMessage({ id: 'Reject' }) || 'Reject'}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
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
                  >

                    {intl.formatMessage({ id: 'Submit' }) || 'Submit'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Attach Button Row */}
            <Grid item xs={12}>
              <Grid container justifyContent="flex-end">
                <Tooltip title="Attach & View">
                  <Button
                    type="button"
                    variant="outlined"
                    color="primary"
                    onClick={handleUploadPopup}
                    sx={{
                      fontSize: '0.895rem',
                      backgroundColor: '#082A89',
                      color: '#fff',
                      border: '1.5px solid #082A89',
                      mr: 2, // 🔹 Right margin
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#082A89',
                        color: '#fff',
                        border: '1.5px solid #082A89'
                      }
                    }}
                  >
                    {' '}
                    {intl.formatMessage({ id: 'Attach' }) || 'Attach'}
                    <IoIosAttach size={15} />
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Attach CRM Dialog */}
      {uploadFilesPopup?.action.open && (
        <UniversalDialog
          action={uploadFilesPopup.action}
          onClose={handleUploadPopup}
          title={uploadFilesPopup.title}
          hasPrimaryButton={false}
        >
          <EnhancedVendorFilesDialog requestNumber={formik.values.AC_CODE ?? ''} isViewMode={false} onClose={handleUploadPopup} />
        </UniversalDialog>
      )}
    </Box>
  );
};

export default VendorRegistrationApproval;
