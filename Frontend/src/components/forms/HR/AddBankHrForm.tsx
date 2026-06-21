import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TBank } from 'pages/HR/type/Bank-hr.types';
import BankServiceInstance from 'service/HR/service.bank_hr';
import { useEffect } from 'react';
import * as yup from 'yup';
const AddBankWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TBank;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TBank>({
    initialValues: {
      bank_name: '',
      bank_code: '',
      bank_short_name: '',
      main_bank_code: '',
      country_code: '',
      bank_addr1: '',
      phone: '',
      fax: '',
      email: '',
      // remarks: '',
      // status: '',
      company_code: user?.company_code
    },
    validationSchema: yup.object().shape({
      bank_code: yup.string().required('This field is required'),
      bank_name: yup.string().required('This field is required'),
      main_bank_code: yup.string().required('This field is required'),
      bank_addr1: yup.string().required('This field is required'),
      counrty_code: yup.string().required('This field is required')
      // status: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await BankServiceInstance.editBank(values);
      } else {
        response = await BankServiceInstance.addBank(values);
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
      const { updated_at, updated_by, created_at, created_by, ...BankData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(BankData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={4}>
        <InputLabel>Bank Code*</InputLabel>
        <TextField
          value={formik.values.bank_code}
          name="bank_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'bank_code') && getIn(formik.errors, 'bank_code'))}
        />
        {getIn(formik.touched, 'bank_code') && getIn(formik.errors, 'bank_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'bank_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <InputLabel>Bank Name*</InputLabel>
        <TextField
          value={formik.values.bank_name}
          name="bank_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'bank_name') && getIn(formik.errors, 'bank_name'))}
        />
        {getIn(formik.touched, 'bank_name') && getIn(formik.errors, 'bank_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'bank_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Main Bank Code*</InputLabel>
        <TextField
          value={formik.values.main_bank_code}
          name="main_bank_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'main_bank_code') && getIn(formik.errors, 'main_bank_code'))}
        />
        {getIn(formik.touched, 'main_bank_code') && getIn(formik.errors, 'main_bank_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'main_bank_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Address*</InputLabel>
        <TextField
          value={formik.values.bank_addr1}
          name="bank_addr1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'bank_addr1') && getIn(formik.errors, 'bank_addr1'))}
        />
        {getIn(formik.touched, 'bank_addr1') && getIn(formik.errors, 'bank_addr1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'bank_addr1')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Country</InputLabel>
        <TextField
          value={formik.values.country_code}
          name="country_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code'))}
        />
        {getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'country_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Phone</InputLabel>
        <TextField
          value={formik.values.phone}
          name="phone"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'phone') && getIn(formik.errors, 'phone'))}
        />
        {getIn(formik.touched, 'phone') && getIn(formik.errors, 'phone') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'phone')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Fax</InputLabel>
        <TextField
          value={formik.values.fax}
          name="fax"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'fax') && getIn(formik.errors, 'fax'))}
        />
        {getIn(formik.touched, 'fax') && getIn(formik.errors, 'fax') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'fax')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>Email</InputLabel>
        <TextField
          value={formik.values.email}
          name="email"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'email') && getIn(formik.errors, 'email'))}
        />
        {getIn(formik.touched, 'email') && getIn(formik.errors, 'email') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'email')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <InputLabel>Remarks</InputLabel>
        <TextField
          value={formik.values.remarks}
          name="remarks"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks'))}
        />
        {getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'remarks')}
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

export default AddBankWmsForm;
