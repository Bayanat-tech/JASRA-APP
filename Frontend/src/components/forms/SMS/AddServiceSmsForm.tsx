import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { TSmsServicemaster } from 'types/SMS/sms.types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';

const AddServiceSmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSmsServicemaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TSmsServicemaster>({
    initialValues: { service_code: '', service_name: '' },
    validationSchema: yup.object().shape({
      //validation
      service_name: yup.string().required('This feild is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await SmscompanyServiceInstance.editservicemaster(values);
        } else {
          response = await SmscompanyServiceInstance.addservicemaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Service updated successfully!' : 'Service added successfully!',
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
        console.error('Error in service master operation:', error);
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
          label="Service Name*"
          value={formik.values.service_name}
          name="service_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'service_name') && getIn(formik.errors, 'service_name'))}
        />
        {getIn(formik.touched, 'service_name') && getIn(formik.errors, 'service_name') && (
          <FormHelperText error id="helper-text-service_name">
            {getIn(formik.errors, 'service_name')}
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

export default AddServiceSmsForm;
