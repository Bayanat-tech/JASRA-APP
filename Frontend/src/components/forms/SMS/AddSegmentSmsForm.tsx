import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { TSmsSegmentmaster } from 'types/SMS/sms.types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';

const AddSegmentSmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSmsSegmentmaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TSmsSegmentmaster>({
    initialValues: { segment_code: '', segment_name: '' },
    validationSchema: yup.object().shape({
      // Add validation
      segment_name: yup.string().required('This feild is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await SmscompanyServiceInstance.editsegmentmaster(values);
        } else {
          response = await SmscompanyServiceInstance.addsegmentmaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Segment updated successfully!' : 'Segment added successfully!',
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
        console.error('Error in segment master operation:', error);
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
          label="Segment Name*"
          value={formik.values.segment_name}
          name="segment_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'segment_name') && getIn(formik.errors, 'segment_name'))}
        />
        {getIn(formik.touched, 'segment_name') && getIn(formik.errors, 'segment_name') && (
          <FormHelperText error id="helper-text-segment_name">
            {getIn(formik.errors, 'segment_name')}
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

export default AddSegmentSmsForm;
