import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { TSmsSalesmaster } from 'types/SMS/sms.types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';

const AddSalesmanSmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSmsSalesmaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TSmsSalesmaster>({
    initialValues: { sales_code: '', sales_name: '' },
    validationSchema: yup.object().shape({
      //  validation
      sales_name: yup.string().required('This feild is required'),
      contact_no: yup.string().required('This feild is required'),
      email: yup.string().required('This feild is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await SmscompanyServiceInstance.editsalesmaster(values);
        } else {
          response = await SmscompanyServiceInstance.addsalesmaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Salesman updated successfully!' : 'Salesman added successfully!',
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
        console.error('Error in salesman master operation:', error);
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
          label="Salesman Code"
          value={formik.values.sales_code}
          name="sales_code"
          disabled={isEditMode === false}
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'sales_code') && getIn(formik.errors, 'sales_code'))}
        />
        {getIn(formik.touched, 'sales_code') && getIn(formik.errors, 'sales_code') && (
          <FormHelperText error id="helper-text-sales_code">
            {getIn(formik.errors, 'sales_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Salesman Name*"
          value={formik.values.sales_name}
          name="sales_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'sales_name') && getIn(formik.errors, 'sales_name'))}
        />
        {getIn(formik.touched, 'sales_name') && getIn(formik.errors, 'sales_name') && (
          <FormHelperText error id="helper-text-sales_name">
            {getIn(formik.errors, 'sales_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Contact Number*"
          value={formik.values.contact_no}
          name="contact_no"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'contact_no') && getIn(formik.errors, 'contact_no'))}
        />
        {getIn(formik.touched, 'contact_no') && getIn(formik.errors, 'contact_no') && (
          <FormHelperText error id="helper-text-contact_no">
            {getIn(formik.errors, 'contact_no')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Salesman Email*"
          value={formik.values.email}
          name="email"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'email') && getIn(formik.errors, 'email'))}
        />
        {getIn(formik.touched, 'email') && getIn(formik.errors, 'email') && (
          <FormHelperText error id="helper-text-email">
            {getIn(formik.errors, 'email')}
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

export default AddSalesmanSmsForm;
