import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { TSmsDealmaster } from 'types/SMS/sms.types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';

const AddDealStatusSmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSmsDealmaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TSmsDealmaster>({
    initialValues: { deal_status: '' },
    validationSchema: yup.object().shape({
      //  validation
      deal_status: yup.string().required('This feild is required'),
      status_percentage: yup.number().required('This feild is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await SmscompanyServiceInstance.editdealmaster(values);
        } else {
          response = await SmscompanyServiceInstance.adddealmaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Deal Status updated successfully!' : 'Deal Status added successfully!',
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
        console.error('Error in deal status master operation:', error);
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
          label="Deal Status*"
          value={formik.values.deal_status}
          name="deal_status"
          //disabled={isEditMode === true}
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'deal_status') && getIn(formik.errors, 'deal_status'))}
        />
        {getIn(formik.touched, 'deal_status') && getIn(formik.errors, 'deal_status') && (
          <FormHelperText error id="helper-text-deal_status">
            {getIn(formik.errors, 'deal_status')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Deal status %*"
          value={formik.values.status_percentage}
          name="status_percentage"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'status_percentage') && getIn(formik.errors, 'status_percentage'))}
        />
        {getIn(formik.touched, 'status_percentage') && getIn(formik.errors, 'status_percentage') && (
          <FormHelperText error id="helper-text-status_percentage">
            {getIn(formik.errors, 'status_percentage')}
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

export default AddDealStatusSmsForm;
